<?php

abstract class AbstractOutput
{
	protected $header_keys;
	protected $header_titles;
	protected $tableName;

	public function setHeader($header_keys, $header_titles, $tableName) {
		$this->header_keys = $header_keys;
		$this->header_titles = $header_titles;
		$this->tableName = $tableName;
	}
	
	protected function checkHeaderKeysAndTitles() {
	
		if (!isset($this->header_keys)) {
			if (count($output) <= 0) return;
			
			foreach ($output[0] as $key => $value) {
				$this->header_keys[] = $key;
				$this->header_titles[] = $key;
			}
		}
	}
	
	public abstract function SendResponse($output, $sourceIsMap);
}

?>