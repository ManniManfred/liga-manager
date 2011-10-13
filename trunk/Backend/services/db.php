<?php

require_once "config.php";
require_once "db/ErrorManager.class.php";
require_once "db/MySQL.class.php";



function CreateDbConnection() {
	$result = new Mysql();
	$result->connect($_ENV["db_server"], $_ENV["db_catalog"], $_ENV["db_user"], $_ENV["db_password"]);
	
	return $result;
}

?>
