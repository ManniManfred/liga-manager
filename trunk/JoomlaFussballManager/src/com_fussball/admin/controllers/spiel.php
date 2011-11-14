 
<?php
  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
   
   
  class FussballControllerSpiel extends FussballController {
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
      JRequest::setVar('view', 'spiel' );
      JRequest::setVar('layout', 'form'  );
      JRequest::setVar('hidemainmenu', 1);
      parent::display();
    }
     
    /**
     * save a record (and redirect to main page)
     * @return void
     */
    function save() {
      $model = $this->getModel('spiel');
       
      $post = JRequest::get('post');
      $post['spielbeschreibung'] = JRequest::getVar('spielbeschreibung', '', 'post', 'string', JREQUEST_ALLOWRAW);
       
      //$post = $_POST;
       
      if ($model->store($post)) {
        $msg = JText::_('Spiel Saved!');
        //$msg = JText::_('Spiel Saved! Post:' . print_r($post, true) );
      } else {
        $msg = JText::_('Error Saving Spiel: ' . $model->getError() );
        //$msg .= JText::_('Spiel Saved! Post:' . print_r($post, true) );
      }
       
      // Check the table in so it can be edited.... we are done with it anyway
      $link = 'index.php?option=com_fussball&view=spiele';
      $this->setRedirect($link, $msg);
    }
     
    /**
     * remove record(s)
     * @return void
     */
    function remove() {
      $model = $this->getModel('spiel');
      if (!$model->delete()) {
        $msg = JText::_('Error: One or more Spieler could not be Deleted' );
      } else {
        $msg = JText::_('Spiel Deleted' );
      }
       
      $this->setRedirect('index.php?option=com_fussball&view=spiele', $msg );
    }
     
     
     
     
    /**
     * cancel editing a record
     * @return void
     */
    function cancel() {
      $msg = JText::_('Operation Cancelled' );
      $this->setRedirect('index.php?option=com_fussball&view=spiele', $msg );
    }
  }
?>
