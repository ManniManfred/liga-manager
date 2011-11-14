<?php

  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
  jimport('joomla.application.component.model');
  jimport('joomla.utilities.date' );


  require_once (JPATH_COMPONENT.DS.'tables'.DS.'spielerspiel.php');

  class FussballModelSpiel extends JModel {

    var $actual_saison = null;

    /**
     * Constructor that retrieves the ID from the request
     *
     * @access  public
     * @return  void
     */
    function __construct() {
      parent::__construct();

      $array = JRequest::getVar('cid', 0, '', 'array');
      $this->setId((int)$array[0]);
    }

    /**
     * Method to set the hello identifier
     *
     * @access  public
     * @param  int Hello identifier
     * @return  void
     */
    function setId($id) {
      // Set id and wipe data
      $this->_id = $id;
      $this->_data = null;
    }


    /**
     * Method to get a hello
     * @return object with data
     */
    function &getData() {

      // Load the data
      if (empty($this->_data )) {
        $query = ' SELECT * FROM #__fussball_spiel '. '  WHERE id = '.$this->_id;
        $this->_db->setQuery($query );
        $this->_data = $this->_db->loadObject();
      }

      if (!$this->_data) {
        $now = new JDate();
        $this->_data = new stdClass();
        $this->_data->id = 0;
        $this->_data->idMannschaft1 = 0;
        $this->_data->idMannschaft2 = 0;
        $this->_data->tore1 = 0;
        $this->_data->tore2 = 0;
        $this->_data->datum = $now->toMySQL();
        $this->_data->spielbeschreibung = '';
        $this->_data->idSpiel_typ = 0;
      }

      return $this->_data;
    }


    /**
     * Get the defaul Saison id.
     */
    function getActualSaisonId() {
      if ($this->actual_saison == null) {
        $query = 'SELECT id FROM #__fussball_saison WHERE isDefault = TRUE';
        $this->_db->setQuery($query);
        $this->actual_saison = $this->_db->loadResult();
      }
      return $this->actual_saison;
    }

    /**
     * Method to store a record
     *
     * @access  public
     * @return  boolean  True on success
     */
    function store($data) {
      global $mainframe;

      $row = & $this->getTable();
      $row->idSaison = $this->getActualSaisonId();

      // Bind the form fields to the hello table
      if (!$row->bind($data)) {
        $this->setError($this->_db->getErrorMsg());
        return false;
      }

      // Make sure the hello record is valid
      if (!$row->check()) {
        $this->setError($this->_db->getErrorMsg());
        return false;
      }

      // Store the web link table to the database
      if (!$row->store()) {
        $this->setError($this->_db->getErrorMsg() );
        return false;
      }


      // Alle vorher eingefuegten Verknuepfungen von Spieler zu Spiel entfernen
      $query = 'DELETE FROM #__fussball_spieler_spiel WHERE idSpiel = ' . $row->id;
      $this->_db->setQuery($query);
      $this->_db->query();


      if (!$this->saveSpieler($data["idMannschaft1"], $data, $row->id)) {
        return false;
      }

      if (!$this->saveSpieler($data["idMannschaft2"], $data, $row->id)) {
        return false;
      }

      return true;
    }


    function saveSpieler($idMannschaft, $data, $spielId) {

      // alle spieler, die beim Spiel dabei waren suchen
      $count = 0;
      $prefix = 'ma' . $idMannschaft . 'sp';

      while (isset($data[$prefix . $count . '_id'])) {

        if (isset($data[$prefix . $count . '_dabei']) && $data[$prefix . $count . '_dabei'] == 'on') {
          $table = new TableSpielerSpiel($this->_db);

          //$sp->id = 0;
          $table->idSpiel = $spielId;
          $table->idSpieler = $data[$prefix . $count . '_id'];
          $table->anzahlTore = $data[$prefix . $count . '_tore'];
          $table->hasGelbeKarte = isset($data[$prefix . $count . '_gelb']);
          $table->hasGelbRoteKarte = isset($data[$prefix . $count . '_gelbrot']);
          $table->hasRoteKarte = isset($data[$prefix . $count . '_rot']);


          // Make sure the hello record is valid
          if (!$table->check()) {
            $this->setError($this->_db->getErrorMsg());
            return false;
          }

          // Store the web link table to the database
          if (!$table->store()) {
            $this->setError($this->_db->getErrorMsg());
            return false;
          }
        }
        $count++;
      }
      return true;
    }

    /**
     * Method to delete record(s)
     *
     * @access  public
     * @return  boolean  True on success
     */
    function delete() {
      $cids = JRequest::getVar('cid', array(0), 'post', 'array' );

      $row = & $this->getTable();

      if (count($cids )) {
        foreach($cids as $cid) {
          if (!$row->delete($cid )) {
            $this->setError($row->getDBO()->getErrorMsg() );
            return false;
          }
        }
      }
      return true;
    }


  }
?>
