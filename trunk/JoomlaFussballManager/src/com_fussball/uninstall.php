<?php
   
  defined('_JEXEC' ) or die('Restricted access' );
   
  /*
   function querySQLFile(&$buffer) {
   $db = & JFactory::getDBO();
    
   // Graceful exit and rollback if read not successful
   if ( $buffer === false ) {
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
   if ($query != '' && $query{0} != '#') {
   $db->setQuery($query);
   if (!$db->query()) {
   JError::raiseWarning(1, 'JInstaller::install: '.JText::_('SQL Error')." ".$db->stderr(true));
   return false;
   }
   }
   }
   return true;
   }
   */
   
  /**
   * Executes additional uninstallation processes
   *
   * @since 0.1
   */
  function com_uninstall() {
    /*
     $installer = & JInstaller::getInstance();
      
     $dbOrdner = $installer->getPath('extension_administrator').DS. 'db' . DS;
     $filename = $dbOrdner . 'uninstall.sql';
      
     return querySQLFile(file_get_contents($filename));
     */
     
    echo "Die Fussball Komponete wurde deinstalliert.";
     
  }
?>
