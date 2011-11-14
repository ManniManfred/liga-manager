<?php
   
  jimport('joomla.application.component.view');
   
  /**
   * HTML View class for the fussball Component
   */
  class FussballViewSpielerliste extends JView {
     
     
    function display($tpl = null) {
      global $mainframe;
       
      $document = & JFactory::getDocument();
      $menu = & JSite::getMenu();
      $item = $menu->getActive();
       
      $document->addStyleSheet($this->baseurl.'/components/com_eventlist/assets/css/eventlist.css');
      $document->addCustomTag('<!--[if IE]><style type="text/css">.floattext{zoom:1;}, * html #eventlist dd { height: 1%; }</style><![endif]-->');
       
      $lists['order'] = JRequest::getCmd('order', 'tore');
      $lists['order_Dir'] = JRequest::getWord('order_Dir', 'desc');
       
      $model = &$this->getModel();
      $rows = $model->getSpielerlist($model->getStandardMannschaftID(), $lists['order'], $lists['order_Dir']);
      $params = & $mainframe->getParams();
       
       
      $this->assignRef('rows' , $rows);
      $this->assignRef('params', $params);
      $this->assignRef('lists', $lists);
      $this->assignRef('Itemid', $item->id);
      parent::display($tpl);
    }
     
     
  }
?>
