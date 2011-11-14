<?php
   
  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
   
  jimport('joomla.application.component.view' );
   
  require_once (JPATH_COMPONENT.DS.'models'.DS.'spieler.php');
   
  class FussballViewEditspieler extends JView {
    /**
     * display method of Hello view
     * @return void
     **/
    function display($tpl = null) {
       
      $user = & JFactory::getUser();
      if (!$user->guest) {
         
        $spieler_id = $this->__getSpielerID();
         
        if ($spieler_id >= 0) {
           
          $model = new FussballModelSpieler();
           
           
          $infos = $model->getSpielerDetails($spieler_id);
          $attributes = $this->__getAttributes();
           
           
          $this->assignRef('infos', $infos);
          $this->assignRef('attributes', $attributes);
        } else {
          $msg = 'Sie sind mit keinem Spieler verknüpft. Falls Sie ein Spieler des Holthausener Sportvereins sind und ihre Spieler Attribute bearbeiten möchten, wenden Sie sich bitte an den Administrator.';
          $this->assignRef('error', $msg);
        }
      } else {
        $msg = 'Sie müssen sich vorher <a href="index.php?option=com_user&view=login">anmelden</a>.';
        $this->assignRef('error', $msg);
      }
       
      parent::display($tpl);
    }
     
    function __getAttributes() {
      $db = & JFactory::getDBO();
       
      $query = 'SELECT * FROM #__fussball_Attribute';
       
      $db->setQuery($query);
      $result = $db->loadObjectList();
       
      return $result;
    }
     
    function __getSpielerID() {
      $user = & JFactory::getUser();
      $db = & JFactory::getDBO();
       
       
      $query = "SELECT id FROM #__fussball_spieler WHERE kontaktID = '" . $user->id . "'";
      $db->setQuery($query);
       
      $list = $db->loadObjectList();
       
      if (count($list) == 1) {
        return $list[0]->id;
      }
      return -1;
    }
     
  }
   
   
   
