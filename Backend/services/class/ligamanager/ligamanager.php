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
		
		$saison_id = $params[0];
		
		$db = CreateDbConnection();
		$db->query("update saison set isDefault = false");
		$db->query("update saison set isDefault = true where id = $saison_id");
    }
	
}

?>