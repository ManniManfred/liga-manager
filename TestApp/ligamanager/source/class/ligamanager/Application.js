/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */


/**
 * This is the main application class of your custom application "LigaManager"
 * @asset(ligamanager/*)
 */
qx.Class.define("ligamanager.Application",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     * 
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

	  //qx.io.remote.Rpc.CONVERT_DATES = true;
	  
      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // Document is the application root
      var doc = this.getRoot();

	  var mainW = ligamanager.MainWidget.getInstance();
	  doc.add(mainW, {left: 0, top: 0, right: 0, bottom: 0});
	  
    }
  }
});
