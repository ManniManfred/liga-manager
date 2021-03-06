
qx.Class.define("ligamanager.pages.EntityTableModel",
{
  extend : qx.ui.table.model.Remote,

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function(tableName, startRpc) {
		this.base(arguments);
		
		//
		// init members
		//
		this.__startRpc = startRpc === undefined ? true : startRpc;
		this.__toAdd = [];
		this.__toUpdate = {};
		this.__toDelete = [];
		
		this.__idName = "id";
		
		this.__tableName = tableName;
		this.__rpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
		
	},
	
	
	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties: {
		
		newRowDefaults : {
			check : "Map",
			nullable : true,
			init : null
		}
		
	},
	
	/*
	* ****************************************************************************
	* EVENTS
	* ****************************************************************************
	*/

	events:
	{
		/**
		 * Fired when the data was loaded from backend
		 */
		"dataLoaded" : "qx.event.type.Event"
	},
	
	members :
	{
		__rpc : null,
		__tableName : null,
		__idName : null,
		
		__startRpc : null,
		__toAdd : null,
		__toUpdate : null,
		__toDelete : null,
		
		__filter : null,
		
		getFilter : function() {
			return this.__filter;
		},
		
		setFilter : function(filter) {
			this.__filter = filter;
			this.reloadData();
		},
		
		addNewRows : function(rows) {
			var rowCount = this.getRowCount();
			
			for (var i = 0; i < rows.length; i++) {
				this.__toAdd.push(rows[i]);
			}
			
			// Inform the listeners
			if (this.hasListener("dataChanged"))
			{
			  var data =
			  {
				firstRow    : rowCount,
				lastRow     : rowCount,
				firstColumn : 0,
				lastColumn  : this.getColumnCount() - 1
			  };

			  this.fireDataEvent("dataChanged", data);
			}
		},
		
		addNewRow : function() {
			var rowCount = this.getRowCount();
			
			var rowDefaults = this.getNewRowDefaults();
			var row;
			if (rowDefaults != null)
				row = qx.lang.Object.clone(rowDefaults);
			else 
				row = {};
			this.__toAdd.push(row);
			
			// Inform the listeners
			if (this.hasListener("dataChanged"))
			{
			  var data =
			  {
				firstRow    : rowCount,
				lastRow     : rowCount,
				firstColumn : 0,
				lastColumn  : this.getColumnCount() - 1
			  };

			  this.fireDataEvent("dataChanged", data);
			}
		},
		
		removeRow : function(index) {
			var row = this.getRowData(index);
			
			if (row[this.__idName] == null) {
				qx.lang.Array.remove(this.__toAdd, row);
				
				// Inform the listeners
				if (this.hasListener("dataChanged"))
				{
				  var data =
				  {
					firstRow    : index,
					lastRow     : this.getRowCount() - 1,
					firstColumn : 0,
					lastColumn  : this.getColumnCount() - 1
				  };

				  this.fireDataEvent("dataChanged", data);
				}
			} else {
				this.__toDelete.push(row[this.__idName]);
				this.base(arguments, index);
			}
		},
		
		
		
		hasChanges : function() {
			return this.getChanges() != null;
		},
		
		getChanges : function() {
			var haveToUpdate = false;
			var updates = {};
			
			if (this.__toAdd.length > 0) {
				updates["toAdd"] = this.__toAdd;
				haveToUpdate = true;
			}
			
			if (!qx.lang.Object.isEmpty(this.__toUpdate)) {
				updates["toUpdate"] = qx.lang.Object.getValues(this.__toUpdate);
				haveToUpdate = true;
			}
			
			if (this.__toDelete.length > 0) {
				updates["toDelete"] = this.__toDelete;
				haveToUpdate = true;
			}
			
			if (haveToUpdate) {
				return updates;
			}
			return null;
		},
		
		saveChanges : function(callback, context) {
			
			var updates = this.getChanges();
			var self = this;
			
			if (updates != null) {
				this.__rpc.callAsync(function(result, ex) {
					try {
						if (ex == null) {
							self.clearChanges();
							self.reloadData();
						} else {
							alert("Beim Speichern ist folgender Fehler aufgetreten: " + ex);
						}
					} finally {
						if (callback != null) {
							callback.call(context);
						}
					}
				}, "UpdateEntities", this.__tableName, updates);
			}
		},
		
		clearChanges : function() {
			this.__toAdd = [];
			this.__toUpdate = {};
			this.__toDelete = [];
		},
		
		handleUnsavedData : function(callback, context) {
			var updates = this.getChanges();
			
			if (updates != null) {
				dialog.Dialog.confirm(qx.locale.Manager.tr("que_save_data"), 
					function(result) {
						if (result) {
							this.__rpc.callSync("UpdateEntities", this.__tableName, updates);
						}
						callback.call(context, result);
					}, this);
			} else {
				callback.call(context, false);
			}
		},
		
		// override
		getRowCount : function() {
			var result = this.base(arguments);
			return result + this.__toAdd.length;
		},
		
		getRowData : function(rowIndex) {
			var result = this.base(arguments, rowIndex);
			var rowCount = this.getRowCount() - this.__toAdd.length;
			if (rowIndex >= rowCount) {
				var addedIndex = rowIndex - rowCount;
				return this.__toAdd[addedIndex];
			} else {
				return result;
			}
		},
		
		
		// override
		setValue : function(colIndex, rowIndex, value) {
			this.base(arguments, colIndex, rowIndex, value);
			
			var rowData = this.getRowData(rowIndex);
			if (rowData != null && rowData[this.__idName] != null) {
				// add the row data only if it isn't in the __toAdd array
				this.__toUpdate[rowData[this.__idName]] = rowData;
			}
		},
		
		startRpc : function() {
			
			if (!this.__startRpc) {
				this.__startRpc = true;
				if (this.__inLoadRowCount) {
					this.__loadRowCount();
				}
			}
		},
		
		// overloaded - called whenever the table requests the row count
		_loadRowCount : function()
		{
			//this.__loadRowCount();
			this.handleUnsavedData(this.__loadRowCount, this);
		},

		__loadRowCount : function(changesWereSaved) {
			this.__inLoadRowCount = true;
			
			if (this.__startRpc) {
				this.clearChanges();
				var self = this;
				
				// send request
				this.__rpc.callAsync(function(result, ex) {
					try {
						if (ex == null) {
							if (result != null) {
								// Apply it to the model - the method "_onRowCountLoaded" has to be called
								self._onRowCountLoaded(result);
							}
						} else {
							alert("Fehler beim Laden der Element der Tabelle " + this.__tableName);
						}
					} finally {
						self.__inLoadRowCount = false;
					}
				}, "GetEntitiesCount", this.__tableName, this.getFilter());
			}
		},

		// overloaded - called whenever the table requests new data
		_loadRowData : function(firstRow, lastRow)
		{
			//this.__loadRowData(firstRow, lastRow);
			this.handleUnsavedData(function(changesWereSaved) {
				if (changesWereSaved == true) {
					if (this.__toAdd.length > 0) {
						//if the count has changed, call reload, to get the new count.
						var newCount = this.getRowCount();
						this.clearChanges();
						this._onRowCountLoaded(newCount);
						this.__loadRowData(firstRow, lastRow);
						//this.reloadData();
					} else {
						this.__loadRowData(firstRow, lastRow);
					}
				} else {
					this.__loadRowData(firstRow, lastRow);
				}
			}, this);
		},
		
		__loadRowData : function(firstRow, lastRow) {
		
			this.clearChanges();
			
			var sortIndex = this.getSortColumnIndex();
			var sortField = this.getColumnId(sortIndex);
			var sortOrder =  this.isSortAscending() ? "asc" : "desc";
			
			var self = this;
			
			// send request
			this.__rpc.callAsync(function(result, ex) {
				if (ex == null) {
					if (result != null) {
						// Apply it to the model - the method "_onRowCountLoaded" has to be called
						self._onRowDataLoaded(result);
						self.fireEvent("dataLoaded");
					}
				} else {
					alert("Fehler beim Laden der Saisons.");
				}
				
			}, "GetEntities", this.__tableName, sortField, sortOrder, firstRow, lastRow, this.getFilter());
		},
		
		getRpcParams : function() {
			var sortIndex = this.getSortColumnIndex();
			var sortField = this.getColumnId(sortIndex);
			var sortOrder =  this.isSortAscending() ? "asc" : "desc";
			
			return [this.__tableName, sortField, sortOrder, 0, this.getRowCount(), this.getFilter()];
		}
	}
});