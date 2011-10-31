<?php
require_once("config.php");

foreach ($_FILES as $key => $file)
{
	if ($file["error"] > 0)
    {
		echo "Return Code: " . $file["error"] . "<br />";
    }
	else
    {
		echo "Upload: " . $file["name"] . "<br />";
		echo "Type: " . $file["type"] . "<br />";
		echo "Size: " . ($file["size"] / 1024) . " Kb<br />";
		echo "Temp file: " . $file["tmp_name"] . "<br />";

		
		if (!is_dir($_ENV["upload_folder"])) {
			mkdir($_ENV["upload_folder"]);
		}
		
		move_uploaded_file($file["tmp_name"], $_ENV["upload_folder"] . $file["name"]);
		echo "Stored in: " . $_ENV["upload_folder"] . $file["name"];
    }
}
?>