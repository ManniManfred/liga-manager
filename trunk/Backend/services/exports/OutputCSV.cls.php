<?php

require_once dirname(__FILE__) . '/AbstractOutput.cls.php';

class OutputCSV extends AbstractOutput {

	public function SendResponse($source, $sourceIsMap) {
		header('Content-type: text/csv;charset=UTF-8');
		header('Content-Disposition: attachment; filename="' . $this->tableName . '.csv"');

		echo "\xEF\xBB\xBF"; // UTF-8 BOM

		if (!isset($this->header_keys)) {
			if (count($source) <= 0)
				return;

			foreach ($source[0] as $key => $value) {
				$this->header_keys[] = $key;
				$this->header_titles[] = $key;
			}
		}

		// echo header line
		$i = 0;
		foreach ($this->header_titles as $colTitle) {
			if ($i > 0)
				echo ",";

			echo $colTitle;

			$i++;
		}
		echo "\r\n";

		if ($sourceIsMap) {
			foreach ($source as $row) {
				$i = 0;
				foreach ($this->header_keys as $key) {
					if ($i > 0)
						echo ",";

					echo $row[$key];

					$i++;
				}
				echo "\r\n";
			}
		} else {
			foreach ($source as $row) {
				$i = 0;
				foreach ($row as $cell) {
					if ($i > 0)
						echo ",";

					echo $cell;

					$i++;
				}
				echo "\r\n";
			}
		}
	}

}

?>