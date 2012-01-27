
/*
#asset(qx/icon/${qx.icontheme}/22/actions/document-save.png)
#asset(qx/icon/${qx.icontheme}/22/actions/view-refresh.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
#asset(ligamanager/22/default.png)
*/
qx.Class.define("ligamanager.pages.ManageMatchesPage",
{
	extend: qx.ui.window.Desktop,
	implement: [ligamanager.pages.IPage],

	/*
	*****************************************************************************
	STATICS
	*****************************************************************************
	*/

	statics: {
		DISPLAY_FORMAT : new qx.util.format.DateFormat("dd.MM.yyyy HH:mm"),
		SOURCE_FORMAT : new qx.util.format.DateFormat("yyyy-MM-dd HH:mm:ss")
	},
	
	
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
		//this.__coreRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
		
		this.__createMatchPart();
		this.__createDetailsPart();
		
		this.__updateMatches();
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
		__content : null,
		__ligaManagerRpc : null,
		__laDetails : null,
		__replaceMap : null,
		
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
				false, false, true, false);
			this.__matchesTable.setHeight(300);
			this.__matchesTable.setAllowGrowX(false);
			this.__content.add(this.__matchesTable);
			
			
			var table = this.__matchesTable.getTable();
			
			table.getSelectionModel().addListener("changeSelection", this.__updateDetails, this);
			
			table.setColumnWidth( 0, 50 );
			table.setColumnWidth( 1, 150 );
			table.setColumnWidth( 2, 200 );
			table.setColumnWidth( 3, 200 );
			table.setColumnWidth( 4, 50 );
			table.setColumnWidth( 5, 50 );
			
			var model = table.getTableModel();
			model.sortByColumn(1, true);
			model.setColumnEditable(2, false);
			model.setColumnEditable(3, false);
			
			
			var tcm = table.getTableColumnModel();

			// date renderer / editor
			var dateRenderer = new ligamanager.ui.DateCellRenderer();
			dateRenderer.setDateFormat(ligamanager.Core.DISPLAY_FORMAT);
			
			tcm.setDataCellRenderer(1, dateRenderer);
			tcm.setCellEditorFactory(1, new ligamanager.ui.DateCellEditor()); 
			
			
			// select box for teams
			this.__teamReplaceRenderer = new qx.ui.table.cellrenderer.Replace();
			this.__teamReplaceRenderer.setUseAutoAlign(false);
			tcm.setDataCellRenderer(2, this.__teamReplaceRenderer);
			tcm.setDataCellRenderer(3, this.__teamReplaceRenderer);
		},
		
		
		__createDetailsPart : function() {
		
			var laDetails = this.__laDetails = new qx.ui.basic.Label(this.tr("Details"));
			laDetails.setAppearance("label-sep");
			this.__content.add(laDetails);
			
			
			var hbox = new qx.ui.container.Composite(new qx.ui.layout.HBox(2).set({alignY : "middle"}));
			this.__content.add(hbox);
			
			var laDate = new qx.ui.basic.Label(this.tr("Date"));
			hbox.add(laDate);
			
			var fiDate = this.__fiDate = new qx.ui.form.DateField();
			fiDate.setDateFormat(ligamanager.Core.DISPLAY_FORMAT);
			hbox.add(fiDate);
			
			
			//hbox = new qx.ui.container.Composite(new qx.ui.layout.HBox(2).set({alignY : "middle"}));
			//this.__content.add(hbox);
			
			var laGoals = new qx.ui.basic.Label(this.tr("Goals"));
			hbox.add(laGoals);
			
			var fiGoals1 = this.__fiGoals1 = new ligamanager.ui.NumberField();
			hbox.add(fiGoals1);
			
			hbox.add(new qx.ui.basic.Label(this.tr(" vs ")));
			
			var fiGoals2 = this.__fiGoals2 = new ligamanager.ui.NumberField();
			hbox.add(fiGoals2);
			
			//
			// Spielerbesonderheiten
			//
			this.__saisonPlayers = this.__ligaManagerRpc.callSync("GetAllSaisonPlayers");
			
			this.__playersTable = new ligamanager.pages.EntityTable("player_match", 
				["Id", "Spieler", "Mannschaft", "Tore", "Gelbe", "Gelb Rote", "Rote"], 
				["id", "id_saison_player", "id_saison_team", "goals", "hasYellowCard", "hasYellowRedCard", "hasRedCard"],
				true, true, false, false);
			this.__playersTable.setHeight(300);
			this.__playersTable.setAllowGrowX(false);
			this.__content.add(this.__playersTable);
			
			
			var table = this.__playersTable.getTable();
			table.addListener("dataEdited", this.__onPlayerEdited, this);
			table.setColumnWidth( 0, 50 );
			table.setColumnWidth( 1, 150 );
			table.setColumnWidth( 2, 150 );
			table.setColumnWidth( 3, 50 );
			table.setColumnWidth( 4, 50 );
			table.setColumnWidth( 5, 50 );
			table.setColumnWidth( 6, 50 );
			
			var model = table.getTableModel();
			model.setColumnEditable(0, false);
			
			var tcm = table.getTableColumnModel();
			var playersRenderer = new ligamanager.pages.SaisonPlayersRenderer();
			playersRenderer.setPlayer(this.__saisonPlayers);
			
			tcm.setDataCellRenderer(1, playersRenderer);
			tcm.setDataCellRenderer(2, this.__teamReplaceRenderer);
			tcm.setDataCellRenderer(4, new qx.ui.table.cellrenderer.Boolean());
			tcm.setDataCellRenderer(5, new qx.ui.table.cellrenderer.Boolean());
			tcm.setDataCellRenderer(6, new qx.ui.table.cellrenderer.Boolean());
			
			this.__playersEditor = new ligamanager.pages.SaisonPlayersEditor();
			this.__playersEditor.setPlayer(this.__saisonPlayers);
			//this.__playersEditor.addListener("dataEdited", this.__onPlayerEdited, this);
			this.__playerTeamSelectBox = new qx.ui.table.celleditor.SelectBox()
			
			tcm.setCellEditorFactory(1, this.__playersEditor);
			tcm.setCellEditorFactory(2, this.__playerTeamSelectBox); 
			tcm.setCellEditorFactory(4, new qx.ui.table.celleditor.CheckBox());
			tcm.setCellEditorFactory(5, new qx.ui.table.celleditor.CheckBox());
			tcm.setCellEditorFactory(6, new qx.ui.table.celleditor.CheckBox());
			
			
			
			this.__fiDesc = new ligamanager.ui.HtmlEditor();
			this.__fiDesc.setHeight(200);
			this.__fiDesc.setAllowGrowX(false);
			this.__content.add(this.__fiDesc);
			
			var btSave = new qx.ui.form.Button(this.tr("Save"), "icon/22/actions/document-save.png");
			btSave.addListener("execute", this.__onSave, this);
			btSave.setAllowGrowX(false);
			this.__content.add(btSave);
		},
		
		__onPlayerEdited : function(evt) {
			var data = evt.getData();
			
			if (data.col == 1) {
				var playersModel = this.__playersTable.getTableModel();
				var playerName = data.value.trim().toUpperCase();
				var words = playerName.split(" ");
				var firstName = words[0];
				var lastName = words[1];
				
				// try to find a player with that name
				var players = this.__saisonPlayers;
				var match = this.__currentMatch;
				
				if (players && match && playerName.length > 0) {
					for (var i=0,l=players.length; i < l; i++)
					{
						var player = players[i];
						
						if ((player["id_saison_team"] == match["id_saison_team1"] 
								|| player["id_saison_team"] == match["id_saison_team2"])
							&& firstName == player["firstname"].toUpperCase()
							&& lastName == player["lastname"].toUpperCase()) {
							
							// set id as value
							playersModel.setValue(1, data.row, player["id"]);
							
							// set team
							playersModel.setValue(2, data.row, player["id_saison_team"]);
						}
					}
				}
			}
		},
		
		__updateDetails : function() {
			var table = this.__matchesTable.getTable();
			
			var matchIndex = table.getSelectionModel().getLeadSelectionIndex();
			var match = this.__currentMatch = table.getTableModel().getRowData(matchIndex);
			
			this.__laDetails.setValue( 
				this.__replaceMap[match.id_saison_team1]
				+ " vs "
				+ this.__replaceMap[match.id_saison_team2]);

			var dateValue = ligamanager.Core.SOURCE_FORMAT.parse(match.date);
			this.__fiDate.setValue(dateValue);
			
			this.__fiGoals1.setValue(match.goal1);
			this.__fiGoals2.setValue(match.goal2);
			
			var desc = match.description;
			this.__fiDesc.setValue(desc);
			
			//
			// update players table
			//
			this.__playersEditor.setMatch(match);
			
			var teams = [];
			teams.push([this.__replaceMap[match.id_saison_team1], null, match.id_saison_team1]);
			teams.push([this.__replaceMap[match.id_saison_team2], null, match.id_saison_team2]);
			this.__playerTeamSelectBox.setListData(teams);
			
			//this.__playersTable.getTable().getSelectionModel().resetSelection();
			
			var playersModel = this.__playersTable.getTableModel();
			playersModel.setNewRowDefaults({"id_match" : match.id,
				"hasYellowCard" : false, 
				"hasYellowRedCard" : false, 
				"hasRedCard" : false,
				"goals" : 0});
			playersModel.setFilter({"match_id" : match.id});
			playersModel.startRpc();
		},
		
		__onSave : function(evt) {
			var table = this.__matchesTable.getTable();
			
			var matchIndex = table.getSelectionModel().getLeadSelectionIndex();
			if (matchIndex >= 0) {
				var match = table.getTableModel().getRowData(matchIndex);
				
				match.date = ligamanager.Core.SOURCE_FORMAT.format(this.__fiDate.getValue());
				match.goal1 = this.__fiGoals1.getValue();
				match.goal2 = this.__fiGoals2.getValue();
				
				var desc = this.__fiDesc.getValue();
				match.description = desc;
				
				//match.goal2 = this.__fiGoals2.getValue();
				
				this.__ligaManagerRpc.callSync("StoreMatch", match);
				this.__playersTable.getTableModel().saveChanges();
				
				table.getTableModel().reloadData();
			}
		},
		
		__updateMatches : function() {
		
			// create select box with teams
			var saisonTeams = this.__saisonTeams = this.__ligaManagerRpc.callSync("GetOnlyTeamsOfSaison", -1);
			
			
			if (saisonTeams == null || this.__matchesTable == null) return;
			
			var replaceMap = this.__replaceMap = {};
			var teams = [];
			for (var i = 0; i < saisonTeams.length; i++) {
				var row = saisonTeams[i];
				replaceMap[row["id"]] = row["name"];
				teams.push([row["name"], null, row["id"]]);
			}
			
			//this.__teamSelectBox.setListData(teams);
			this.__teamReplaceRenderer.setReplaceMap(replaceMap);
			//this.__teamReplaceRenderer.addReversedReplaceMap();
			
			//this.__matchesTable.getTable().updateContent();
			
			
			// set filter
			var model = this.__matchesTable.getTableModel();
			
			var filter = { "matchesOfUser" : true };
			model.setFilter(filter);
			
			model.startRpc();
		}
	}
	
	
});
