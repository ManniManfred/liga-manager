<?php

require_once "server/lib/JSON.phps";
require_once "config.php";
require_once "db.php";

class class_manager extends ServiceIntrospection
{

    function method_AddEntry($params, $error)
    {
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$db = CreateDbConnection();
		$entry = (array)$params[0];
		$entry['Message'] = htmlentities($entry['Message']);
		$entry['date'] = date('c');
		$db->insert('guestbook', $entry);
    }
	
	
	function method_GetEntries($params, $error)
    {
        if (count($params) != 0)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 0 parameter; got " . count($params));
            return $error;
        }
		
		$db = CreateDbConnection();
		return $db->queryFetchAll('select * from guestbook');
	}

}

?>