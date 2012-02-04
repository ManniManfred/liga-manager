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
		$entry['name'] = htmlspecialchars($entry['name']);
		$entry['message'] = htmlspecialchars($entry['message']);
		$entry['date'] = date('c');
		$db->insert($_ENV["table_prefix"] . 'guestbook', $entry);
		
		$mailSettings = getMailSettings();
		
		if (isset($mailSettings["guestbook"]) && $mailSettings["guestbook"]) {
			// send mail to admins
			$admins = $db->queryFetchAll("select * from `" . $_ENV["table_prefix"] . "users`"
					. " where rights='ADMIN' and email is not null");
			
			if ($admins != null && count($admins) > 0) {
				for ($i = 0; $i < count($admins); $i++) {
					$subject = "Neuer Gästebucheintrag";
					$body = "Auf der Seite " . $_ENV["web_url"] . "#Gästebuch ist eine neuer Eintrag.";
					sendMyMail($admins[$i]["email"], $subject, $body);
				}
			}
		}
		
		return $db->getLastId();
    }
	
    function method_RemoveEntry($params, $error)
    {
		checkRights(array("ADMIN"));
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$db = GetDbConnection();
		$entry_id = (int)$params[0];
		$db->deleteEntities($_ENV["table_prefix"] . 'guestbook', array($entry_id));
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