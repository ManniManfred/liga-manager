<?php
   
  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
   
  jimport('joomla.application.component.view' );
   
  class FussballViewAttribut extends JView {
    /**
     * display method of Hello view
     * @return void
     **/
    function display($tpl = null) {
      $attr = & $this->get('Data');
      $isNew = ($attr->id < 1);
       
      $text = $isNew ? JText::_('New' ) : JText::_('Edit' );
      JToolBarHelper::title(JText::_('Mannschaft' ).': <small>[ ' . $text.' ]</small>' );
      JToolBarHelper::save();
      if ($isNew) {
        JToolBarHelper::cancel();
      } else {
        // for existing items the button is renamed `close`
        JToolBarHelper::cancel('cancel', 'Close' );
      }
       
      $this->assignRef('attribut', $attr);
      $this->assignRef('typeSelect', $this->__getAttributeSelect($attr->attrType));
       
      parent::display($tpl);
    }
     
    function __getAttributeSelect($active = '') {
       
      $db = & JFactory::getDBO();
       
      $query = 'SELECT name AS value, name AS text' . ' FROM #__fussball_AttributeType' ;
       
      $db->setQuery($query );
      $types = $db->loadObjectList();
       
      $type = JHTML::_('select.genericlist', $types, 'attrType', 'class="inputbox"', 'value', 'text', $active );
      return $type;
    }
  }
   
   
   
   
