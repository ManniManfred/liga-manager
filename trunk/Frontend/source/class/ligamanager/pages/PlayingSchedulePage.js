

qx.Class.define("ligamanager.pages.PlayingSchedulePage",
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
		__saisonFilter : null,
		
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
		
		
		__createMatchPart : function() {
		
			var laTeams = new qx.ui.basic.Label(this.tr("Matches"));
			laTeams.setAppearance("label-sep");
			this.__content.add(laTeams);
			
			this.__matchesTable = new ligamanager.pages.EntityTable("match", 
				["Id", "Datum", "Mannschaft 1", "Mannschaft 2", "Tore 1", "Tore 2"], 
				["id", "date", "id_saison_team1", "id_saison_team2", "goal1", "goal2"],
				false, false, false, false);
			this.__matchesTable.setHeight(300);
			this.__matchesTable.setAllowGrowX(false);
			this.__content.add(this.__matchesTable);
			
			//
			// add team filter
			//
			
			var meTeams = this.__meTeams = new qx.ui.menu.Menu();

			var btTeams = new qx.ui.toolbar.MenuButton(qx.locale.Manager.tr("Team Filter"), 
				"ligamanager/22/filter.png", meTeams);
			btTeams.setToolTipText(qx.locale.Manager.tr("Choose a team to filter"));
			
			this.__matchesTable.addToolbarButtons([new qx.ui.toolbar.Separator(),
				btTeams]);
			
			
			
			//
			// modify table model
			//
			var model = this.__matchesTable.getTableModel();
			model.sortByColumn(1, true);
			model.setColumnEditable(0, false);
			model.setColumnEditable(1, false);
			model.setColumnEditable(2, false);
			model.setColumnEditable(3, false);
			model.setColumnEditable(4, false);
			model.setColumnEditable(5, false);
			
			
			
			
			//
			// modify table columns
			//
			
			var table = this.__matchesTable.getTable();
			table.setColumnWidth( 0, 50 );
			table.setColumnWidth( 1, 150 );
			table.setColumnWidth( 2, 200 );
			table.setColumnWidth( 3, 200 );
			table.setColumnWidth( 4, 50 );
			table.setColumnWidth( 5, 50 );
			
			var tcm = table.getTableColumnModel();

			// date renderer / editor
			var dateRenderer = new ligamanager.ui.DateCellRenderer();
			dateRenderer.setDateFormat(ligamanager.pages.MatchesPage.DISPLAY_FORMAT);
			
			tcm.setDataCellRenderer(1, dateRenderer);
			tcm.setCellEditorFactory(1, new ligamanager.ui.DateCellEditor()); 
			
			
			// select box for teams
			this.__teamReplaceRenderer = new qx.ui.table.cellrenderer.Replace();
			this.__teamReplaceRenderer.setUseAutoAlign(false);
			tcm.setDataCellRenderer(2, this.__teamReplaceRenderer);
			tcm.setDataCellRenderer(3, this.__teamReplaceRenderer);
		},
		
		
		__updateMatches : function(saison) {
		
			if (saison == null) return;
			
			// create select box with teams
			var saisonTeams = this.__saisonTeams = this.__ligaManagerRpc.callSync("GetOnlyTeamsOfSaison", saison.id);
			
			if (saisonTeams == null || this.__matchesTable == null) return;
			
			var filterRadioGroup = new qx.ui.form.RadioGroup();
			filterRadioGroup.addListener("changeSelection", this.__onFilterTeam , this);
		
			this.__meTeams.removeAll();
			var btAllTeams = new qx.ui.menu.RadioButton(this.tr("All Teams"));
			btAllTeams.setValue(true);
			filterRadioGroup.add(btAllTeams);
			this.__meTeams.add(btAllTeams); 
			
			var replaceMap = {};
			for (var i = 0; i < saisonTeams.length; i++) {
				var row = saisonTeams[i];
				replaceMap[row["id"]] = row["name"];
				
				var btTeam = new qx.ui.menu.RadioButton(saisonTeams[i].name);
				btTeam.setUserData("team", saisonTeams[i]);
				filterRadioGroup.add(btTeam);
				this.__meTeams.add(btTeam);
			}
			
			this.__teamReplaceRenderer.setReplaceMap(replaceMap);
			
			
			// set filter
			var model = this.__matchesTable.getTableModel();
			this.__saisonFilter = "id_saison_team1 in (select id from saison_team where id_saison = " + saison.id + ")";
			model.setFilter(this.__saisonFilter);
			model.startRpc();
		},
		
		__onFilterTeam : function(evt) {
			var selection = evt.getData();
			var team;
			if (selection == null || selection.length <= 0) {
				team = null;
			} else {
				team = selection[0].getUserData("team");
			}
			
			var model = this.__matchesTable.getTableModel();
			
			var filter = this.__saisonFilter;
			if (team != null) {
				filter += " and (id_saison_team1 = " + team.id
					+ " or id_saison_team2 = " + team.id + ")";
			}
			model.setFilter(filter);
		}
	}
});
