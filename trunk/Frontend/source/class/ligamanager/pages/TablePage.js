

qx.Class.define("ligamanager.pages.TablePage",
{
	extend: qx.ui.container.Composite,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function(mainWidget) {
		this.base(arguments, new qx.ui.layout.Canvas());
		
		this.__mainWidget = mainWidget;
		
		var layout = new qx.ui.layout.VBox();
		layout.setSpacing(20);
		
		this.__content = new qx.ui.container.Composite(layout);
		this.__content.setPadding(20);
		
		var paScroll = new qx.ui.container.Scroll(this.__content);
		this.add(paScroll, {left:0, top: 0, right: 0,bottom: 0});
		
		
		this.__ligaManagerRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.LigaManager");
		
		this.__createSaisonChoice();
		this.__createMatchPart();
		
		
		var selection = this.__lvSaison.getSelection();
		if (selection == null || selection.length <= 0) {
			this.setCurrentSaison(null);
		} else {
			this.setCurrentSaison(selection[0].getUserData("saison"));
		}
	},

	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties: {
		currentSaison : {
			check : "Map",
			nullable : true,
			init : null,
			apply : "__applyCurrentSaison"
		}
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
		__mainWidget : null,
		__content : null,
		__ligaManagerRpc : null,
		
		__applyCurrentSaison : function(value, oldValue) {
			this.__updateMatches(value);
		},
		
		__createSaisonChoice : function() {
		
			var saisonChoice = this.__lvSaison = new qx.ui.form.SelectBox();
			saisonChoice.setAllowGrowX(false);
			this.__content.add(saisonChoice);
			
			// add saison items to select box
			var saisons = this.__ligaManagerRpc.callSync("GetSaisons");
			
			if (saisons != null) {
				var defaultItem = null;
				for (var i=0; i < saisons.length; i++) {
					var item = new qx.ui.form.ListItem(saisons[i].name);
					item.setUserData("saison", saisons[i]);
					saisonChoice.add(item);
					
					if (saisons[i].isDefault == true) {
						defaultItem = item;
					}
				}
				
				// select default saison
				if (defaultItem != null) {
					defaultItem.setIcon("ligamanager/22/default.png");
					saisonChoice.setSelection([defaultItem]);
				}
			}
			
			
			// add changed listener
			saisonChoice.addListener("changeSelection", this.__coSaisonChanged , this);
		},
		
		__coSaisonChanged : function(evt) {
			var selection = evt.getData();
			//var selection = this.__lvSaison.getSelection();
			if (selection == null || selection.length <= 0) {
				this.setCurrentSaison(null);
			} else {
				this.setCurrentSaison(selection[0].getUserData("saison"));
			}
		},
		
		//
		// handle matches
		//
		
		__matchesTable : null,
		__saisonTeams : null,
		__filterRadioGroup : null,
		
		
		__createMatchPart : function() {
		
			var laTeams = new qx.ui.basic.Label(this.tr("Table"));
			laTeams.setAppearance("label-sep");
			this.__content.add(laTeams);
			
			this.__matchesTable = new ligamanager.pages.EntityTable("play_table", 
				["Rang", "Mannschaft", "Spiele", "Tore", "Diff.", "Punkte"], 
				["rank", "name", "match_count", "goals", "goals_diff", "points"],
				false, false, false, false);
			this.__matchesTable.setHeight(300);
			this.__matchesTable.setAllowGrowX(false);
			this.__content.add(this.__matchesTable);
			
			//
			// modify table model
			//
			var model = this.__matchesTable.getTableModel();
			model.setColumnEditable(0, false);
			model.setColumnEditable(1, false);
			model.setColumnEditable(2, false);
			model.setColumnEditable(3, false);
			model.setColumnEditable(4, false);
			model.setColumnEditable(5, false);
			
			model.setColumnSortable(0, false);
			model.setColumnSortable(1, false);
			model.setColumnSortable(2, false);
			model.setColumnSortable(3, false);
			model.setColumnSortable(4, false);
			model.setColumnSortable(5, false);
			
			//
			// modify table columns
			//
			
			var table = this.__matchesTable.getTable();
			table.setColumnWidth( 0, 50 );
			table.setColumnWidth( 1, 200 );
			table.setColumnWidth( 2, 50 );
			table.setColumnWidth( 3, 50 );
			table.setColumnWidth( 4, 50 );
			table.setColumnWidth( 5, 50 );
			table.addListener("cellDblclick", this.__onCellDblClick, this);
		},
		
		__onCellDblClick : function(evt){
			var model = this.__matchesTable.getTableModel();
			var team = model.getRowData(evt.getRow());
			
			if (team.homepage != null && team.homepage.length > 0) {
				window.open(team.homepage)
			} else {
				alert("Bei der Mannschaft \"" + team.name + "\" ist keine Homepage angegeben.")
			}
		},
		
		__updateMatches : function(saison) {
		
			if (saison == null) return;
			
			
			// set filter
			var model = this.__matchesTable.getTableModel();
			model.setFilter({ "saison_id" : saison.id });
			model.startRpc();
		}
	}
});
