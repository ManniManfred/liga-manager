<?php
   
  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
  jimport('joomla.application.component.model');
   
  /**
   * Fussball Component Mannschaft Model
   */
  class FussballModelMannschaft extends JModel {
    function _getMannschaftQuery(&$options ) {
       
      $query = 'Select * From #__fussball_mannschaft';
      return $query;
    }
     
    function getMannschaftList($options = array() ) {
      $query = $this->_getMannschaftQuery($options );
      $result = $this->_getList($query );
      return @$result;
    }
  }
?>
