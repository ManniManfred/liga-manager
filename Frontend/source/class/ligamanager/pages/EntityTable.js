
/*
#asset(qx/icon/${qx.icontheme}/22/actions/view-refresh.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
#asset(ligamanager/22/default.png)
*/
qx.Class.define("ligamanager.pages.EntityTable",
{
	extend: qx.ui.container.Composite,

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function(tableName, colTitles, colKeys, canAdd, canRemove, canStore) {
		this.base(arguments, new qx.ui.layout.Dock());
		
		this.__tableName = tableName;
		this.__canAdd = canAdd === undefined ? true : canAdd;
		this.__canRemove = canRemove === undefined ? true : canRemove
		this.__canStore = canStore === undefined ? true : canStore
		
		this.__createToolbar();
		
		
		//
		// table view
		//
		this.__entitiesTableModel = new ligamanager.pages.EntityTableModel(this.__tableName);
		this.__entitiesTableModel.setColumns(colTitles, colKeys);
		
		for (var i = 0; i < colTitles.length; i++) {
			this.__entitiesTableModel.setColumnEditable(i, true);
		}
		
		
		this.__entitiesTable = new qx.ui.table.Table(this.__entitiesTableModel);
		this.add(this.__entitiesTable, {edge:"center"});
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
		__canAdd : null,
		__canRemove : null,
		__canStore : null,
	
		__tableName : null,
		__entitiesTableModel : null,
		__entitiesTable : null,
		__toolbar : null,
		__mainPart : null,
		
		
		getTableModel : function() {
			return this.__entitiesTableModel;
		},
		
		getTable : function() {
			return this.__entitiesTable;
		},
		
		
		__createToolbar : function() {
			
			//
			// toolbar
			//
			var toolbar = this.__toolbar =  new qx.ui.toolbar.ToolBar();
			this.add(toolbar, {edge: "north"});

			var part = this.__mainPart = new qx.ui.toolbar.Part();
			toolbar.add(part);

			var btRefresh = new qx.ui.toolbar.Button(this.tr("Refresh"), "icon/22/actions/view-refresh.png" );
			btRefresh.addListener("execute", this.__onRefresh, this );
			part.add(btRefresh);
			
			if (this.__canAdd || this.__canRemove) {
				part.add(new qx.ui.toolbar.Separator());
			}
			
			if (this.__canAdd) {
				var btNew = new qx.ui.toolbar.Button(this.tr("New"), "icon/22/actions/list-add.png");
				btNew.addListener("execute", this.__onNew, this);
				part.add(btNew);
			}

			if (this.__canRemove) {
				var btDelete = new qx.ui.toolbar.Button(this.tr("Remove"), "icon/22/actions/list-remove.png");
				btDelete.addListener("execute", this.__onDelete, this);
				part.add(btDelete);
			}

			if (this.__canStore) {
				part.add(new qx.ui.toolbar.Separator());
				
				var btSave = new qx.ui.toolbar.Button(this.tr("Save"), "icon/22/actions/document-save.png");
				btSave.addListener("execute", this.__onSave, this);
				part.add(btSave);
			}
			
			toolbar.setShow("icon");
		},
		
		addToolbarButtons : function(buttons) {
			if (buttons instanceof Array) {
				for (var i = 0; i < buttons.length; i++) {
					this.__mainPart.add(buttons[i]);
				}
			} else {
				this.__mainPart.add(buttons);
			}
			
			this.__toolbar.setShow("label");
			this.__toolbar.setShow("icon");
		},
		
		__onRefresh : function(evt) {
			this.__entitiesTableModel.reloadData();
		},
		
		__onNew : function(evt) {
			this.__entitiesTableModel.addNewRow();
		},
		
		__onDelete : function(evt) {
			var selection = this.__entitiesTable.getSelectionModel();
			var	selectedData = null;
			var docId = null;
			if( selection.isSelectionEmpty() == false ) {
			
				var selectedRanges = selection.getSelectedRanges();
				for (var i=0; i < selectedRanges.length; i++ ) {
					for (var index = selectedRanges[i]["minIndex"]; index <= selectedRanges[i]["maxIndex"]; index++ ) {
						this.__entitiesTableModel.removeRow(index);
					}
				}
			}
		},
		
		/**
		 * Stores all changed.
		 */
		__onSave : function(evt) {
			this.__entitiesTableModel.saveChanges();
		}
	}
});
