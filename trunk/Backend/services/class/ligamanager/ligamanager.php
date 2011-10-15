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
	
	
}

?>