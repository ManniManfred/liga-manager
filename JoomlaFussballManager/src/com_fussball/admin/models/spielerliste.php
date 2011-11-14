<?php
   
  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
   
  jimport('joomla.application.component.model' );
   
   
  class FussballModelSpielerliste extends JModel {
    /**
     * Autos data array
     *
     * @var array
     */
    var $_data;
     
     
    /**
     * Returns the query
     * @return string The query to be used to retrieve the rows from the database
     */
    function _buildQuery() {
      $query = 'SELECT S.id, S.name, S.kontaktID, S.anzahlSpiele, S.idMannschaft, M.name as nameMannschaft ' . ' FROM #__fussball_spieler as S, #__fussball_mannschaft as M where S.idMannschaft = M.id;' ;
       
      return $query;
    }
     
    /**
     * Retrieves the hello data
     * @return array Array of objects containing the data from the database
     */
    function getData() {
      // Lets load the data if it doesn't already exist
      if (empty($this->_data )) {
        $query = $this->_buildQuery();
        $this->_data = $this->_getList($query );
      }
       
      return $this->_data;
    }
     
  }
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
