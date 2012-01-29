<?php

require_once "server/lib/JSON.phps";
require_once "config.php";
require_once "db.php";


class class_usermanager extends ServiceIntrospection {

	function method_UpdateUser($params, $error) {
		if (count($params) != 1) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
			return $error;
		}

		$db = GetDbConnection();
		$entry = (array) $params[0];
		
		if ($entry['password'] == PASSWORD_DUMMY) {
			unset($entry['password']);
		} else {
			$entry['password'] = hash(PASSWORD_HASH_ALGO, ($entry['password']));
		}
		
		unset($entry['confirmPassword']);
		unset($entry['Team']);

		$db->update($_ENV["table_prefix"] . 'users', $entry);
	}

	function method_AddUser($params, $error) {
		if (count($params) != 1) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
			return $error;
		}

		$db = GetDbConnection();
		$entry = (array) $params[0];
		$entry['Password'] = hash(PASSWORD_HASH_ALGO, ($entry['Password']));

		unset($entry['ConfirmPassword']);
		unset($entry['Team']);

		$db->insert($_ENV["table_prefix"] . 'users', $entry);
	}

	function method_RemoveUser($params, $error) {
		if (count($params) != 1) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
			return $error;
		}

		$db = GetDbConnection();
		$user_id = (int) $params[0];
		$db->query("delete from `" . $_ENV["table_prefix"] . "users` where id = $user_id");
	}

	function method_GetUsers($params, $error) {
		if (count($params) != 0) {
			$error->SetError(JsonRpcError_ParameterMismatch, "Expected 0 parameter; got " . count($params));
			return $error;
		}

		$db = GetDbConnection();
		return $db->queryFetchAll('select * from `' . $_ENV["table_prefix"] . 'users`');
	}


}

?>