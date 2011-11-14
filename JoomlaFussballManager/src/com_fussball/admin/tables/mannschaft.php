<?php
   
  // no direct access
  defined('_JEXEC') or die('Restricted access');
   
  class TableMannschaft extends JTable {
    /** @var int Primary key */
    var $id = 0;
     
    /** @var string */
    var $name = '';
     
    var $isDefault = false;
     
    /**
     * Constructor
     *
     * @param object Database connector object
     */
    function TableMannschaft(& $db) {
      parent::__construct('#__fussball_mannschaft', 'id', $db);
    }
  }
?>
