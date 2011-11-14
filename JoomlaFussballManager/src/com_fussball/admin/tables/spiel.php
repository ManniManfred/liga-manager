<?php

  // no direct access
  defined('_JEXEC') or die('Restricted access');

  class TableSpiel extends JTable {
    /** @var int Primary key */
    var $id = 0;

    var $idMannschaft1 = 0;

    var $idMannschaft2 = 0;

    var $datum = null;

    var $spielbeschreibung = '';

    var $tore1 = 0;

    var $tore2 = 0;

    var $idSpiel_typ = 0;

    var $idSaison = 0;

    /**
     * Constructor
     *
     * @param object Database connector object
     */
    function TableSpiel(& $db) {
      parent::__construct('#__fussball_spiel', 'id', $db);
    }
  }
?>

