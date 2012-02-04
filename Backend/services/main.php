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

function getUserSelf()
{
	$result = null;
	if (isset($_SESSION["user_id"])) {
		$db = GetDbConnection();

		$users = $db->queryFetchAll("select * from `" . $_ENV["table_prefix"] 
				. "users` where id = " . ((int)$_SESSION["user_id"]));
		if (count($users) > 0) {
			$result = $users[0];
			$result["password"] = PASSWORD_DUMMY;
			$result["confirmPassword"] = PASSWORD_DUMMY;
		}
	}
	return $result;
}

function logMessage($message, $is_error = false) {
	$fullMessage = date('Y-m-d H:i:s'). ' ';
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
		$header = '';
		if (isset($settings["from"])) {
			$header .= 'From:' . $settings["from"]  . "\r\n";
		}

		$header .= 'X-Mailer: PHP/' . phpversion() . "\r\n";
		//$header .= 'Cc: ' . $headerInfo->ccaddress . "\r\n";
		//$header .= 'Bcc: ' . $headerInfo->bccaddress . "\r\n";
		$header .= 'Content-Type: text/plain;charset="iso-8859-1"' . "\r\n";
		//$header .= 'Content-Transfer-Encoding: ' . "\r\n";

		$mailAccept = mail($to, $subject, $body, $header);

		if ($mailAccept) {
			logMessage("Es wurde die Mail mit folgendem Betreff versandt: " . $subject);
		} else {
			logMessage("Die Mail mit folgendem Betreff wurde nicht aktzeptiert: " . $subject);
		}
	} else {
		logMessage("Das Versenden von Mails ist deaktiviert.");
	}
}

?>
