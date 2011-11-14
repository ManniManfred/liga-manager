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
  class FussballViewFussball extends JView {
    /**
     * Hellos view display method
     * @return void
     **/
    function display($tpl = null) {
      JToolBarHelper::title(JText::_('Fussball Manager :)' ), 'generic.png' );
      //JToolBarHelper::publishList();
      //JToolBarHelper::unpublishList();
      //JToolBarHelper::deleteList();
      //JToolBarHelper::editListX();
      //JToolBarHelper::addNewX();
       
       
      parent::display($tpl);
    }
  }
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
