<?php
   
  jimport('joomla.application.component.view');
   
  /**
   * HTML View class for the fussball Component
   */
  class FussballViewSpiel extends JView {
     
     
    function display($tpl = null) {
      global $mainframe;
       
      $spiel = & $this->get('Data');
       
      $pathway = & $mainframe->getPathWay();
       
      //$pathway->setItemName( 1, "pommes" );
      $pathway->addItem($spiel->nameMannschaft1 . ' vs ' . $spiel->nameMannschaft2);
       
      $this->assignRef('spiel' , $spiel);
       
      parent::display($tpl);
    }
     
     
  }
?>
