
qx.Class.define("ligamanager.pages.UserSettingsPage",
{
	extend: qx.ui.container.Scroll,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments);
		
		this.__coreRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.Core");

		
		this.__content = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
		this.__content.setPadding(20);
		this.add(this.__content);
		
		
	},

	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties: {},

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
			
	}
});
