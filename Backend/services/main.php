<?php

require_once "config.php";
require_once "db/ErrorManager.class.php";
require_once "db/MySQL.class.php";

$current_db = null;

function GetDbConnection() {
	global $current_db;

	if ($current_db == null) {
		$current_db = new Mysql();
		$current_db->connect($_ENV["db_server"], $_ENV["db_catalog"], $_ENV["db_user"], $_ENV["db_password"]);
	}
	return $current_db;
}

function checkRights($allowedGroups) {
	$user = getUserSelf();
	if ($user == null || !in_array($user["rights"], $allowedGroups)) {
		throw new Exception("Sie haben nicht die benötigten Rechte, um diese Aktion auszuführen.");
	}
}

function getUserSelf() {
	$result = null;
	if (isset($_SESSION["user_id"])) {
		$db = GetDbConnection();

		$users = $db->queryFetchAll("select * from `" . $_ENV["table_prefix"]
				. "users` where id = " . ((int) $_SESSION["user_id"]));
		if (count($users) > 0) {
			$result = $users[0];
			$result["password"] = PASSWORD_DUMMY;
			$result["confirmPassword"] = PASSWORD_DUMMY;
		}
	}
	return $result;
}

function logMessage($message, $is_error = false) {
	$fullMessage = date('Y-m-d H:i:s') . ' ';
	if ($is_error) {
		$fullMessage .= 'ERROR: ';
	}
	$fullMessage .= $message . "\r\n";

	$handle = fopen('log.txt', 'a');

	fwrite($handle, $fullMessage, strlen($fullMessage));

	fclose($handle);
}

$mailSettings = null;

function getMailSettings() {
	global $mailSettings;
	if ($mailSettings == null) {

		$db = GetDbConnection();

		$entries = $db->queryFetchAll("SELECT * from `" . $_ENV["table_prefix"] . "settings` S where S.key like 'mail_%'");
		$designPrefixLength = strlen('mail_');

		$mailS = array();
		for ($i = 0; $i < count($entries); $i++) {
			$key = $entries[$i]['key'];
			$key = substr($key, $designPrefixLength);
			$value = $entries[$i]['value'];
			$mailS[$key] = $value;
		}
		$mailSettings = $mailS;
	}
	return $mailSettings;
}

function sendMyMail($to, $subject, $body) {
	$settings = getMailSettings();

	if (isset($settings["sendMails"]) && $settings["sendMails"] == true) {
		if ($to != null && $to != "") {
			$header = '';
			if (isset($settings["from"])) {
				$header .= 'From:' . $settings["from"] . "\r\n";
			}

			$header .= 'X-Mailer: PHP/' . phpversion() . "\r\n";
			//$header .= 'Cc: ' . $headerInfo->ccaddress . "\r\n";
			//$header .= 'Bcc: ' . $headerInfo->bccaddress . "\r\n";
			$header .= 'Content-Type: text/plain;charset="utf-8"' . "\r\n";
			//$header .= 'Content-Transfer-Encoding: ' . "\r\n";

			$mailAccept = mail($to, $subject, $body, $header);

			if ($mailAccept) {
				logMessage("Es wurde die Mail mit folgendem Betreff versandt: " . $subject);
			} else {
				logMessage("Die Mail mit folgendem Betreff wurde nicht aktzeptiert: " . $subject);
			}
		} else {
			logMessage("Es ist kein Empfaenger angegeben.");
		}
	} else {
		logMessage("Das Versenden von Mails ist deaktiviert.");
	}
}


