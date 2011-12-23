
/*
#asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
*/
qx.Class.define("ligamanager.pages.CreateMatchesWizard",
{
	extend: qx.ui.window.Window,

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments, "Spiele Generierung", "icon/22/actions/list-add.png");
		
		this.setShowMaximize(false);
		this.setShowMinimize(false);
		this.setResizable(false);
		this.setLayout(new qx.ui.layout.Dock(null, 20));
		this.setModal(true);
		this.moveTo(150, 150);
		
	},

	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties: {
		
	},

	/*
	* ****************************************************************************
	* EVENTS
	* ****************************************************************************
	*/

	events:
	{
	},

	/*
	* ****************************************************************************
	* MEMBERS
	* ****************************************************************************
	*/

	members:
	{
	
		__createUi : function() {
			
		}
	}
});
