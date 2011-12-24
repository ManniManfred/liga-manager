<?php

require_once dirname(__FILE__) . '/AbstractOutput.cls.php';
require('../fpdf17/fpdf.php');

class OutputPDF extends AbstractOutput
{
	public function SendResponse($output)
	{
		header('Content-type: application/pdf');
		header('Content-Disposition: attachment; filename="downloaded.pdf"');
		
		// create pdf output

		$pdf = new FPDF();
		$pdf->AddPage();
		$pdf->SetFont('Arial','B',16);
		$pdf->Cell(40,10,'Hello World!');
		$pdf->Output();
	}
}

?>