<?php

require_once "server/lib/JSON.phps";
require_once "db.php";

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
		$result = $db->query('select * from guestbook');
		
		return $db->fetchAll($result);
		
		//foreach ($mysql->fetchAll($result) as $entry) {

		//}
	}

}

?>