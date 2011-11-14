 
<?php
  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
   
   
  class FussballControllerMannschaft extends FussballController {
    /**
     * constructor (registers additional tasks to methods)
     * @return void
     */
    function __construct() {
      parent::__construct();
       
      $this->registerTask('add' , 'edit' );
    }
     
    /**
     * display the edit form
     * @return void
     */
    function edit() {
       
      JRequest::setVar('view', 'mannschaft' );
      JRequest::setVar('layout', 'form'  );
      JRequest::setVar('hidemainmenu', 1);
       
      parent::display();
    }
     
    /**
     * save a record (and redirect to main page)
     * @return void
     */
    function save() {
      $model = $this->getModel('mannschaft');
       
      if ($model->store($post)) {
        $msg = JText::_('Mannschaft Saved!' );
      } else {
        $msg = JText::_('Error Saving Mannschaft' );
      }
       
      // Check the table in so it can be edited.... we are done with it anyway
      $link = 'index.php?option=com_fussball&view=mannschaften';
      $this->setRedirect($link, $msg);
    }
     
    /**
     * remove record(s)
     * @return void
     */
    function remove() {
      $model = $this->getModel('mannschaft');
      if (!$model->delete()) {
        $msg = JText::_('Error: One or more Mannschaften could not be Deleted' );
      } else {
        $msg = JText::_('Mannschaft(en) Deleted' );
      }
       
      $this->setRedirect('index.php?option=com_fussball&view=mannschaften', $msg );
    }
     
     
    /**
     * Publishes or Unpublishes one or more records
     * @param array An array of unique category id numbers
     * @param integer 0 if unpublishing, 1 if publishing
     * @param string The current url option
     */
    function setdefault() {
       
      // Initialize variables
      $db = & JFactory::getDBO();
      $cid = JRequest::getVar('cid', array(), 'post', 'array' );
       
       
      if (isset($cid[0]) && $cid[0]) {
        $id = $cid[0];
      } else {
        $this->setRedirect('index.php?option=com_fussball&view=mannschaften', JText::_('No Items Selected') );
        return false;
      }
       
      $model = & $this->getModel('mannschaften');
      if ($model->setHome($id)) {
        $msg = JText::_('Standard gesetzt' );
      } else {
        $msg = $model->getError();
      }
       
      $this->setRedirect('index.php?option=com_fussball&view=mannschaften', $msg);
       
    }
     
     
    /**
     * cancel editing a record
     * @return void
     */
    function cancel() {
      $msg = JText::_('Operation Cancelled' );
      $this->setRedirect('index.php?option=com_fussball&view=mannschaften', $msg );
    }
  }
?>
