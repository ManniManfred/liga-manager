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
		return $result == null ? 0 : $result[0]["count(*)"];
	}
	

	function method_GetEntities($params, $error) 
	{
		$db = CreateDbConnection();
		
		$tableName = $params[0];
		$sqlQuery = "select * from $tableName";
		
		if (isset($params[1]) && isset($params[2])) {
			$sortField = $params[1];
			$sortOrder = $params[2];
			
			$sqlQuery .= " order by $sortField $sortOrder";
		}
		
		if (isset($params[3]) && isset($params[4])) {
			$firstIndex = $params[3];
			$maxRows = $params[4] - $firstIndex ;
			
			$sqlQuery .= " limit $firstIndex, $maxRows";
		}
		return $db->queryFetchAll($sqlQuery, $tableName);
	}
	
	function method_UpdateEntities($params, $error) {
	
        if (count($params) != 2)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		
		// TODO: check for rights!!!
		
		$tableName = $params[0];
		
		$db = CreateDbConnection();
		
		$updates = (array)$params[1];
		if (isset($updates["toAdd"])) {
			$db->addEntities($tableName, $updates["toAdd"]);
		}
		if (isset($updates["toUpdate"])) {
			$db->updateEntities($tableName, $updates["toUpdate"]);
		}
		if (isset($updates["toDelete"])) {
			$db->deleteEntities($tableName, $updates["toDelete"]);
		}
	}
	
	
}

?>