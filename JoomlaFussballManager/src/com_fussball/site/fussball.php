<?php
  /**
   * @version    $Id: mod_related_items.php 9030 2007-09-26 21:55:26Z jinx $
   * @package    Joomla
   * @copyright  Copyright (C) 2005 - 2007 Open Source Matters. All rights reserved.
   * @license    GNU/GPL, see LICENSE.php
   * Joomla! is free software. This version may have been modified pursuant
   * to the GNU General Public License, and as distributed it includes or
   * is derivative of works licensed under the GNU General Public License or
   * other free or open source software licenses.
   * See COPYRIGHT.php for copyright notices and details.
   */
   
  // no direct access
  defined('_JEXEC') or die('Restricted access');
   
   
  // kein direkter Zugriff
  defined('_JEXEC') or die('Restricted access');
   
  // laden des Joomla! Basis Controllers
  require_once (JPATH_COMPONENT.DS.'controller.php');
   
   
  // laden von weiterer Controllern
  if ($controller = JRequest::getWord('controller')) {
    $path = JPATH_COMPONENT.DS.'controllers'.DS.$controller.'.php';
    if (file_exists($path)) {
      require_once $path;
    } else {
      $controller = '';
    }
  }
   
  // Erzeugen eines Objekts der Klasse controller
  $classname = 'FussballController'.ucfirst($controller);
  $controller = new $classname();
   
  // den request task ausleben
  $controller->execute(JRequest::getCmd('task'));
   
  // Redirect aus dem controller
  $controller->redirect();
   
?>
