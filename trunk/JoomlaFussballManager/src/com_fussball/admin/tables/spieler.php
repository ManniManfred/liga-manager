<?php
   
  // no direct access
  defined('_JEXEC') or die('Restricted access');
   
  class TableSpieler extends JTable {
    /** @var int Primary key */
    var $id = 0;
     
    var $name = '';
     
    /** @var string */
    var $idMannschaft = 0;
     
    var $kontaktID = 0;
     
    var $anzahlSpiele = 0;
     
    var $anzahlTore = 0;
     
    /**
     * Constructor
     *
     * @param object Database connector object
     */
    function TableSpieler(& $db) {
      parent::__construct('#__fussball_spieler', 'id', $db);
    }
  }
?>
