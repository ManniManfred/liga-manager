qx.Class.define("ligamanager.pages.SaisonPlayersRenderer",
{
	extend : qx.ui.table.cellrenderer.String,

	
	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties: {
		player : {
			check : "Array",
			nullable : true,
			init : null,
			apply : "__applyPlayer"
		}
	},
	
	members :
	{

		__mapping : null,
		
		__applyPlayer : function(value, oldValue) {
			
			if (value != null) {
				this.__mapping = {};
				for (var i = 0, l = value.length; i < l; i++) {
					this.__mapping[value[i]["id"]] = value[i]["firstname"] + " " + value[i]["lastname"];
				}
			} else {
				this.__mapping = null;
			}
		},
		
		_getContentHtml : function(cellInfo)
		{
			if (this.__mapping != null) {
				var value = cellInfo.value;
				if (value == null) {
					value = "";
				} else if (typeof(value) == 'number') {
					value = this.__mapping[cellInfo.value];
				}
				cellInfo.value = value;
			}
			
			return this.base(arguments, cellInfo);
		}
	}
}); 