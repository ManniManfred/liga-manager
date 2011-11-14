<?php
   
  // no direct access
  defined('_JEXEC') or die('Restricted access');
   
  class TableSpielerSpiel extends JTable {
    /** @var int Primary key */
    var $id = 0;
     
    var $idSpiel = 0;
     
    var $idSpieler = 0;
     
    var $hasRoteKarte = false;
     
    var $hasGelbeKarte = false;
     
    var $hasGelbRoteKarte = false;
     
    var $anzahlTore = 0;
     
    /**
     * Constructor
     *
     * @param object Database connector object
     */
    function TableSpielerSpiel(& $db) {
      parent::__construct('#__fussball_spieler_spiel', 'id', $db);
    }
  }
?>
