qx.Class.define("ligamanager.ui.DateCellRenderer",
{
	extend : qx.ui.table.cellrenderer.Date,

	
	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties: {
		sourceFormat : {
			check : "qx.util.format.DateFormat",
			nullable : false,
			init : new qx.util.format.DateFormat("yyyy-MM-dd HH:mm:ss")
		}
	},
	
	members :
	{

		_getContentHtml : function(cellInfo)
		{
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
			cellInfo.value = value;
			
			return this.base(arguments, cellInfo);
		}
	}
}); 