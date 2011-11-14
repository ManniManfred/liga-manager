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
    function _buildQuery($idMannschaft, $order) {
      //$query = 'Select * FROM #__fussball_spieler_saison' . ' WHERE idMannschaft = ' . $idMannschaft . ' ORDER BY ' . $order;

      global $mainframe;
      $params = &$mainframe->getParams();
      $saisonId = $params->get("saison");
      $displaytype = $params->get("displaytype");
	  
	  
	  if ($displaytype != 0) {
		// for no special saison -> complete
		$query = "SELECT s.id, s.idMannschaft, s.name, IFNULL(d.spiele, 0) + IFNULL(s.anzahlSpiele, 0) as spiele, IFNULL(d.tore,0) + IFNULL(s.anzahlTore, 0) as tore, d.gelb, d.gelbrot, d.rot
			FROM #__fussball_spieler as s
			LEFT JOIN (SELECT ss.idspieler, count(ss.idspieler) as spiele,
			sum(ss.anzahlTore) as tore,
			sum(hasGelbeKarte) as gelb,
			sum(hasGelbRoteKarte) as gelbrot,
			sum(hasRoteKarte) as rot
			FROM #__fussball_spieler_spiel as ss
			left join #__fussball_spiel as sp on sp.id = ss.idSpiel
			GROUP BY ss.idspieler) as d on s.id = d.idspieler
			WHERE idMannschaft = $idMannschaft ORDER BY $order";
		  return $query;
	  } else {

		  $query = "SELECT s.id, s.idMannschaft, s.name, d.spiele, d.tore, d.gelb, d.gelbrot, d.rot
			FROM #__fussball_spieler as s
			LEFT JOIN (SELECT ss.idspieler, count(ss.idspieler) as spiele,
					sum(ss.anzahlTore) as tore,
					sum(hasGelbeKarte) as gelb,
					sum(hasGelbRoteKarte) as gelbrot,
					sum(hasRoteKarte) as rot
			FROM #__fussball_spieler_spiel as ss
					left join #__fussball_spiel as sp on sp.id = ss.idSpiel
			WHERE sp.idSaison = $saisonId
			GROUP BY ss.idspieler) as d on s.id = d.idspieler
			WHERE idMannschaft = $idMannschaft ORDER BY $order";
		  return $query;
	  }
    }


    function getStandardMannschaftID() {
      $db = & JFactory::getDBO();

      $query = 'Select id FROM #__fussball_mannschaft WHERE isDefault = true';

      $db->setQuery($query);
      $mannschaft = $db->loadResult();

      return $mannschaft;

    }


    /**
     * Retrieves the hello data
     * @return array Array of objects containing the data from the database
     */
    function getSpielerlist($idMannschaft, $orderby = 'tore', $order_dir = 'desc') {
      // Lets load the data if it doesn't already exist
      if (empty($this->_data )) {
        $query = $this->_buildQuery($idMannschaft, $orderby . ' ' . $order_dir);
        $this->_data = $this->_getList($query );
      }

      return $this->_data;
    }

  }













