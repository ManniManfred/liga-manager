 
<?php
  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
   
   
  class FussballControllerAttribut extends FussballController {
    /**
     * constructor (registers additional tasks to methods)
     * @return void
     */
    function __construct() {
      parent::__construct();
       
      $this->registerTask('add' , 'edit' );
    }
     
    function updateSpielerDetails() {
      $db = & JFactory::getDBO();
      $db->Execute("call CreateSpielerDetails()");
    }
     
    /**
     * display the edit form
     * @return void
     */
    function edit() {
       
      JRequest::setVar('view', 'attribut' );
      JRequest::setVar('layout', 'form'  );
      JRequest::setVar('hidemainmenu', 1);
       
      parent::display();
    }
     
    /**
     * save a record (and redirect to main page)
     * @return void
     */
    function save() {
      $model = $this->getModel('attribut');
       
      if ($model->store($post)) {
        $this->updateSpielerDetails();
        $msg = JText::_('Attribut saved!' );
      } else {
        $msg = JText::_('Error Saving Attribut' );
      }
       
      // Check the table in so it can be edited.... we are done with it anyway
      $link = 'index.php?option=com_fussball&view=attribute';
      $this->setRedirect($link, $msg);
    }
     
    /**
     * remove record(s)
     * @return void
     */
    function remove() {
      $model = $this->getModel('attribut');
      if (!$model->delete()) {
        $msg = JText::_('Error: Ein oder mehrere Attribute konnten nicht entfernt werden. ' . '(Eventuell wird das Attribut schon verwendet und kann deshalb nicht entfernt werden)' );
      } else {
        $this->updateSpielerDetails();
        $msg = JText::_('Attribut(e) entfernt' );
      }
       
      $this->setRedirect('index.php?option=com_fussball&view=attribute', $msg );
    }
     
     
     
    /**
     * cancel editing a record
     * @return void
     */
    function cancel() {
      $msg = JText::_('Operation Cancelled' );
      $this->setRedirect('index.php?option=com_fussball&view=attribute', $msg );
    }
  }
?>
