
qx.Class.define("ligamanager.pages.EntityTableModel",
{
  extend : qx.ui.table.model.Remote,

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function(rpc, entityName) {
		this.base(arguments);
		
		//
		// init members
		//
		this.__toAdd = [];
		this.__toUpdate = [];
		this.__toDelete = [];
		
		this.__idName = "id";
		
		this.__rpc = rpc;
		this.__entityName = entityName;
		
	},
	
	
	members :
	{
		__rpc : null,
		__entityName : null,
		__idName : null,

		__toAdd : null,
		__toUpdate : null,
		__toDelete : null,
		
		addNewRow : function(row) {
			var rowCount = this.getRowCount();
			
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
			
			if (this.__toUpdate.length > 0) {
				updates["toUpdate"] = this.__toUpdate;
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
		
		saveChanges : function() {
			
			var updates = this.getChanges();
			
			if (updates != null) {
				this.__rpc.callSync("Update" + this.__entityName, updates);
				
				this.reloadData();
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
			if (rowData[this.__idName] != null) {
				// add the row data only if it isn't in the __toAdd array
				this.__toUpdate.push(rowData);
			}
		},
		
		// overloaded - called whenever the table requests the row count
		_loadRowCount : function()
		{
			this.__toAdd = [];
			this.__toUpdate = [];
			this.__toDelete = [];
				
			var self = this;
			
			// send request
			this.__rpc.callAsync(function(result, ex) {
				if (ex == null) {
					if (result != null) {
						// Apply it to the model - the method "_onRowCountLoaded" has to be called
						self._onRowCountLoaded(result);
					}
				} else {
					alert("Fehler beim Laden der Saisons.");
				}
			}, "Get" + this.__entityName + "Count");

		},


		// overloaded - called whenever the table requests new data
		_loadRowData : function(firstRow, lastRow)
		{
			var self = this;
			
			// send request
			this.__rpc.callAsync(function(result, ex) {
				if (ex == null) {
					if (result != null) {
						// Apply it to the model - the method "_onRowCountLoaded" has to be called
						self._onRowDataLoaded(result);
					}
				} else {
					alert("Fehler beim Laden der Saisons.");
				}
				
			}, "Get" + this.__entityName, firstRow, lastRow);
		}
		
	}
});