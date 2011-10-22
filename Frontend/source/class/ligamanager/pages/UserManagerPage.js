

qx.Class.define("ligamanager.pages.UserManagerPage",
{
	extend: qx.ui.container.Composite,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments, new qx.ui.layout.Canvas());
		
		this.__userRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.Usermanager");

		this.__createUserTable();
		this.__updateUserTable();
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
		__createUserTable : function() {
		},
		
		__updateUserTable : function() {
			var Users = this.__userRpc.callSync("GetUsers");
			
			var tableModel = new qx.ui.table.model.Simple();
			
			tableModel.setColumns( ["username", "firstname", "lastname", "email"] );
			tableModel.setColumnNamesById( {"username":"Benutzer","firstname":"Vorname", "lastname":"Nachname", "email":"E-Mail"} );
			tableModel.setDataAsMapArray( Users );
			
			var table = new qx.ui.table.Table(tableModel);
			
			table.setColumnWidth( 0, 200 );
			table.setColumnWidth( 1, 200 );
			table.setColumnWidth( 2, 200 );
			table.setColumnWidth( 3, 200 );
			
			table.setShowCellFocusIndicator( false );
			this.add( table, {left:20, top:20} );
		}
			
	}
});
