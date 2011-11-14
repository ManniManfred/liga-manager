<?php
   
  // no direct access
  defined('_JEXEC') or die('Restricted access');
   
  class TableAttribut extends JTable {
    /** @var int Primary key */
    var $id = 0;
     
    /** @var string */
    var $name = '';
     
    var $attrType = '';
     
    var $displayName = '';
     
    /**
     * Constructor
     *
     * @param object Database connector object
     */
    function TableAttribut(& $db) {
      parent::__construct('#__fussball_Attribute', 'id', $db);
    }
  }
?>
