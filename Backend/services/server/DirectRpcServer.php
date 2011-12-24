<?php
/*
 * qooxdoo - the new era of web development
 *
 * http://qooxdoo.org
 *
 * Copyright:
 *   2006-2009 Derrell Lipman, Christian Boulanger
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *   See the LICENSE file in the project's top-level directory for details.
 *
 * Authors:
 *  * Christian Boulanger (cboulanger) Error-Handling and OO-style rewrite
 */
require_once dirname(__FILE__) . "/JsonRpcServer.php";

/*
 * This is a simple extension to the JsonRpcServer to allow to test
 * the methods with post data instead of Json data. You can also
 * allow GET data.
 *
 * Usage:
 *
 * require "/path/to/RpcPhp/services/server/DirectRpcServer.php";
 * $server = new DirectRpcServer;
 * $server->start();
 *
 * Or, with a singleton pattern:
 * require "/path/to/RpcPhp/services/server/DirectRpcServer.php";
 * DirectRpcServer::run();
 */
class DirectRpcServer extends JsonRpcServer
{

  /**
   * Whether the server can also use GET parameters for the
   * request.
   * @var boolean
   */
  var $allowGetParams = true;

  var $input = null;
  

  function setInput($input)
  {
	$this->input = $input;
  }
  /**
   * @override
   * @see JsonRpcServer::getInput()
   */
  function getInput()
  {
    return $this->input;
  }

  /**
   * Do no format.
   * @override
   * @param mixded $output
   * @return string
   */
  function formatOutput( $output )
  {
    return $output;
  }
  
  /**
   * @overridde
   */
  public function sendReply( $reply ) {
	// do not send the reply
  }
}
?>