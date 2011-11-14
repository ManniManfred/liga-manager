<?php
   
  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
  jimport('joomla.application.component.model');
   
   
  class FussballModelSpiel extends JModel {
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
        $query = 'SELECT S.datum, S.tore1, S.tore2, S.idMannschaft1, S.idMannschaft2, S.spielbeschreibung as beschreibung, M1.name as nameMannschaft1, M2.name as nameMannschaft2 FROM #__fussball_spiel as S, #__fussball_mannschaft as M1, #__fussball_mannschaft as M2 WHERE S.idMannschaft1 = M1.id AND S.idMannschaft2 = M2.id AND S.id = '.$this->_id;
        $this->_db->setQuery($query );
        $this->_data = $this->_db->loadObject();
         
         
        $this->_data->mannschaft1 = $this->_getSpieler($this->_data->idMannschaft1);
        $this->_data->mannschaft2 = $this->_getSpieler($this->_data->idMannschaft2);
         
      }
       
       
       
      return $this->_data;
    }
     
    function _getSpieler($idMannschaft) {
       
      $query = 'SELECT S.name, SS.anzahlTore as tore, SS.hasGelbeKarte as gelb, SS.hasGelbRoteKarte as gelbrot, SS.hasRoteKarte as rot FROM #__fussball_spieler_spiel as SS, #__fussball_spieler as S WHERE SS.idSpieler = S.id AND SS.idSpiel = '.$this->_id . ' AND S.idMannschaft = ' . $idMannschaft;
      $this->_db->setQuery($query );
      return $this->_db->loadObjectList();
    }
     
  }
?>
