<?php

  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();

  jimport('joomla.application.component.model' );


  class FussballModelSaisonliste extends JModel {
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
      $query = ' SELECT * ' . ' FROM #__fussball_saison ' ;

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

    /**
     * Set the state of selected menu items
     */
    function setHome($item ) {
      $db = & $this->getDBO();


      // Clear home field for all other items
      $query = 'UPDATE #__fussball_saison SET isDefault = false WHERE true';

      $db->setQuery($query );
      if (!$db->query() ) {
        $this->setError($db->getErrorMsg());
        return false;
      }

      // Set the given item to home
      $query = 'UPDATE #__fussball_saison SET isDefault = true WHERE id = ' . (int) $item;


      $db->setQuery($query );
      if (!$db->query() ) {
        $this->setError($db->getErrorMsg());
        return false;
      }

      return true;
    }

  }















