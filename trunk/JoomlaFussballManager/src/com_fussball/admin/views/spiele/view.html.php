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
  class FussballViewSpiele extends JView {
    /**
     * Hellos view display method
     * @return void
     **/
    function display($tpl = null) {
      JToolBarHelper::title(JText::_('Spiele' ), 'generic.png' );
      //JToolBarHelper::publishList();
      //JToolBarHelper::unpublishList();
      JToolBarHelper::deleteList();
      JToolBarHelper::editListX();
      JToolBarHelper::addNewX();
       
      // Get data from the model
      $items = & $this->get('Data');
       
      $this->assignRef('items', $items);
       
       
      parent::display($tpl);
    }
  }
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
