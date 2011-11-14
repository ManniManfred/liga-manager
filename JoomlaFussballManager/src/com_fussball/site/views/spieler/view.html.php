<?php
   
  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
   
  jimport('joomla.application.component.view' );
   
  class FussballViewSpieler extends JView {
    /**
     * display method of Hello view
     * @return void
     **/
    function display($tpl = null) {
      global $mainframe;
       
      $pathway = & $mainframe->getPathWay();
       
      $infos = & $this->get('Data');
      $pathway->addItem("Spieler Details - " . $infos->name);
       
       
      $attributes = $this->__getAttributes();
       
      $this->assignRef('infos', $infos);
      $this->assignRef('attributes', $attributes);
       
       
      parent::display($tpl);
    }
     
    function __getAttributes() {
      $db = & JFactory::getDBO();
       
      $query = 'SELECT * FROM #__fussball_Attribute';
       
      $db->setQuery($query);
      $result = $db->loadObjectList();
       
      return $result;
    }
     
  }
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
