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
		__userRpc : null,
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
				
		__onChangeSelection : function(e) {
			var selection = this.__userTable.getSelectionModel();
			if( selection.isSelectionEmpty() ) {
				this.__btnDelete.setEnabled(false);
				this.__btnEdit.setEnabled(false);
			} else {
				this.__btnDelete.setEnabled(true);
				this.__btnEdit.setEnabled(true);
			}
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
			var selection = this.__userTable.getSelectionModel();
			var	selectedData = null;
			var userId = null;
			if( selection.isSelectionEmpty() == false ) {
			
				var selectedRanges = selection.getSelectedRanges();
				for (var i=0; i<selectedRanges.length; i++ ) {
					for (var index=selectedRanges[i]["minIndex"]; index <= selectedRanges[i]["maxIndex"]; index++ ) {
						selectedData = this.__userTableModel.getRowDataAsMap(index);
						userId = selectedData["id"];
						this.__userRpc.callSync("RemoveUser", userId );
						this.__userTableModel.removeRows( index, 1 );
					}
				}
			}
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
			
			this.__btnNew = new qx.ui.toolbar.Button(this.tr("New"), "icon/22/actions/list-add.png" );
			this.__btnNew.addListener("execute", this.__onNew, this );
			part.add(this.__btnNew);

			this.__btnDelete = new qx.ui.toolbar.Button(this.tr("Delete"), "icon/22/actions/list-remove.png" );
			this.__btnDelete.addListener("execute", this.__onDelete, this );
			this.__btnDelete.setEnabled( false );
			part.add(this.__btnDelete);
			
			this.__btnEdit = new qx.ui.toolbar.Button(this.tr("Edit"), "icon/22/actions/document-properties.png" );
			this.__btnEdit.addListener("execute", this.__onEdit, this );
			this.__btnEdit.setEnabled( false );
			part.add(this.__btnEdit);

			// tbd.
			part = new qx.ui.toolbar.Part();
			bar.add(part);
			
			
			//this.add( bar, {left:20, top:20} );
			container.add( bar, {edge:"north"} );

			
			this.__userTableModel = new qx.ui.table.model.Simple();
			
			this.__userTableModel.setColumns( ["id","username", "firstname", "lastname", "email"] );
			this.__userTableModel.setColumnNamesById( {"id":"Id","username":"Benutzer","firstname":"Vorname", "lastname":"Nachname", "email":"E-Mail"} );

			this.__userTable = new qx.ui.table.Table(this.__userTableModel);
			
			this.__userTable.setColumnWidth( 0, 40 );
			this.__userTable.setColumnWidth( 1, 200 );
			this.__userTable.setColumnWidth( 2, 200 );
			this.__userTable.setColumnWidth( 3, 200 );
			this.__userTable.setColumnWidth( 4, 200 );
			
			this.__userTable.setShowCellFocusIndicator( false );
			
			this.__userTable.addListener( "dblclick", this.__onDblClick, this );
			this.__userTable.addListener( "keypress", this.__onKeyPressed, this );
			
			var selectionModel = new qx.ui.table.selection.Model();
			selectionModel.setSelectionMode( qx.ui.table.selection.Model.SINGLE_SELECTION );
			selectionModel.addListener( "changeSelection", this.__onChangeSelection, this );
			this.__userTable.setSelectionModel( selectionModel );
			
			container.add( this.__userTable, {edge:"center"} );
			
			this.add( container, {left:20, top:70, bottom:20 } );
	
		},
		
		
		// update data in usertable
		__updateUserTable : function() {
		
			var Users = this.__userRpc.callSync("GetUsers");
			
			this.__userTableModel.setDataAsMapArray( Users );
		}
			
	}
});
