<?php


function phpValueToSQL($phpValue) {
	if (is_null($phpValue)) {
		return 'NULL';
	} else if (is_string($phpValue)) {
		return "'" . mysql_real_escape_string($phpValue) . "'";
	} else {
		return $phpValue;
	}
}

class MySQLException extends Exception { }



class MySQL {





	private $host = null, 
			$baseName = null, 
			$user = null, 
			$id = null;

	private $errorManager = null;	
	
	private $queries = array();



	public function __construct() {

		$this->errorManager = ErrorManager::getInstance();

	} // public function __construct()



	public function getHost() { return $this->host; }
	public function getBaseName() { return $this->baseName; }
	public function getUser() { return $this->user; }
	

	public function connect($host, $base, $user, $password, $enconding = "utf8") {

		if (!($this->id = mysql_connect($host, $user, $password))) {

			$this->host = null;
			$this->base = null;
			$this->user = null;
			$this->id = null;

			$this->errorManager->reportFatalError($this, new MySQLException("database connection failed!"));

		}
		else {
			$this->host = $host;
			$this->user = $user;
			if (mysql_select_db($base, $this->id)) {
				$this->baseName = $base;
			}
			mysql_set_charset($enconding, $this->id);
			return true;
		}

	}
	


	public function escape_string($string) {
		return mysql_real_escape_string($string, $this->id);
	}


	public function getLastId() {
		
		if (is_resource($this->id)) {

			$lastId = mysql_insert_id($this->id);
			return $lastId;

		}
		else {

			$this->errorManager->reportFatalError($this, new MySQLException("database is not connected, can't get last id"));

		}

	}
	
	function fetch_fields($result, $table) {
        // LIMIT 1 means to only read rows before row 1 (0-indexed)
		if ($table != null) {
			$describe = mysql_query("SHOW COLUMNS FROM `$table`");
		}
        $num = mysql_num_fields($result);
        $output = array();
        for ($i = 0; $i < $num; ++$i) {
                $field = mysql_fetch_field($result, $i);
				
				if ($table != null) {
					// Analyze 'extra' field
					$field->auto_increment = (strpos(mysql_result($describe, $i, 'Extra'), 'auto_increment') === FALSE ? 0 : 1);
					
					// Create the column_definition
					$field->definition = mysql_result($describe, $i, 'Type');
					if ($field->not_null && !$field->primary_key) $field->definition .= ' NOT NULL';
					if ($field->def) $field->definition .= " DEFAULT '" . $this->escape_string($field->def) . "'";
					if ($field->auto_increment) $field->definition .= ' AUTO_INCREMENT';
					if ($key = mysql_result($describe, $i, 'Key')) {
							if ($field->primary_key) $field->definition .= ' PRIMARY KEY';
							else $field->definition .= ' UNIQUE KEY';
					}
					// Create the field length
					$field->len = mysql_field_len($result, $i);
				}
				
                // Store the field into the output
                $output[] = $field;
        }
        return $output;
	}


	public function fetchAll($result, $handleFields = true, $table = null) {
	
		$rows = array();
		$fields = array();
		
		if ($handleFields) {
			$fields = $this->fetch_fields($result, $table);
		}
		
		if (mysql_num_rows($result)) {
			if ($handleFields) {
				$correctRow = array();
				while ($row = mysql_fetch_row($result)) {
					for ($i = 0; $i < count($fields); $i++) {
						$correctRow[$fields[$i]->name] = $this->convertFieldValue($fields[$i], $row[$i]);
					}
					$rows[] = $correctRow;
				}
			} else {			
				while ($row = mysql_fetch_assoc($result)) {
					$rows[] = $row;
				}
			}
		}
		
		mysql_free_result($result);
		return $rows;
	}

	public function convertFieldValue($fieldMeta, $cellValue) {
		if ($cellValue == null) {
			return $cellValue;
		}
		if ($fieldMeta->definition == "tinyint(1)") {
			return (bool)$cellValue;
		} else if ($fieldMeta->type == "int") {
			return (int)$cellValue;
		} else if ($fieldMeta->type == "datetime") {
			// $obj = new stdClass();
			// $obj->now = strtotime($cellValue);
			// $obj->json = new JSON_Date(strtotime($cellValue));
			// return $obj;
			
			return $cellValue;
			//return new JSON_Date(strtotime($cellValue));
		} else {
			//print_r($fieldMeta);
		}
		return $cellValue;
	}


	public function insert($table, $inserts) {
		$values = array_map('phpValueToSQL', array_values($inserts));
		$keys = array_keys($inserts);
			
		return $this->query('INSERT INTO `'.$table.'` (`'.implode('`,`', $keys).'`) VALUES ('.implode(',', $values).')');
	}
	
	public function update($table, $updates, $id_col="id") {
		if (count($updates) > 0) {
			$sql = "UPDATE `$table` SET ";
			
			$i = 0;
			$id_val = null;
			foreach($updates as $key => $value) {
				if ($key != $id_col) {
					$col = $this->escape_string($key);
					$val = phpValueToSQL($value);
					
					if ($i > 0) {
						$sql .= ", ";
					}
					$sql .= "`$key` = $val";
					
					$i++;
				} else {
					$id_val = $this->escape_string($value);
				}				
			}
			
			$sql .= " where `$id_col` = $id_val";
			return $this->query($sql);
		}
	}
	
	public function query($string) {

	 	if (is_resource($this->id)) {
			
			if ($result = mysql_query($string, $this->id)) {
				
				$this->queries[] = $string;
				return $result;

			}
			else {
				$this->errorManager->reportFatalError($this, new MySQLException("error in query: '$string':".mysql_error($this->id)));
			}

		}
		else {

			$this->errorManager->reportFatalError($this, new MySQLException("database is not connected, can't make query"));

		}

	} 



	public function queryFetchAll($query, $tableName = null) {

		$result = $this->query($query);
		$entries = $this->fetchAll($result, true, $tableName);
		return $entries;

	}





	public function getQueries() {
	
		return $this->queries;

	}



	//
	// handle entities
	//

	public function addEntities($tableName, $docs) {
		for ($i = 0; $i < count($docs); $i++) {
			$entry = (array)$docs[$i];
			$this->insert($tableName, $entry);
		}
	}
	
	public function updateEntities($tableName, $docs) {
		for ($i = 0; $i < count($docs); $i++) {
		
			$entry = (array)$docs[$i];
			$this->update($tableName, $entry);
		}
	}
	
	public function deleteEntities($tableName, $doc_ids) {
		$sqlIDs = implode(', ', array_map('mysql_escape_string', $doc_ids));
		
		$this->query("delete from `$tableName` where id in ($sqlIDs)");
	}
	
	
	
	
	
	
	public function __destruct() {

		if (is_resource($this->id)) {

			mysql_close($this->id);
		
		}
	}

}

?>
