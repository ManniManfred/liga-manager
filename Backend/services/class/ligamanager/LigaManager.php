<?php

require_once "server/lib/JSON.phps";
require_once "config.php";
require_once "main.php";

class class_LigaManager extends ServiceIntrospection {

	function method_GetSaisons($params, $error) {
		if (count($params) != 0) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 0 parameter; got " . count($params));
			return $error;
		}

		$db = GetDbConnection();
		return $db->queryFetchAll("select * from `" . $_ENV["table_prefix"] . "saison`");
	}

	function method_SetDefaultSaison($params, $error) {
		checkRights(array("ADMIN"));

		if (count($params) != 1) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
			return $error;
		}

		$saison_id = (int) $params[0];

		$db = GetDbConnection();
		$db->query("update `" . $_ENV["table_prefix"] . "saison` set isDefault = false");
		$db->query("update `" . $_ENV["table_prefix"] . "saison` set isDefault = true where id = $saison_id");
	}

	function method_CreateSaison($params, $error) {
		checkRights(array("ADMIN"));

		if (count($params) != 1) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
			return $error;
		}

		$db = GetDbConnection();
		$saison = (array) $params[0];
		unset($saison["copy"]);

		$db->insert($_ENV["table_prefix"] . 'saison', $saison);
	}

	function method_RemoveSaison($params, $error) {
		checkRights(array("ADMIN"));

		if (count($params) != 1) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
			return $error;
		}


		$saison_id = (int) $params[0];
		$db = GetDbConnection();
		$db->query("delete from `" . $_ENV["table_prefix"] . "saison` where id = $saison_id");
	}

	function method_GetSaisonTeams($params, $error) {
		if (count($params) != 1) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
			return $error;
		}

		$saison_id = (int) $params[0];

		$db = GetDbConnection();

		$sql = "select T.id, T.name,"
				. " (select id from `" . $_ENV["table_prefix"] . "saison_team` ST"
				. " where ST.id_saison = $saison_id and ST.id_team = T.id) as id_saison_team"
				. " from `" . $_ENV["table_prefix"] . "team` T";
		return $db->queryFetchAll($sql);
	}

	function method_UpdateSaisonTeams($params, $error) {
		checkRights(array("ADMIN", "LIGA_ADMIN", "TEAM_ADMIN"));
		if (count($params) != 3) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 3 parameter; got " . count($params));
			return $error;
		}

		$saison_id = (int) $params[0];
		$relsToAdd = $params[1];
		$relsToDel = $params[2];

		$db = GetDbConnection();

		// handle insert / relations added
		for ($i = 0; $i < count($relsToAdd); $i++) {
			$team_id = (int) $relsToAdd[$i];
			$sql = "insert into `" . $_ENV["table_prefix"] . "saison_team` (id_team, id_saison) values ($team_id, $saison_id)";
			$db->query($sql);
		}

		// handle deletes
		if (count($relsToDel) > 0) {
			$db->deleteEntities($_ENV["table_prefix"] . "saison_team", $relsToDel);
		}
	}

	function method_GetOnlyTeamsOfSaison($params, $error) {
		if (count($params) != 1) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
			return $error;
		}

		$saison_id = (int) $params[0];

		$db = GetDbConnection();

		$sql = "select ST.id, T.name from `" . $_ENV["table_prefix"] . "saison_team` ST"
				. " left join `" . $_ENV["table_prefix"] . "team` T on T.id = ST.id_team";

		if ($saison_id == -1) {
			$sql .= " left join `" . $_ENV["table_prefix"] . "saison` S on S.id = ST.id_saison"
					. " where (S.isDefault or S.isCurrent)";
		} else {
			$sql .= " where id_saison = $saison_id";
		}
		return $db->queryFetchAll($sql);
	}

	function method_GetSaisonPlayers($params, $error) {
		if (count($params) != 1) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
			return $error;
		}

		$saison_team_id = (int) $params[0];

		$db = GetDbConnection();

		$sql = "select P.id, P.firstname, P.lastname,"
				. " (select id from `" . $_ENV["table_prefix"] . "saison_player` SP"
				. " where SP.id_saison_team = $saison_team_id"
				. " and SP.id_player = P.id) as id_saison_player"
				. " from `" . $_ENV["table_prefix"] . "player` P"
				. " where P.id_team IN (select id_team from `" . $_ENV["table_prefix"] . "saison_team` where id = $saison_team_id)"
				. " order by P.firstname";

		return $db->queryFetchAll($sql);
	}

	function method_UpdateSaisonPlayers($params, $error) {
		checkRights(array("ADMIN", "LIGA_ADMIN", "TEAM_ADMIN"));

		if (count($params) != 3) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 3 parameter; got " . count($params));
			return $error;
		}

		$id_saison_team = (int) $params[0];
		$relsToAdd = $params[1];
		$relsToDel = $params[2];

		$db = GetDbConnection();

		// handle insert / relations added
		for ($i = 0; $i < count($relsToAdd); $i++) {
			$player_id = (int) $relsToAdd[$i];
			$sql = "insert into `" . $_ENV["table_prefix"] . "saison_player` (id_saison_team, id_player) values ($id_saison_team, $player_id)";
			$db->query($sql);
		}

		// handle deletes
		if (count($relsToDel) > 0) {
			$db->deleteEntities($_ENV["table_prefix"] . "saison_player", $relsToDel);
		}
	}

	/**
	 * Returns all saison players of the current saison.
	 */
	function method_GetAllSaisonPlayers($params, $error) {
		$sql = "select SP.id, SP.id_saison_team, P.firstname, P.lastname, T.name as team_name from `" . $_ENV["table_prefix"] . "saison_player` SP"
				. " left join `" . $_ENV["table_prefix"] . "player` P on P.id = SP.id_player"
				. " left join `" . $_ENV["table_prefix"] . "saison_team` ST on ST.id = SP.id_saison_team"
				. " left join `" . $_ENV["table_prefix"] . "saison` S on ST.id_saison = S.id"
				. " left join `" . $_ENV["table_prefix"] . "team` T on ST.id_team = T.id"
				. " where S.isDefault"
				. " order by SP.id_saison_team, P.firstname, P.lastname";

		$db = GetDbConnection();
		return $db->queryFetchAll($sql);
	}

	function method_GetPublicPlayerMatchDetails($params, $error) {

		if (count($params) != 1) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
			return $error;
		}

		$match_id = $params[0];

		$sql = "select PM.*, SP.id_saison_team, P.firstname, P.lastname"
				. " from `" . $_ENV["table_prefix"] . "player_match` PM"
				. " left join `" . $_ENV["table_prefix"] . "saison_player` SP on SP.id = PM.id_saison_player"
				. " left join `" . $_ENV["table_prefix"] . "player` P on P.id = SP.id_player"
				. " where PM.id_match = " . ((int) $match_id)
				. " order by SP.id_saison_team, P.firstname, P.lastname";

		$db = GetDbConnection();
		return $db->queryFetchAll($sql);
	}

	function method_GetMatch($params, $error) {

		if (count($params) != 1) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
			return $error;
		}

		return $this->getMatch((int)$params[0]);
	}

	function getMatch($match_id) {
	
		$sql = "select M.*, T1.id as id_team1, T2.id as id_team2, T1.name as name_team1, T2.name as name_team2"
				. " from `" . $_ENV["table_prefix"] . "match` M"
				. " left join `" . $_ENV["table_prefix"] . "saison_team` ST1 on ST1.id = M.id_saison_team1"
				. " left join `" . $_ENV["table_prefix"] . "saison_team` ST2 on ST2.id = M.id_saison_team2"
				. " left join `" . $_ENV["table_prefix"] . "team` T1 on T1.id = ST1.id_team"
				. " left join `" . $_ENV["table_prefix"] . "team` T2 on T2.id = ST2.id_team"
				. " where M.id = " . ((int) $match_id);

		$db = GetDbConnection();
		$rows = $db->queryFetchAll($sql);
		return $rows[0];
	}
	
	function method_StoreMatch($params, $error) {
		checkRights(array("ADMIN", "LIGA_ADMIN", "TEAM_ADMIN"));

		if (count($params) != 2) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 2 parameter; got " . count($params));
			return $error;
		}

		$match = $params[0];
		
		$db = GetDbConnection();
		
		// check the match id's
		$dbMatch = $this->getMatch((int)$match->id);
		
		if ($dbMatch["id_team1"] != $match->id_team1
				|| $dbMatch["id_team2"] != $match->id_team2
				|| $dbMatch["id_saison_team1"] != $match->id_saison_team1
				|| $dbMatch["id_saison_team2"] != $match->id_saison_team2) {
			$errorMessage = "Spiel id's stimmen nicht überein. Spiel DB: \n" . print_r($dbMatch, true) 
					. "Spiel Json: \n" . print_r($match, true);
			
			logMessage($errorMessage, true);
			$error->SetError(JsonRpcError_ParameterMismatch, "Spiel id's stimmen nicht überein.");
			return $error;
		}
		
		
		$user = getUserSelf();

		if ($user["rights"] == "TEAM_ADMIN"
				&& $user["id_team"] != $match->id_team1
				&& $user["id_team"] != $match->id_team2) {
			$error->SetError(JsonRpcError_ParameterMismatch, "You have not the right to modify the specified match");
			return $error;
		}

		unset($match->name_team1);
		unset($match->name_team2);
		unset($match->id_team1);
		unset($match->id_team2);
		$tableNameWithPrefix = $_ENV["table_prefix"] . "match";

		$db->updateEntities($tableNameWithPrefix, array($match));

		// update player match
		if ($params[1] != null)
			UpdateEntities("player_match", $params[1]);


		// send mails
		// select all users that have to informed
		$sql = "select distinct U.* from `" . $_ENV["table_prefix"] . "users` U"
				. " left join `" . $_ENV["table_prefix"] . "saison_team` ST on U.id_team = ST.id_team"
				. " where ST.id = " . ((int) $match->id_saison_team1) . " or ST.id = " . ((int) $match->id_saison_team2)
				. " or U.rights = 'LIGA_ADMIN'";
		
		$users = $db->queryFetchAll($sql);
		$subject = "Spieländerung   Spiel-Nummer " . $match->id;
		$body = "Sehr geehrte Damen und Herren, \r\n \r\n"
				. "das Spiel mit der Nummer " . $match->id . " wurde von \"" . $user["username"] . "\" geändert."
				. " \r\nSiehe " . $_ENV["web_url"] . "#Spielplan~" . $match->id
				. " \r\n \r\nGruß LigaManager";

		sendMyMailsTo($users, $subject, $body);
	}

	function method_MergePlayer($params, $error) {
		checkRights(array("ADMIN"));

		if (count($params) != 2) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 2 parameter; got " . count($params));
			return $error;
		}
		
		$player1 = (int)$params[0];
		$player2 = (int)$params[1];
		
		$saison_t_to_player1 = $this->GetSaisonPlayers($player1, true);
		$saison_t_to_player2 = $this->GetSaisonPlayers($player2, true);
		
		//$error->SetError(JsonRpcError_ParameterMismatch, 
		//	"s1: ".json_encode($saison_t_to_player1)."; s2:".json_encode($saison_t_to_player2));
		//return $error;
				
		$db = GetDbConnection();
		
		foreach ($saison_t_to_player1 as $saison_team => $sp1) {
			$sp2 = $saison_t_to_player2[$saison_team];
			if (isset($sp2)) {
				$this->MergeSaisonPlayer($sp1, $sp2);
			}
			unset($saison_t_to_player2[$saison_team]);
		}
		
		
		foreach ($saison_t_to_player2 as $saison_team => $sp2) {
			
			// create saison player 1
			$sql = "insert into `" . $_ENV["table_prefix"] . "saison_player`"
				. " (id_saison_team, id_player) values ($saison_team, $player1)";
			$db->query($sql);
				
			$sp1 = $this->GetPlayerSaisonId($player1, $saison_team);
			if (!isset($sp2)) {
				$error->SetError(JsonRpcError_ParameterMismatch, 
					"sp1 invalid: $sp1;");
				return $error;
			}
			$this->MergeSaisonPlayer($sp1, $sp2);
		}
		
		// remove player 2
		$sql = "delete from `" . $_ENV["table_prefix"] . "player`"
				. " where id = $player2";
		$db->query($sql);
	}
	
	function MergeSaisonPlayer($sp1, $sp2) {
		
		$db = GetDbConnection();
		
		// link matches from player 2 to player 1
		$sql = "update `" . $_ENV["table_prefix"] . "player_match`"
				. " set id_saison_player = $sp1"
				. " where id_saison_player = $sp2";
		$db->query($sql);
		
		// remove saison player 2
		$sql = "delete from `" . $_ENV["table_prefix"] . "saison_player`"
				. " where id = $sp2";
		$db->query($sql);
	}
	
	function GetPlayerSaisonId($playerId, $saison_team = null) {
	
		$db = GetDbConnection();
		
		if ($saison_team == null){
		
			// get saison player ids
			$sql = "select SP.id as id_saison_player"
					. " from `" . $_ENV["table_prefix"] . "saison_player` SP"
					. " left join `" . $_ENV["table_prefix"] . "saison_team` ST on SP.id_saison_team = ST.id"
					. " left join `" . $_ENV["table_prefix"] . "saison` S on ST.id_saison = S.id"
					. " where S.isDefault and SP.id_player = $playerId";
		} else {
			$sql = "select SP.id as id_saison_player"
					. " from `" . $_ENV["table_prefix"] . "saison_player` SP"
					. " where SP.id_saison_team = $saison_team";
		}
		$result = $db->queryFetchAll($sql);
		
		return $result[0]["id_saison_player"];
	}
	
	function GetSaisonPlayers($playerId) {
	
		$db = GetDbConnection();
		
		// get saison player ids
		$sql = "select SP.id as id_saison_player, SP.id_saison_team as saisonTeam"
				. " from `" . $_ENV["table_prefix"] . "saison_player` SP"
				. " where SP.id_player = $playerId";
		$result = $db->queryFetchAll($sql);
		
		$arr = [];
		for ($i = 0; $i < count($result); $i++) {
			$arr[$result[$i]["saisonTeam"]] = $result[$i]["id_saison_player"];
		}
		return $arr;
	}
	
	function GetSaisonTeamOf($playerId)	{
		
		$db = GetDbConnection();
		
		// get saison player ids
		$sql = "select ST.id as id_saison_team"
				. " from `" . $_ENV["table_prefix"] . "saison_team` ST"
				. " left join `" . $_ENV["table_prefix"] . "team` T on ST.id_team = T.id"
				. " left join `" . $_ENV["table_prefix"] . "saison` S on ST.id_saison = S.id"
				. " where S.isDefault and T.id IN (select id_team where id = $playerId)";
		$result = $db->queryFetchAll($sql);
		
		return $result[0]["id_saison_team"];
	}
}

?>