function UpdateEntities($table, $updates) {
	

	$db = GetDbConnection();

	$tableName = $db->escape_string($table);
	$tableNameWithPrefix = $_ENV["table_prefix"] . $tableName;

	checkTableRight($tableName, true);

	$updates = (array) $updates;
	if (isset($updates["toAdd"])) {

		if ($tableName == "player_match") {
			$toAdd = $updates["toAdd"];
			for ($i = 0; $i < count($toAdd); $i++) {
				if (is_string($toAdd[$i]->id_saison_player)) {
					// create a new player with that name
					$toAdd[$i]->id_saison_player = createNewPlayer($db, $toAdd[$i]->id_saison_player, 
							$toAdd[$i]->id_saison_team);
				}
				unset($toAdd[$i]->id_saison_team);
			}
		}

		if ($tableName == "users") {
			// hash password
			$toAdd = $updates["toAdd"];
			for ($i = 0; $i < count($toAdd); $i++) {
				$toAdd[$i]->password = hash(PASSWORD_HASH_ALGO, $toAdd[$i]->password);
			}
		}
		$db->addEntities($tableNameWithPrefix, $updates["toAdd"]);
	}

	if (isset($updates["toUpdate"])) {

		if ($tableName == "player_match") {
			$toUpdate = $updates["toUpdate"];
			for ($i = 0; $i < count($toUpdate); $i++) {
				unset($toUpdate[$i]->id_saison_team);
			}
		}

		if ($tableName == "users") {
			// hash password
			$toUpdate = $updates["toUpdate"];
			for ($i = 0; $i < count($toUpdate); $i++) {
				$password = $toUpdate[$i]->password;
				if ($password != "dummy") {
					$toUpdate[$i]->password = hash(PASSWORD_HASH_ALGO, $password);
				} else {
					unset($toUpdate[$i]->password);
				}
			}
		}
		$db->updateEntities($tableNameWithPrefix, $updates["toUpdate"]);
	}
	if (isset($updates["toDelete"])) {
		$db->deleteEntities($tableNameWithPrefix, $updates["toDelete"]);
	}
}


/**
	*
	* @param MySQL $db
	* @param string $player_name
	* @param string $saison_team_id
	* @return int The saison player id
	*/
function createNewPlayer($db, $player_name, $saison_team_id) {
	checkRights(array("ADMIN", "LIGA_ADMIN", "TEAM_ADMIN"));

	$playerProps = array();

	// set team id
	$getTeamIdSql = 'select id_team from `' . $_ENV["table_prefix"] . 'saison_team`'
			. ' where id = ' . ((int)$saison_team_id);
	$teamIdResult = $db->queryFetchAll($getTeamIdSql);
	$playerProps['id_team'] = $teamIdResult[0]['id_team'];

	// set first and last name
	$name_parts = explode(' ', $player_name);
	if (count($name_parts > 1)) {
		$playerProps["firstname"] = trim($name_parts[0]);
		$playerProps["lastname"] = trim($name_parts[1]);
	} else {
		$playerProps["firstname"] = trim($player_name);
		$playerProps["lastname"] = "";
	}

	// check, if there is already a player with that name
	$playerIdResult = $db->queryFetchAll("select id from `"  . $_ENV["table_prefix"] . 'player`'
			. " where firstname = '" . mysql_real_escape_string($playerProps["firstname"]) . "'"
			. " and lastname = '" . mysql_real_escape_string($playerProps["lastname"]) . "'");

	if (count($playerIdResult) > 0) {
		$player_id = $playerIdResult[0]['id'];
	} else {
		// insert the new player
		$db->insert($_ENV["table_prefix"] . 'player', $playerProps);
		$player_id = $db->getLastId();
	}

	// insert saison player
	$saisonPlayerProps = array();
	$saisonPlayerProps['id_saison_team'] = $saison_team_id;
	$saisonPlayerProps['id_player'] = $player_id;

	// insert the new saison player
	$db->insert($_ENV["table_prefix"] . 'saison_player', $saisonPlayerProps);
	$saison_player_id = $db->getLastId();

	return $saison_player_id;
}


function checkTableRight($table, $forWrite) {
	switch($table) {
		case "users" :
			checkRights(array("ADMIN"));
			break;
		case "settings":
			checkRights(array("ADMIN"));
			break;
		case "document":
			if ($forWrite) checkRights(array("ADMIN"));
			break;

		case "saison" :
			if ($forWrite) checkRights(array("ADMIN", "LIGA_ADMIN"));
			break;
		case "team":
			if ($forWrite) checkRights(array("ADMIN", "LIGA_ADMIN"));
			break;
		case "player":
			if ($forWrite) checkRights(array("ADMIN", "LIGA_ADMIN", "TEAM_ADMIN"));
			break;
		case "saison_team":
			if ($forWrite) checkRights(array("ADMIN", "LIGA_ADMIN"));
			break;
		case "saison_player":
			if ($forWrite) checkRights(array("ADMIN", "LIGA_ADMIN", "TEAM_ADMIN"));
			break;
		case "match":
			if ($forWrite) checkRights(array("ADMIN", "LIGA_ADMIN", "TEAM_ADMIN"));
			break;
		case "player_match":
			if ($forWrite) checkRights(array("ADMIN", "LIGA_ADMIN", "TEAM_ADMIN"));
			break;
	}

}



?>
