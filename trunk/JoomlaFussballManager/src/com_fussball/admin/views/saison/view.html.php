<?php
   
  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
   
  jimport('joomla.application.component.view' );
   
  class FussballViewSaison extends JView {
    /**
     * display method of Hello view
     * @return void
     **/
    function display($tpl = null) {
      $saison = & $this->get('Data');
      $isNew = ($saison->id < 1);
       
      $text = $isNew ? JText::_('New' ) : JText::_('Edit' );
      JToolBarHelper::title(JText::_('Saison' ).': <small>[ ' . $text.' ]</small>' );
      JToolBarHelper::save();
      if ($isNew) {
        JToolBarHelper::cancel();
      } else {
        // for existing items the button is renamed `close`
        JToolBarHelper::cancel('cancel', 'Close' );
      }
       
      $this->assignRef('saison', $saison);
       
      parent::display($tpl);
    }
  }
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
