/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(m_ligamanager/*)
#asset(qx/mobile/icon/${qx.mobile.platform}/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "m_ligamanager"
 */
qx.Class.define("m_ligamanager.Application",
{
	extend : qx.application.Mobile,



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
     */
		main : function()
		{
			// Call super class
			this.base(arguments);

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
				Remove or edit the following code to create your application.
			-------------------------------------------------------------------------
			*/

			var mainWidget = new m_ligamanager.MainWidget();
			mainWidget.show();
	 
	  
		}
	}
});
