qx.Class.define("ligamanager.ui.DateCellEditor",
{
	extend : qx.ui.table.celleditor.AbstractField,

	
	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties: {
		displayFormat : {
			check : "qx.util.format.DateFormat",
			nullable : false,
			init : new qx.util.format.DateFormat("dd.MM.yyyy HH:mm")
		},
		
		sourceFormat : {
			check : "qx.util.format.DateFormat",
			nullable : false,
			init : new qx.util.format.DateFormat("yyyy-MM-dd HH:mm:ss")
		}
	},
	
	members :
	{

		_createEditor : function()
		{
			var cellEditor = new qx.ui.form.DateField();
			cellEditor.setDateFormat(this.getDisplayFormat());
			return cellEditor;
		},

		createCellEditor : function(cellInfo)
		{
			var cellEditor = this._createEditor();

			var value = cellInfo.value;
			if (value == null) {
				value = new Date();
			} else if (typeof(value) == 'string') {
				if (value.length == 0) {
					value = new Date();
				} else {
					value = this.getSourceFormat().parse(value);
				}
			}
			
			cellEditor.originalValue = value;
			cellEditor.setValue(value);

			// cellEditor.addListener("appear", function() {
				// cellEditor.selectAllText();
			// });

			return cellEditor;
		},
		
		getCellEditorValue : function(cellEditor) {
			return this.getSourceFormat().format(cellEditor.getValue());
		}
	
	}
}); 