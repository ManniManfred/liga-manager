<?php

  $_ENV['helpers_dir'] = 'helpers/';
  $_ENV['db_xslt_create'] = $_ENV['helpers_dir'] . 'create.xslt';
  $_ENV['db_xslt_drop'] = $_ENV['helpers_dir'] . 'drop.xslt';
  $_ENV['beautify_dir'] = $_ENV['helpers_dir'] . 'beautifyphp/';

  $_ENV['zipfile'] = 'build/com_fussball.zip';

  $_ENV['src_db_dir'] = 'src/db/';
  $_ENV['db_xml_file'] = $_ENV['src_db_dir'] . 'model/datenbank.xml';

  $_ENV['sql_script_dir'] = 'src/com_fussball/admin/db/';

  require_once('helpers/beautify.php');

  remove_dir('build');
  mkdir('build');

  createSQLScripts();
  addStoredProcedures();
  addViews();
  copyUpdateScripts();

  handleDir('src', 'build');

  chdir('build');
  exec('zip -r com_fussball.zip com_fussball');


  function copyUpdateScripts() {
    exec('cp ' . $_ENV['src_db_dir'] . '/update/* ' . $_ENV['sql_script_dir']);
  }

  function addStoredProcedures() {
    $handle = fopen($_ENV['sql_script_dir'] . 'install.sql', 'a');

    $d = dir($_ENV['src_db_dir'] . 'stored_procedure/');

    while (false !== ($entry = $d->read())) {
      $endpos = strripos($entry, '.sql');
      if ($endpos == strlen($entry) - 4) {
        $result = '-- Add stored procedure from ' . $entry . "\n";
        $result .= file_get_contents($d->path . $entry);
        if (fwrite($handle, $result) === false) {
          echo 'Konnte die Datei ' .$_ENV['sql_script_dir'] . 'install.sql nicht beschreiben.';
        }
      }
    }
    $d->close();
    

    fclose($handle);
  }

  function addViews() {
    $handle = fopen($_ENV['sql_script_dir'] . 'install.sql', 'a');

    $d = dir($_ENV['src_db_dir'] . 'view/');

    while (false !== ($entry = $d->read())) {
      $endpos = strripos($entry, '.sql');
      if ($endpos == strlen($entry) - 4) {
        $result = '-- Add view from ' . $entry . "\n";
        $result .= file_get_contents($d->path . $entry);
        if (fwrite($handle, $result) === false) {
          echo 'Konnte die Datei ' .$_ENV['sql_script_dir'] . 'install.sql nicht beschreiben.';
        }
      }
    }
    $d->close();
    

    fclose($handle);
  }

  function createSQLScripts() {
    $xp = new XsltProcessor();

    // create a DOM document and load the XSL stylesheet
    $xsl = new DomDocument;
    $xsl->load($_ENV['db_xslt_create']);

    // import the XSL styelsheet into the XSLT process
    $xp->importStylesheet($xsl);
    $xp->setParameter(null, 'target', 'drop');

    // create a DOM document and load the XML datat
    $xml_doc = new DomDocument;
    $xml_doc->load($_ENV['db_xml_file']);

    // transform the XML into HTML using the XSL file
    if ($result = $xp->transformToXML($xml_doc)) {
      // save result in uninstall.sql
      $handle = fopen($_ENV['sql_script_dir'] . 'uninstall.sql', 'w');
      if (fwrite($handle, $result) === false) {
        echo 'Konnte die Datei ' .$_ENV['sql_script_dir'] . 'uninstall.sql nicht beschreiben.';
      }
      fclose($handle);

      // save result as first command in install.sql
      $handle = fopen($_ENV['sql_script_dir'] . 'install.sql', 'w');
      //if (fwrite($handle, $result) === false) {
      //  echo 'Konnte die Datei ' .$_ENV['sql_script_dir'] . 'install.sql nicht beschreiben.';
      //}

      // run the same with parameter create
      $xp->setParameter(null, 'target', 'create');
      if ($result = $xp->transformToXML($xml_doc)) {
        if (fwrite($handle, $result) === false) {
          echo 'Konnte die Datei ' .$_ENV['sql_script_dir'] . 'install.sql nicht beschreiben.';
        }
      }

      fclose($handle);

    } else {
        echo 'XSL transformation failed.';
    }
  }

  function remove_dir($dir) {
    if(is_dir($dir)) {
      $dir = (substr($dir, -1) != "/")? $dir."/":$dir;
      $openDir = opendir($dir);
      while($file = readdir($openDir)) {
        if(!in_array($file, array(".", ".."))) {
          if(!is_dir($dir.$file))
            @unlink($dir.$file);
          else
            remove_dir($dir.$file);
        }
      }
      closedir($openDir);
      @rmdir($dir);
    }
  }

  function handleDir($src_dir, $dest_dir) {
    $dirlist = opendir($src_dir);

    if (!is_dir($dest_dir))  mkdir($dest_dir);

    while ($file = readdir ($dirlist)) {
      if ($file != '.' && $file != '..' && $file != '.svn') {
        $newpath_src = $src_dir.'/'.$file;
        $newpath_dest = $dest_dir."/".$file;
        if (is_dir($newpath_src)) {
          handleDir($newpath_src, $newpath_dest);
        } else {
          handleFile($newpath_src, $newpath_dest);
        }
      }
    }
    closedir($dirlist);
  }

  function handleFile($src_file, $dest_file) {
    if (strrpos($src_file, '.php') == strlen($src_file) - 4) {
      beautify($src_file, $dest_file );
    } else {
      if (strrpos($src_file, '~') === false) {
        copy($src_file, $dest_file);
      }
    }

  }

?>
