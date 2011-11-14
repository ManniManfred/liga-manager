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


    /**
     * Returns the query
     * @return string The query to be used to retrieve the rows from the database
     */
    function _buildQuery($spieltyp_id = 0) {
      if ($spieltyp_id > 0) {
        $typConstraint = ' AND T.id = ' . $spieltyp_id;
      }

      global $mainframe;
      $params = &$mainframe->getParams();

      $query = 'SELECT S.id, S.datum, S.idMannschaft1, S.idMannschaft2, S.spielBeschreibung, S.tore1, S.tore2, M1.name as nameMannschaft1, M2.name as nameMannschaft2, T.name as typ' . ' FROM #__fussball_spiel as S, #__fussball_mannschaft as M1, #__fussball_mannschaft as M2, #__fussball_spiel_typ as T  ' . ' where S.idSpiel_typ = T.id AND S.idMannschaft1 = M1.id AND S.idMannschaft2 = M2.id ' . $typConstraint
      . ' AND S.idSaison = ' . $params->get('saison')
      . ' ORDER BY S.datum;' ;

      return $query;
    }



    /**
     */
    function getSpiele($spieltyp_id = 0) {
      // Lets load the data if it doesn't already exist
      if (empty($this->_data )) {
        $query = $this->_buildQuery($spieltyp_id);
        $this->_data = $this->_getList($query );
      }

      return $this->_data;
    }

  }













