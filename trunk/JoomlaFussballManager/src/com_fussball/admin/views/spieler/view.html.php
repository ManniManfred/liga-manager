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
      $spieler = & $this->get('Data');
      $isNew = ($spieler->id < 1);
       
      $text = $isNew ? JText::_('New' ) : JText::_('Edit' );
      JToolBarHelper::title(JText::_('Spieler' ).': <small>[ ' . $text.' ]</small>' );
      JToolBarHelper::save();
      if ($isNew) {
        JToolBarHelper::cancel();
      } else {
        // for existing items the button is renamed `close`
        JToolBarHelper::cancel('cancel', 'Close' );
      }
       
      $this->assignRef('spieler', $spieler);
      $this->assignRef('mannschaft', $this->__getMannschaftSelect($spieler->idMannschaft));
       
       
       
      parent::display($tpl);
    }
     
     
    function __getMannschaftSelect($active = null) {
      $db = & JFactory::getDBO();
       
      $query = 'SELECT id AS value, name AS text' . ' FROM #__fussball_mannschaft' ;
       
      $db->setQuery($query );
      $mannschaften = $db->loadObjectList();
       
      $mannschaft = JHTML::_('select.genericlist', $mannschaften, 'idMannschaft', 'class="inputbox"', 'value', 'text', $active );
      return $mannschaft;
    }
  }
   
