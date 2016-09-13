qx.Class.define("ligamanager.pages.SaisonPlayersEditor",
{
	extend : qx.core.Object,
	implement : qx.ui.table.ICellEditorFactory,

	
	/*
	*****************************************************************************
	 EVENTS
	*****************************************************************************
	*/

	events :
	{
		/**
		 * Fired after the widget appears on the screen.
		 */
		dataEdited : "qx.event.type.Data"

	},
	
	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties: {
		player : {
			check : "Array",
			nullable : true,
			init : null
		},
		
		match : {
			check : "Map",
			nullable : true,
			init : null
		}
	},
	
	members :
	{
		// interface implementation
		createCellEditor : function(cellInfo)
		{
			var cellEditor = new qx.ui.form.ComboBox().set({
				appearance: "table-editor-combobox"
			});

			var value = cellInfo.value;
			cellEditor.originalValue = value;
			cellEditor.setUserData("cellInfo", cellInfo);
			
			// check if renderer does something with value
			var cellRenderer = cellInfo.table.getTableColumnModel().getDataCellRenderer(cellInfo.col);
			var label = qx.bom.String.unescape(cellRenderer._getContentHtml(cellInfo));
			if ( value != label ) {
				value = label;
			}

			// replace null values
			if (value === null || value === undefined) {
				value = "";
			}

			var players = this.getPlayer();
			var match = this.getMatch();
			
			if (players && match)
			{
				var item;
				for (var i=0,l=players.length; i<l; i++)
				{
					var row = players[i];
					if (row["id_saison_team"] == match["id_saison_team1"] 
							|| row["id_saison_team"] == match["id_saison_team2"] ) {
						var str = row["firstname"] + " " + row["lastname"] + " (" + row["team_name"] + ")";
						item = new qx.ui.form.ListItem(str);
						cellEditor.add(item);
					}
				};
			}

			cellEditor.setValue("" + value);

			cellEditor.addListener("appear", function() {
				cellEditor.selectAllText();
			});

			return cellEditor;
		},

		// interface iplementations
		getCellEditorValue : function(cellEditor)
		{
			var value = cellEditor.getValue() || "";

			// var players = this.getPlayer();
			// var match = this.getMatch();
			
			// if (players && match && value.length > 0) {
				// //looking for player
				// for (var i=0,l=players.length; i<l; i++)
				// {
					// var row = players[i];
					// if ((row["id_saison_team"] == match["id_saison_team1"] 
							// || row["id_saison_team"] == match["id_saison_team2"])
						// && ){
						
					// }
				// }
			// }
			//if (typeof cellEditor.originalValue == "number") {
			//	value = parseFloat(value);
			//}
			
			var cellInfo = cellEditor.getUserData("cellInfo");
			
			var data = {"value" : value, "row" : cellInfo.row, "col" : cellInfo.col};
			this.fireDataEvent("dataEdited", data);
			
			return value;
		}
	}
}); 