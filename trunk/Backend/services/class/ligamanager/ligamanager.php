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
		
		$db = CreateDbConnection();
		return $db->queryFetchAll('select * from saison');
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
		
		$db = CreateDbConnection();
		$db->query("update saison set isDefault = false");
		$db->query("update saison set isDefault = true where id = $saison_id");
    }
	
	function method_CreateSaison($params, $error)
    {
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$db = CreateDbConnection();
		$saison = (array)$params[0];
		unset($saison["copy"]);
		
		$db->insert('saison', $saison);
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
		$db = CreateDbConnection();
		$db->query("delete from saison where id = $saison_id");
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
		
		$db = CreateDbConnection();
		
		$sql = "select T.id, T.name,"
			. " (select id from saison_team ST where ST.id_saison = $saison_id and ST.id_team = T.id) as id_saison_team"
			. " from team T";
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
		
		$db = CreateDbConnection();
		
		// handle insert / relations added
		for ($i = 0; $i < count($relsToAdd); $i++) {
			$team_id = (int)$relsToAdd[$i];
			$sql = "insert into saison_team (id_team, id_saison) values ($team_id, $saison_id)";
			$db->query($sql);
		}
		
		// handle deletes
		if (count($relsToDel) > 0) {
			$db->deleteEntities("saison_team", $relsToDel);
		}
	}
	
}

?>