<?php

/*
 * set error level
 */
error_reporting( E_ALL ^ E_NOTICE );


require dirname(__FILE__) . "/server/DirectRpcServer.php";

$server = new DirectRpcServer();

$input = array("service" => "ligamanager.Core",
	"method" => "GetEntities");

$input["params"] = $server->json->decode($_POST["rpc"]); //$_POST["rpc"]; //

//print_r($input);

$server->setInput((object)$input);
$server->start();


$outputParser = null;

$outputName = $_POST["output"];

require_once 'exports/Output' . $outputName . '.cls.php';
$className = 'Output' . $outputName;
$outputParser = new $className;

if ($outputParser != null) {
	$colKeys = $server->json->decode($_POST["colKeys"]);
	$colTitles = $server->json->decode($_POST["colTitles"]);
	
	$outputParser->setHeader($colKeys, $colTitles, $input["params"][0]);
		
	$outputParser->SendResponse($server->output);
	//print_r($server->output);
}
?>