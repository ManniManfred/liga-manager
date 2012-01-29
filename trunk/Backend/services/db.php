<?php

require_once "config.php";
require_once "db/ErrorManager.class.php";
require_once "db/MySQL.class.php";

$current_db = null;

function GetDbConnection() {
	global $current_db;
	
	if ($current_db == null) {
		$current_db = new Mysql();
		$current_db->connect($_ENV["db_server"], $_ENV["db_catalog"], $_ENV["db_user"], $_ENV["db_password"]);
	}
	return $current_db;
}

?>
