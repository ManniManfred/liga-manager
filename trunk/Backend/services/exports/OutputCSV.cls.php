<?php

require_once dirname(__FILE__) . '/AbstractOutput.cls.php';

class OutputCSV extends AbstractOutput
{
	public function SendResponse($output)
	{
		header('Content-type: text/csv');
		header('Content-Disposition: attachment; filename="' . $this->tableName . '.csv"');
		
		if (!isset($this->header_keys)) {
			if (count($output) <= 0) return;
			
			foreach ($output[0] as $key => $value) {
				$this->header_keys[] = $key;
				$this->header_titles[] = $key;
			}
		}
		
		// echo header line
		$i = 0;
		foreach ($this->header_titles as $colTitle) {
			if ($i > 0) echo ",";
			
			echo $colTitle;
			
			$i++;
		}
		echo "\r\n";
		
		// echo values
		foreach ($output as $row) {
			$i = 0;
			foreach ($this->header_keys as $key) {
				if ($i > 0) echo ",";
				
				echo $row[$key];
				
				$i++;
			}
			echo "\r\n";
		}
	}
}

?>