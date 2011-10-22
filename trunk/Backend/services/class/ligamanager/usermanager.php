<?php

require_once "server/lib/JSON.phps";
require_once "config.php";
require_once "db.php";

class class_usermanager extends ServiceIntrospection
{

    function method_AddUser($params, $error)
    {
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$db = CreateDbConnection();
		$entry = (array)$params[0];
		$entry['Password'] = hash(PASSWORD_HASH_ALGO, ($entry['Password']));
		
		unset($entry['ConfirmPassword']);
		unset($entry['Team']);
		
		$db->insert('users', $entry);
    }
	
	
	function method_GetUsers($params, $error)
    {
        if (count($params) != 0)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 0 parameter; got " . count($params));
            return $error;
        }
		
		$db = CreateDbConnection();
		return $db->queryFetchAll('select * from users');
	}

}

?>