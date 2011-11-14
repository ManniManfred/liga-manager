<?php
   
  jimport('joomla.application.component.view');
   
  /**
   * HTML View class for the fussball Component
   */
  class FussballViewSpiele extends JView {
     
     
    function display($tpl = null) {
      global $mainframe;
       
      $document = & JFactory::getDocument();
      $menu = & JSite::getMenu();
      $item = $menu->getActive();
       
       
      $document->addStyleSheet($this->baseurl.'/components/com_eventlist/assets/css/eventlist.css');
      $document->addCustomTag('<!--[if IE]><style type="text/css">.floattext{zoom:1;}, * html #eventlist dd { height: 1%; }</style><![endif]-->');
       
       
      //$lists['order']          = JRequest::getCmd('order', 'tore');
      //$lists['order_Dir']      = JRequest::getWord('order_Dir', 'desc');
       
      $spieltyp_id = JRequest::getVar('idSpiel_typ', 0);
       
       
       
      $model = &$this->getModel();
      $rows = $model->getSpiele($spieltyp_id);
      $params = & $mainframe->getParams();
       
       
      $this->assignRef('rows' , $rows);
      $this->assignRef('params', $params);
      $this->assignRef('spieltypSelect', $this->__getSpieltypSelect($spieltyp_id));
      $this->assignRef('Itemid', $item->id);
       
      parent::display($tpl);
    }
     
    function __getSpieltypSelect($active = null) {
      $db = & JFactory::getDBO();
       
      $query = 'SELECT id AS value, name AS text FROM #__fussball_spiel_typ' ;
       
      $db->setQuery($query );
      $typen = $db->loadObjectList();
       
      $typen[count($typen)] = (object) array('value' => '0', 'text' => 'Alle');
       
      $typen = JHTML::_('select.genericlist', $typen, 'idSpiel_typ', 'class="inputbox"', 'value', 'text', $active );
      return $typen;
    }
     
  }
?>
