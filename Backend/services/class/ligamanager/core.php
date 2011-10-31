<?php

require_once "server/lib/JSON.phps";
require_once "config.php";
require_once "db.php";

class class_Core extends ServiceIntrospection
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
    function method_IsCorrectlyLoggedIn($params, $error)
    {
        if (count($params) != 0)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 0 parameter; got " . count($params));
            return $error;
        }
		
		if (isset($_SESSION["user"])) {
			// TODO: what about changes on the user during a session?
			return true;
		}
		return false;
    }

	function method_GetUserRights($params, $error) 
	{
        if (count($params) != 0)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 0 parameter; got " . count($params));
            return $error;
        }
		
		if (isset($_SESSION["user"])) {
			// changes during session are not considered! User has to logout and login
			$group = $_SESSION["user"]["rights"];
			return $group;
		}
		return null;
	}
	
	function method_Login($params, $error) 
	{
        if (count($params) != 2)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 2 parameter; got " . count($params));
            return $error;
        }
		
		$db = CreateDbConnection();
		$username = $params[0];
		$password = $params[1];
		
		$passHash = hash(PASSWORD_HASH_ALGO, $password);
		
		
		$query = sprintf("select * from users where username='%s' and password='%s'",
            mysql_real_escape_string($username),
            mysql_real_escape_string($passHash));
		
		
		$resultArr = $db->queryFetchAll($query);
		
		$result = array("result" => false, "message" => "Benutzer Passwort Kombination ist falsch.");
		
		if (count($resultArr) == 1) {
			$_SESSION["user"] = $resultArr[0];
			$result["result"] = true;
			$result["message"] = "ok";
		}
		
        return $result;
	}

	function method_Logout($params, $error) 
	{
        if (count($params) != 0)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 0 parameter; got " . count($params));
            return $error;
        }
		
		unset($_SESSION["user"]);
	}
	
	
	
	
	//
	// crud actions for entities
	//
	
	
	function method_GetEntitiesCount($params, $error) 
	{
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$tableName = $params[0];
		
		$db = CreateDbConnection();
		$result = $db->queryFetchAll("select count(*) from $tableName");
		return $result == null ? 0 : (int)$result[0]["count(*)"];
	}
	

	function method_GetEntities($params, $error) 
	{
		$db = CreateDbConnection();
		
		$tableName = $params[0];
		
		if (isset($params[1]) && isset($params[2])) {
			$firstIndex = $params[1];
			$maxRows = $params[2] - $firstIndex ;
			
			return $db->queryFetchAll("select * from $tableName limit $firstIndex, $maxRows");
		} else {
			return $db->queryFetchAll("select * from $tableName");
		}
	}
	
	function method_UpdateEntities($params, $error) {
	
        if (count($params) != 2)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$tableName = $params[0];
		
		$db = CreateDbConnection();
		
		$updates = (array)$params[1];
		if (isset($updates["toAdd"])) {
			$this->addDocs($db, $tableName, $updates["toAdd"]);
		}
		if (isset($updates["toUpdate"])) {
			$this->updateDocs($db, $tableName, $updates["toUpdate"]);
		}
		if (isset($updates["toDelete"])) {
			$this->deleteDocs($db, $tableName, $updates["toDelete"]);
		}
	}
	
	function addDocs($db, $tableName, $docs) {
		for ($i = 0; $i < count($docs); $i++) {
			$entry = (array)$docs[$i];
			$db->insert($tableName, $entry);
		}
	}
	
	function updateDocs($db, $tableName, $docs) {
		for ($i = 0; $i < count($docs); $i++) {
		
			$entry = (array)$docs[$i];
			$db->update($tableName, $entry);
		}
	}
	
	function deleteDocs($db, $tableName, $doc_ids) {
		$sqlIDs = implode(', ', array_map('mysql_escape_string', $doc_ids));
		
		$db->query("delete from $tableName where id in ($sqlIDs)");
	}
	
}

?>