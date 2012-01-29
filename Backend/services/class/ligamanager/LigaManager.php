<?php

require_once "server/lib/JSON.phps";
require_once "config.php";
require_once "db.php";

class class_LigaManager extends ServiceIntrospection
{

    function method_GetSaisons($params, $error)
    {
        if (count($params) != 0)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 0 parameter; got " . count($params));
            return $error;
        }
		
		$db = GetDbConnection();
		return $db->queryFetchAll("select * from `" . $_ENV["table_prefix"] . "saison`");
    }
	
	function method_SetDefaultSaison($params, $error)
    {
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$saison_id = (int)$params[0];
		
		$db = GetDbConnection();
		$db->query("update `" . $_ENV["table_prefix"] . "saison` set isDefault = false");
		$db->query("update `" . $_ENV["table_prefix"] . "saison` set isDefault = true where id = $saison_id");
    }
	
	function method_CreateSaison($params, $error)
    {
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$db = GetDbConnection();
		$saison = (array)$params[0];
		unset($saison["copy"]);
		
		$db->insert($_ENV["table_prefix"] . 'saison', $saison);
    }
	
	function method_RemoveSaison($params, $error)
    {
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		
		$saison_id = (int)$params[0];
		$db = GetDbConnection();
		$db->query("delete from `" . $_ENV["table_prefix"] . "saison` where id = $saison_id");
    }
	
	function method_GetSaisonTeams($params, $error)
    {
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$saison_id = (int)$params[0];
		
		$db = GetDbConnection();
		
		$sql = "select T.id, T.name,"
			. " (select id from `" . $_ENV["table_prefix"] . "saison_team` ST"
				. " where ST.id_saison = $saison_id and ST.id_team = T.id) as id_saison_team"
			. " from `" . $_ENV["table_prefix"] . "team` T";
		return $db->queryFetchAll($sql);
		
	}
	
	
	function method_UpdateSaisonTeams($params, $error)
    {
        if (count($params) != 3)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 3 parameter; got " . count($params));
            return $error;
        }
		
		$saison_id = (int)$params[0];
		$relsToAdd = $params[1];
		$relsToDel = $params[2];
		
		$db = GetDbConnection();
		
		// handle insert / relations added
		for ($i = 0; $i < count($relsToAdd); $i++) {
			$team_id = (int)$relsToAdd[$i];
			$sql = "insert into `" . $_ENV["table_prefix"] . "saison_team` (id_team, id_saison) values ($team_id, $saison_id)";
			$db->query($sql);
		}
		
		// handle deletes
		if (count($relsToDel) > 0) {
			$db->deleteEntities($_ENV["table_prefix"] . "saison_team", $relsToDel);
		}
	}
	
	
	
	function method_GetOnlyTeamsOfSaison($params, $error)
    {
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$saison_id = (int)$params[0];
		
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
	
	
	function method_GetSaisonPlayers($params, $error)
    {
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$saison_team_id = (int)$params[0];
		
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
	
	
	function method_UpdateSaisonPlayers($params, $error)
    {
        if (count($params) != 3)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 3 parameter; got " . count($params));
            return $error;
        }
		
		$id_saison_team = (int)$params[0];
		$relsToAdd = $params[1];
		$relsToDel = $params[2];
		
		$db = GetDbConnection();
		
		// handle insert / relations added
		for ($i = 0; $i < count($relsToAdd); $i++) {
			$player_id = (int)$relsToAdd[$i];
			$sql = "insert into `" . $_ENV["table_prefix"] . "saison_player` (id_saison_team, id_player) values ($id_saison_team, $player_id)";
			$db->query($sql);
		}
		
		// handle deletes
		if (count($relsToDel) > 0) {
			$db->deleteEntities($_ENV["table_prefix"] . "saison_player", $relsToDel);
		}
	}
	
	
	function method_StoreMatch($params, $error)
    {
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$match = $params[0];
		$tableNameWithPrefix = $_ENV["table_prefix"] . "match";
		
		$db = GetDbConnection();
		$db->updateEntities($tableNameWithPrefix, array($match));
		
	}
	
	/**
	 * Returns all saison players of the current saison.
	 */
	function method_GetAllSaisonPlayers($params, $error)
    {
		$sql = "select SP.id, SP.id_saison_team, P.firstname, P.lastname, T.name as team_name from `". $_ENV["table_prefix"] . "saison_player` SP"
			. " left join `" . $_ENV["table_prefix"] . "player` P on P.id = SP.id_player"
			. " left join `" . $_ENV["table_prefix"] . "saison_team` ST on ST.id = SP.id_saison_team"
			. " left join `" . $_ENV["table_prefix"] . "saison` S on ST.id_saison = S.id"
			. " left join `" . $_ENV["table_prefix"] . "team` T on ST.id_team = T.id"
			. " where S.isDefault"
			. " order by SP.id_saison_team, P.firstname, P.lastname";
			
		$db = GetDbConnection();
		return $db->queryFetchAll($sql);
	}
}

?>