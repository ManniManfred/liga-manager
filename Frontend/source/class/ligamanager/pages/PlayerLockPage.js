/*
#asset(qx/icon/${qx.icontheme}/22/actions/view-refresh.png)
#asset(qx/icon/${qx.icontheme}/22/actions/document-properties.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
*/

qx.Class.define("ligamanager.pages.PlayerLockPage",
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
		
		this.__ligaManagerRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.LigaManager");

		this.__content = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
		this.__content.setPadding(20);
		this.add(this.__content);
		
		
		this.__createUI();
		
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
		__ligaManagerRpc : null,
		
		__createUI : function() {
			var laTeams = new qx.ui.basic.Label(this.tr("Locks"));
			laTeams.setAppearance("label-sep");
			this.__content.add(laTeams);
		}
	}
});
