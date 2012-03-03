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
					. " where S.isDefault";
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

		$match_id = $params[0];

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

		$db = GetDbConnection();
		$db->updateEntities($tableNameWithPrefix, array($match));

		// update player match
		if ($params[1] != null)
			UpdateEntities("player_match", $params[1]);


		// send mails
		// select all users that have to informed
		$sql = "select U.* from `" . $_ENV["table_prefix"] . "users` U"
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

}

?>