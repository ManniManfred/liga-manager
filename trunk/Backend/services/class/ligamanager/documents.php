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
	
	function method_GetDocumentsCount($params, $error) 
	{
        if (count($params) != 0)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 0 parameter; got " . count($params));
            return $error;
        }
		
		
		$db = CreateDbConnection();
		$result = $db->queryFetchAll('select count(*) from document');
		return $result == null ? 0 : (int)$result[0]["count(*)"];
	}
	

	function method_GetDocuments($params, $error) 
	{
		$db = CreateDbConnection();
		
		if (isset($params[0]) && isset($params[1])) {
			$firstIndex = $params[0];
			$maxRows = $params[1] - $firstIndex ;
			
			return $db->queryFetchAll("select * from document limit $firstIndex, $maxRows");
		} else {
			return $db->queryFetchAll('select * from document');
		}
	}
	
	
	function method_RemoveDocument($params, $error)
    {
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$this->deleteDocs($params[0]);
    }
	
	function method_UpdateDocuments($params, $error) {
	
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
		$db = CreateDbConnection();
		
		$updates = (array)$params[0];
		if (isset($updates["toAdd"])) {
			$this->addDocs($db, $updates["toAdd"]);
		}
		if (isset($updates["toUpdate"])) {
			$this->updateDocs($db, $updates["toUpdate"]);
		}
		if (isset($updates["toDelete"])) {
			$this->deleteDocs($db, $updates["toDelete"]);
		}
	}
	
	function addDocs($db, $docs) {
		for ($i = 0; $i < count($docs); $i++) {
			$entry = (array)$docs[$i];
			$db->insert('document', $entry);
		}
	}
	
	function updateDocs($db, $docs) {
		for ($i = 0; $i < count($docs); $i++) {
		
			$entry = (array)$docs[$i];
			$db->update('document', $entry);
		}
	}
	
	function deleteDocs($db, $doc_ids) {
		$sqlIDs = implode(', ', array_map('mysql_escape_string', $doc_ids));
		
		$doc_id = (int)$params[0];
		
		$db->query("delete from document where id in ($sqlIDs)");
	}
	
	
}

?>