/*
#asset(qx/icon/${qx.icontheme}/22/actions/view-refresh.png)
#asset(qx/icon/${qx.icontheme}/22/actions/document-properties.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
*/

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
		this.base(arguments, new qx.ui.layout.Canvas);
		
		this.__userRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.Usermanager");

		this.__createUI();
		
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
		__userTable : null,
		__userModel : null,
		
		__btnNew : null,
		__btnDelete : null,
		__btnEdit : null,
		
		
		//
		// Event-Handler
		//
		
		__onKeyPressed : function(e) {
			if (e.getKeyIdentifier() == "Enter") {
				this.__showUserDialog();
			}
		},
		
		__onCellClick : function(e) {
			__btnDelete.setEnabled(true);
			__btnEdit.setEnabled(true);
		},
		
		__onDblClick : function() {
			this.__showUserDialog();
		},
		
		__onRefresh : function() {
			this.__updateUserTable();
		},
		
		__onEdit : function() {
			this.__showUserDialog();
		},

		__onDelete : function() {
			this.__showUserDialog();
		},

		__onNew : function() {
			this.__showUserDialog();
		},
		
		//
		// Data
		//
		
		
		// show User-Edit Dialog
		__showUserDialog : function() {
		},
		
		
		__createUI : function() {
		
			var laCaption = new qx.ui.basic.Label(this.tr("User Manager"));
			laCaption.setFont("bold");
			laCaption.setPadding(5);
			laCaption.setBackgroundColor("#CCCCCC");
			laCaption.setAllowGrowX(true);
			this.add(laCaption, {left:20, top:20, right:20} );
	
	
			var container = new qx.ui.container.Composite( new qx.ui.layout.Dock() );
			
			// 
			// Toolbar
			//
			
			var bar = new qx.ui.toolbar.ToolBar();
			var button, part;
			
			// refresh
			part = new qx.ui.toolbar.Part();
			bar.add(part);
			
			button = new qx.ui.toolbar.Button(this.tr("Refresh"), "icon/22/actions/view-refresh.png" );
			button.addListener("execute", this.__onRefresh, this );
			part.add(button);
			
			
			// edit, delete, new
			part = new qx.ui.toolbar.Part();
			bar.add(part);
			
			__btnNew = new qx.ui.toolbar.Button(this.tr("New"), "icon/22/actions/list-add.png" );
			__btnNew.addListener("execute", this.__onNew, this );
			part.add(__btnNew);

			__btnDelete = new qx.ui.toolbar.Button(this.tr("Delete"), "icon/22/actions/list-remove.png" );
			__btnDelete.addListener("execute", this.__onDelete, this );
			__btnDelete.setEnabled( false );
			part.add(__btnDelete);
			
			__btnEdit = new qx.ui.toolbar.Button(this.tr("Edit"), "icon/22/actions/document-properties.png" );
			__btnEdit.addListener("execute", this.__onEdit, this );
			__btnEdit.setEnabled( false );
			part.add(__btnEdit);

			// tbd.
			part = new qx.ui.toolbar.Part();
			bar.add(part);
			
			
			//this.add( bar, {left:20, top:20} );
			container.add( bar, {edge:"north"} );

			
			__userTableModel = new qx.ui.table.model.Simple();
			
			__userTableModel.setColumns( ["username", "firstname", "lastname", "email"] );
			__userTableModel.setColumnNamesById( {"username":"Benutzer","firstname":"Vorname", "lastname":"Nachname", "email":"E-Mail"} );

			__userTable = new qx.ui.table.Table(__userTableModel);
			
			__userTable.setColumnWidth( 0, 200 );
			__userTable.setColumnWidth( 1, 200 );
			__userTable.setColumnWidth( 2, 200 );
			__userTable.setColumnWidth( 3, 200 );
			
			__userTable.setShowCellFocusIndicator( false );
			
			__userTable.addListener( "cellClick", this.__onCellClick, this );
			__userTable.addListener( "dblclick", this.__onDblClick, this );
			__userTable.addListener( "keypress", this.__onKeyPressed, this );
			
			
			container.add( __userTable, {edge:"center"} );
			
			this.add( container, {left:20, top:70, bottom:20 } );
	
		},
		
		
		// update data in usertable
		__updateUserTable : function() {
		
			var Users = this.__userRpc.callSync("GetUsers");
			
			__userTableModel.setDataAsMapArray( Users );
		}
			
	}
});
