<?php
   
  defined('_JEXEC' ) or die('Restricted access' );
   
   
  function querySQL($buffer) {
    $db = & JFactory::getDBO();
     
    // Graceful exit and rollback if read not successful
    if ($buffer === false ) {
      return false;
    }
     
    // Create an array of queries from the sql file
    jimport('joomla.installer.helper');
    $queries = JInstallerHelper::splitSql($buffer);
     
    if (count($queries) == 0) {
      // No queries to process
      return 0;
    }
     
    // Process each query in the $queries array (split out of sql file).
    foreach ($queries as $query) {
      $query = trim($query);
      if ($query != '' && $query {
        0 }
      != '#') {
        $db->setQuery($query);
        if (!$db->query()) {
          JError::raiseWarning(1, 'JInstaller::install: '.JText::_('SQL Error')." ".$db->stderr(true));
          return false;
        }
      }
    }
    return true;
  }
   
   
  function getVersion(&$buffer) {
    $dp_pos = strpos($buffer, ':') + 1;
    $nl_pos = strpos($buffer, "\n");
     
    return substr($buffer, $dp_pos, $nl_pos - $dp_pos);
  }
   
  function tableExists($name) {
    $db = & JFactory::getDBO();
    $db->setQuery("show table status like '$name'");
    if (!$db->query()) {
      JError::raiseWarning(1, 'JInstaller::install: '.JText::_('SQL Error')." ".$db->stderr(true));
      return true;
    }
    return $db->getNumRows() != 0;
  }
   
  function logge($msg, $erfolg = true) {
    if ($erfolg) {
      echo '<p><font color="green">' . $msg . '</font></p>';
    } else {
      echo '<p><font color="red">' . $msg . '</font></p>';
    }
  }
  /*
   function insertDefaultAttributes() {
    
   $spielerAttr = array(
   array('Spielposition', 'text'),
   array('Trikotnummer', 'int'),
   array('Geburtsdatum', 'date'),
   array('Foto', 'img'));
    
   $db = & JFactory::getDBO();
    
   logge("Füge Standard Attribute für Spieler hinzu");
    
   for ($i = 0; $i < count($spielerAttr); $i++) {
   $sql = "INSERT INTO #__fussball_Attribute (name, attrType) VALUES('" . $spielerAttr[$i][0] . "','" . $spielerAttr[$i][1] . "');";
   echo $sql . "<br>\n";
   $db->setQuery($sql);
   if (!$db->query()) {
   JError::raiseWarning(1, 'JInstaller::install: '.JText::_('SQL Error')." ".$db->stderr(true));
   return false;
   }
   }
    
   return true;
   } */
   
  /**
   * Executes additional installation processes
   *
   * @since 0.1
   */
  function com_install() {
    $result = true;
     
    //global $mainframe;
     
    $db = & JFactory::getDBO();
    $installer = & JInstaller::getInstance();
     
    $dbOrdner = $installer->getPath('extension_administrator').DS. 'db' . DS;
    $filename = $dbOrdner . 'install.sql';
     
    if (!file_exists($filename)) {
      JError::raiseWarning(1, 'SQL install file (' . $filename. ') does not exist.');
      return false;
    }
     
    $file_content = file_get_contents($filename);
     
     
    $db->setQuery("SELECT value FROM #__fussball_infos WHERE name = 'db_version'");
    $db_version = $db->loadResult();
     
     
    if (isset($db_version)) {
      // Wenn schon eine Datenbank vorhanden ist, Versionen vergleichen
      $newVersion = getVersion($file_content);
       
      if ($db_version == $newVersion) {
        logge('Die vorhanden Datenbanktabellen der Version ' . $newVersion . ' werden verwendet.');
      } else {
        $updateFilename = $dbOrdner . 'update' . $db_version . 'to' . $newVersion . '.sql';
        if (file_exists($updateFilename)) {
          if (querySQL(file_get_contents($updateFilename))) {
            logge('Die Datenbank wurde auf die Version ' . $newVersion . ' geupdated.');
          } else {
            logge('Beim Update der Datenbank von Version ' . $db_version . ' auf Version ' . $newVersion . ' trat ein Fehler auf.', false);
            $result = false;
          }
        } else {
          logge('Es ist kein Update-Skript (' . $updateFilename . ') für die Datenbank vorhanden.', false);
          $result = false;
        }
      }
    } else {
      // Wenn die Datenbank nicht vorhanden ist, diese anlegen
      if (querySQL($file_content)) {
        logge('Die Datenbanktabellen der Version ' . getVersion($file_content) . ' wurden installiert.');
      } else {
        logge('Es trat ein Fehler beim Anlegen der Datenbanktabellen der Version ' . getVersion($file_content) . '.', false);
        $result = false;
      }
    }
     
    if ($result) {
      // $result = insertDefaultAttributes();
      //if ($result) {
      logge('Fussball Komponente wurde erfolgreich installiert.');
      //}
    } else {
      //logge();
      //print_r(JError::getErrors());
    }
     
    return $result;
  }
?>
