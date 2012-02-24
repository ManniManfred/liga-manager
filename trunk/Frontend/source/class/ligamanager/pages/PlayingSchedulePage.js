
/*
#asset(ligamanager/22/*)
*/

qx.Class.define("ligamanager.pages.PlayingSchedulePage",
{
	extend: qx.ui.container.Composite,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function(param) {
		this.base(arguments, new qx.ui.layout.Canvas());
		
		this.__param = param;
		this.__saisonFilter = {
			"saison_id" : null, 
			"team_id" : null
		};
		
		var layout = new qx.ui.layout.VBox();
		layout.setSpacing(20);
		
		this.__content = new qx.ui.container.Composite(layout);
		this.__content.setPadding(20);
		
		var paScroll = new qx.ui.container.Scroll(this.__content);
		this.add(paScroll, {
			left:0, 
			top: 0, 
			right: 0,
			bottom: 0
		});
		
		
		this.__ligaManagerRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.LigaManager");
		
		
		var sc = new ligamanager.pages.SaisonChoice();
		sc.addListener("changeSaison", function(evt) { this.__updateMatches(evt.getData()); }, this);
		this.__content.add(sc);
		
		this.__createMatchPart();
		this.__createDetailsPart();
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
		__saisonFilter : null,
		__param : null,
		
		setParam : function(param) {
			this.__param = param;
			this.__matchesTableChanged();
		},
		
		
		//
		// handle matches
		//
		
		__matchesTable : null,
		__saisonTeams : null,
		__filterRadioGroup : null,
		
		
		__createMatchPart : function() {
		
			var laTeams = new qx.ui.basic.Label(this.tr("Matches"));
			laTeams.setAppearance("label-sep");
			this.__content.add(laTeams);
			
			this.__matchesTable = new ligamanager.pages.EntityTable("match", 
				["Nr", "Datum", "Mannschaft 1", "Mannschaft 2", "Tore 1", "Tore 2"], 
				["id", "date", "id_saison_team1", "id_saison_team2", "goal1", "goal2"],
				false, false, false, false);
			this.__matchesTable.setHeight(400);
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
			model.setColumnEditable(1, false);
			model.setColumnEditable(2, false);
			model.setColumnEditable(3, false);
			model.setColumnEditable(4, false);
			model.setColumnEditable(5, false);
			
			model.addListener("dataChanged", this.__matchesTableChanged, this);
			
			
			//
			// modify table columns
			//
			
			var table = this.__matchesTable.getTable();
			table.getSelectionModel().addListener("changeSelection", this.__updateDetails, this);
			
			table.setColumnWidth( 0, 50 );
			table.setColumnWidth( 1, 150 );
			table.setColumnWidth( 2, 200 );
			table.setColumnWidth( 3, 200 );
			table.setColumnWidth( 4, 50 );
			table.setColumnWidth( 5, 50 );
			
			this.__matchesTable.setWidth(700 + 20);
			
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
		
		__matchesTableChanged : function() {
			if (this.__param != null) {
				var match_id = parseInt(this.__param);
				
				
				if (match_id != null) {
					var table = this.__matchesTable.getTable();
					
					var doAfter = function() {
					
						var model = table.getTableModel();
						for(var i = 0, l = model.getRowCount(); i < l; i++) {
							if (model.getRowData(i) != null && model.getRowData(i).id == match_id) {
								table.getSelectionModel().setSelectionInterval(i, i)
								table.scrollCellVisible(0, i);
								break;
							}
						}
					};
					window.setTimeout(doAfter, 0);
				}
			}
		},
		
		__updateMatches : function(saison) {
		
			if (saison == null) return;
			
			// create select box with teams
			var saisonTeams = this.__saisonTeams = this.__ligaManagerRpc.callSync("GetOnlyTeamsOfSaison", saison.id);
			
			if (saisonTeams == null || this.__matchesTable == null) return;
			
			var filterRadioGroup = this.__filterRadioGroup =  new qx.ui.form.RadioGroup();
			filterRadioGroup.addListener("changeSelection", this.__onFilterTeam , this);
		
			this.__meTeams.removeAll();
			var btAllTeams = new qx.ui.menu.RadioButton(this.tr("All Teams"));
			btAllTeams.setValue(true);
			filterRadioGroup.add(btAllTeams);
			this.__meTeams.add(btAllTeams); 
			
			var replaceMap = this.__replaceMap = {};
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
			this.__saisonFilter["saison_id"] = saison.id;
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
			
			this.__saisonFilter["team_id"] = team != null ? team.id : null;
			model.setFilter(this.__saisonFilter);
		},
		
		
		
		
		
		__createDetailsPart : function() {
			var layout = new qx.ui.layout.VBox();
			layout.setSpacing(20);
			this.__paDetails = new qx.ui.container.Composite(layout);
			this.__paDetails.setEnabled(false);
			this.__content.add(this.__paDetails);
			
			var laDetails = this.__laDetails = new qx.ui.basic.Label(this.tr("Details"));
			laDetails.setAppearance("label-sep");
			this.__paDetails.add(laDetails);
			
			
			var laDesc = this.__laDesc = new qx.ui.basic.Label();
			laDesc.setRich(true);
			this.__paDetails.add(laDesc);
			
			
		},
		
		__updateDetails : function() {
			var table = this.__matchesTable.getTable();
			
			var matchIndex = table.getSelectionModel().getLeadSelectionIndex();
			var match = this.__currentMatch = table.getTableModel().getRowData(matchIndex);
			
			var desc = "<h2>"
			+ this.__replaceMap[match.id_saison_team1]
			+ " vs "
			+ this.__replaceMap[match.id_saison_team2]
			+ ((match.goal1 == null || match.goal2 == null) ? "" : (" " + match.goal1 + ":" + match.goal2))
			+ "</h2>"
			+ "<p><b>Datum: </b>" + ligamanager.Core.DISPLAY_FORMAT.format(ligamanager.Core.SOURCE_FORMAT.parse(match.date)) + "</p>";
			
			if (match.description != null) {
				desc += match.description;
			}
			
			var details = this.__ligaManagerRpc.callSync("GetPublicPlayerMatchDetails", match.id);
			
			desc +="<h3>Besondere Vorkommnisse</h3>"
			
			if (details != null) {
				desc += "<p>";
				for (var i = 0; i < details.length; i++) {
					desc += details[i].firstname + " " + details[i].lastname
					+ " (" + this.__replaceMap[details[i].id_saison_team] + ")";
					
					if (details[i].hasYellowCard) desc += " Gelbe Karte";
					if (details[i].hasYellowRedCard) desc += " Gelb-Rote Karte";
					if (details[i].hasRedCard) desc += " Rote Karte";
					
					if (details[i].goals > 0 ) desc += " Tore " +  details[i].goals;
					
					desc += "<br>";
				}
				
				desc += "</p>";
			}
			
			this.__laDesc.setValue(desc);
			
			
			this.__paDetails.setEnabled(true);
		}
		
	}
});
