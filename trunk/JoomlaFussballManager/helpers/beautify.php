<?php


  require_once $_ENV['beautify_dir'] . 'PEAR.php';
  require_once $_ENV['beautify_dir'] . 'beautify_php.class.inc';





  function beautify($inputfile, $outputfile) {
    $settings = array('indent_width' => 2, 'indent_long_comments' => true, 'file' => $inputfile);
    $beauty = new phpBeautify($settings);

    $rs = $beauty->beautify();

    if (PEAR::isError($rs)) {
      $fp = open("php://stderr", "w");
      fputs($fp, $rs->getMessage()."\n");
      fclose($fp);
    } else {
      $fp = fopen($outputfile, "w");
      fputs($fp, $rs, strlen($rs));
      fclose($fp);
    }

    unset($beauty);
  }


?>
