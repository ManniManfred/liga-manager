<?php
  /**
   * @version $Id: entry.php 420 2007-12-28 15:52:11Z snipersister $
   * @package    Easybook
   * @link http://www.easy-joomla.org
   * @license    GNU/GPL
   */
   
  // no direct access
   
  defined('_JEXEC' ) or die('Restricted access' );
   
   
  /**
   * Easybook Component Controller
   *
   * @package    Easybook
   */
  class FussballControllerEditspieler extends JController {
     
    var $_access = null;
     
    /**
     * constructor (registers additional tasks to methods)
     * @return void
     */
    function __construct() {
      parent::__construct();
    }
     
     
    /**
     * save a record (and redirect to main page)
     * @return void
     */
    function save() {
      $model = $this->getModel('spieler');
       
      $post = JRequest::get('post');
       
      if ($model->store($post)) {
        $msg = JText::_('Spieler Details wurden gespeichert.' );
      } else {
        $msg = JText::_('Fehler beim Speichern Ihrer Spieler Details: ' . $model->getError() );
      }
       
      $this->setRedirect($_SERVER['HTTP_REFERER'], $msg);
    }
     
  }
?>
