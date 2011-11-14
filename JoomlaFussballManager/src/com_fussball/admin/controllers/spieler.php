 
<?php
  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
   
   
  class FussballControllerSpieler extends FussballController {
    /**
     * constructor (registers additional tasks to methods)
     * @return void
     */
    function __construct() {
      parent::__construct();
       
      // Register Extra tasks
      $this->registerTask('add' , 'edit' );
      //$this->registerTask( 'unpublish',     'publish');
    }
     
    /**
     * display the edit form
     * @return void
     */
    function edit() {
       
      JRequest::setVar('view', 'spieler' );
      JRequest::setVar('layout', 'form'  );
      JRequest::setVar('hidemainmenu', 1);
       
      parent::display();
    }
     
    /**
     * save a record (and redirect to main page)
     * @return void
     */
    function save() {
      $model = $this->getModel('spieler');
       
      if ($model->store($post)) {
        $msg = JText::_('Spieler Saved!' );
      } else {
        $msg = JText::_('Error Saving Spieler' );
      }
       
      // Check the table in so it can be edited.... we are done with it anyway
      $link = 'index.php?option=com_fussball&view=spielerliste';
      $this->setRedirect($link, $msg);
    }
     
    /**
     * remove record(s)
     * @return void
     */
    function remove() {
      $model = $this->getModel('spieler');
      if (!$model->delete()) {
        $msg = JText::_('Error: One or more Spieler could not be Deleted' );
      } else {
        $msg = JText::_('Spieler Deleted' );
      }
       
      $this->setRedirect('index.php?option=com_fussball&view=spielerliste', $msg );
    }
     
     
     
    /**
     * cancel editing a record
     * @return void
     */
    function cancel() {
      $msg = JText::_('Operation Cancelled' );
      $this->setRedirect('index.php?option=com_fussball&view=spielerliste', $msg );
    }
  }
?>
