<?php

  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();

  jimport('joomla.application.component.model' );


  class FussballModelSpiele extends JModel {
    /**
     * Autos data array
     *
     * @var array
     */
    var $_data;


    var $actual_saison = null;


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
     * Returns the query
     * @return string The query to be used to retrieve the rows from the database
     */
    function _buildQuery() {
      $query = 'SELECT S.id, S.datum, S.idMannschaft1, S.idMannschaft2, S.spielBeschreibung, S.tore1, S.tore2, M1.name as nameMannschaft1, M2.name as nameMannschaft2' . ' FROM #__fussball_spiel as S, #__fussball_mannschaft as M1, #__fussball_mannschaft as M2  ' . ' where S.idMannschaft1 = M1.id AND S.idMannschaft2 = M2.id AND S.idSaison = '
        . $this->getActualSaisonId();

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















