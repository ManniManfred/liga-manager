<?php
   
  jimport('joomla.application.component.view');
   
  /**
   * HTML View class for the fussball Component
   */
  class FussballViewMannschaft extends JView {
    function display($tpl = null) {
      $model = &$this->getModel();
      $rows = $model->getMannschaftList();
      $this->assignRef('rows' , $rows);
      parent::display($tpl);
    }
  }
?>
