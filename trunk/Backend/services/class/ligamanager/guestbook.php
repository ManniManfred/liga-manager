<?php

require_once "server/lib/JSON.phps";
require_once "main.php";

class class_guestbook extends ServiceIntrospection
{

	
    /**
     * Echo the (one and only) parameter.
     *
     * @param params
     *   An array containing the parameters to this method
     *
     * @param error
     *   An object of class JsonRpcError.
     *
     * @return
     *   Success: The object containing the result of the method;
     *   Failure: null
     */
    function method_AddEntry($params, $error)
    {
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$db = GetDbConnection();
		$entry = (array)$params[0];
		$entry['message'] = htmlentities($entry['message']);
		$entry['date'] = date('c');
		$db->insert($_ENV["table_prefix"] . 'guestbook', $entry);
    }
	
	
	function method_GetEntries($params, $error)
    {
        if (count($params) != 0)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 0 parameter; got " . count($params));
            return $error;
        }
		
		$db = GetDbConnection();
		return $db->queryFetchAll('select * from `' .$_ENV["table_prefix"] . 'guestbook`');
	}

}

?>