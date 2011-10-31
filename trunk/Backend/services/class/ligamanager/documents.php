<?php

require_once "server/lib/JSON.phps";
require_once "config.php";
require_once "db.php";

class class_Documents extends ServiceIntrospection
{

	function method_GetFiles($params, $error) 
	{
        if (count($params) != 0)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 0 parameter; got " . count($params));
            return $error;
        }
		
		$files = array();
		$dir = $_ENV["upload_folder"];
		
		if (is_dir($dir)) {
			if ($dh = opendir($dir)) {
				while (($file = readdir($dh)) !== false) {
					if ($file != "." && $file != "..") {
						$files[] = $file;
					}
				}
				closedir($dh);
			}
		}
		return $files;
	}
	
	
}

?>