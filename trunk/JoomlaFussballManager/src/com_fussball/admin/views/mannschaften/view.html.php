<?php
   
  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
   
  jimport('joomla.application.component.view' );
   
  /**
   * Hellos View
   *
   * @package    Joomla.Tutorials
   * @subpackage Components
   */
  class FussballViewMannschaften extends JView {
    /**
     * Hellos view display method
     * @return void
     **/
    function display($tpl = null) {
      JToolBarHelper::title(JText::_('Mannschaften verwalten' ), 'generic.png' );
       
      JToolBarHelper::makeDefault('setdefault');
      JToolBarHelper::deleteList();
      JToolBarHelper::editListX();
      JToolBarHelper::addNewX();
       
      // Get data from the model
      $items = & $this->get('Data');
       
      $this->assignRef('items', $items);
       
       
      parent::display($tpl);
    }
  }
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
