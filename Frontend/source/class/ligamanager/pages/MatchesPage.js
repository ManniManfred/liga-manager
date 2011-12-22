
/*
#asset(qx/icon/${qx.icontheme}/22/actions/view-refresh.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
#asset(ligamanager/22/default.png)
*/
qx.Class.define("ligamanager.pages.MatchesPage",
{
	extend: qx.ui.window.Desktop,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments, new qx.ui.window.Manager());
		
		var layout = new qx.ui.layout.VBox();
		layout.setSpacing(20);
		
		this.__content = new qx.ui.container.Composite(layout);
		this.__content.setPadding(20);
		
		var paScroll = new qx.ui.container.Scroll(this.__content);
		this.add(paScroll, {left:0, top: 0, right: 0,bottom: 0});
		
		this.__ligaManagerRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.LigaManager");
		
		this.__createSaisonChoice();
		this.__createMatchPart();
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
		__content : null,
		__ligaManagerRpc : null,
		
		__applyCurrentSaison : function(value, oldValue) {
			this.__updateMatches(value);
		},
		
		__createSaisonChoice : function() {
		
			var saisonChoice = new qx.ui.form.SelectBox();
			saisonChoice.setAllowGrowX(false);
			this.__content.add(saisonChoice);
			
			// add changed listener
			saisonChoice.addListener("changeSelection", this.__coSaisonChanged , this);
			
			
			// add saison items to select box
			this.__ligaManagerRpc.callAsync(function(saisons, ex) {
				saisonChoice.removeAll();
				if (ex == null && saisons != null) {
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
			}, "GetSaisons");
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
		
		__createMatchPart : function() {
		
			var laTeams = new qx.ui.basic.Label(this.tr("Matches"));
			laTeams.setAppearance("label-sep");
			this.__content.add(laTeams);
			
			this.__matchesTable = new ligamanager.pages.EntityTable("match", 
				["Id", "Datum", "Mannschaft 1", "Mannschaft 2", "Tore 1", "Tore 2"], 
				["id", "date", "id_saison_team1", "id_saison_team2", "goal1", "goal2"]);
			this.__matchesTable.setHeight(300);
			this.__matchesTable.setAllowGrowX(false);
			this.__content.add(this.__matchesTable);
			
			var table = this.__matchesTable.getTable();
			table.setColumnWidth( 0, 50 );
			table.setColumnWidth( 1, 150 );
			table.setColumnWidth( 2, 200 );
			table.setColumnWidth( 3, 200 );
			table.setColumnWidth( 4, 50 );
			table.setColumnWidth( 5, 50 );
			
			var model = table.getTableModel();
			
			// set row defaults
			model.setNewRowDefaults({ "date" : new Date() });
			
			
			
			var tcm = table.getTableColumnModel();

			// bool renderer and editor
			// tcm.setDataCellRenderer(4, new qx.ui.table.cellrenderer.Boolean());
			// tcm.setCellEditorFactory(4, new qx.ui.table.celleditor.CheckBox());
			
			// date renderer / editor
			//var dateRenderer = new qx.ui.table.cellrenderer.Date();
			//tcm.setDataCellRenderer(1, dateRenderer);
			tcm.setCellEditorFactory(1, new ligamanager.ui.DateCellEditor()); 
			
			
			// select box for teams
			this.__teamReplaceRenderer = new qx.ui.table.cellrenderer.Replace();
			this.__teamReplaceRenderer.setUseAutoAlign(false);
			tcm.setDataCellRenderer(2, this.__teamReplaceRenderer);
			tcm.setDataCellRenderer(3, this.__teamReplaceRenderer);
			
			
			this.__teamSelectBox = new qx.ui.table.celleditor.SelectBox();
			tcm.setCellEditorFactory(2, this.__teamSelectBox);
			tcm.setCellEditorFactory(3, this.__teamSelectBox);
		},
		
		__updateMatches : function(saison) {
		
			if (saison == null) return;
			
			
			// create select box with teams
			var saisonTeams = this.__ligaManagerRpc.callSync("GetOnlyTeamsOfSaison", saison.id);
			
			
			if (saisonTeams == null || this.__matchesTable == null) return;
			
			var replaceMap = {};
			var teams = [];
			for (var i = 0; i < saisonTeams.length; i++) {
				var row = saisonTeams[i];
				replaceMap[row["id"]] = row["name"];
				teams.push([row["name"], null, row["id"]]);
			}
			
			this.__teamSelectBox.setListData(teams);
			this.__teamReplaceRenderer.setReplaceMap(replaceMap);
			//this.__teamReplaceRenderer.addReversedReplaceMap();
			
			//this.__matchesTable.getTable().updateContent();
			
			
			// set filter
			var model = this.__matchesTable.getTableModel();
			var filter = "id_saison_team1 in (select id from saison_team where id_saison = " + saison.id + ")";
			model.setFilter(filter);
		}
		
	}
});
