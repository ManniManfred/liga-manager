
/*
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
		
		this.__createMatchPart();
		this.__updateMatches();
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
			dateRenderer.setDateFormat(ligamanager.pages.MatchesPage.DISPLAY_FORMAT);
			
			tcm.setDataCellRenderer(1, dateRenderer);
			tcm.setCellEditorFactory(1, new ligamanager.ui.DateCellEditor()); 
			
			
			// select box for teams
			this.__teamReplaceRenderer = new qx.ui.table.cellrenderer.Replace();
			this.__teamReplaceRenderer.setUseAutoAlign(false);
			tcm.setDataCellRenderer(2, this.__teamReplaceRenderer);
			tcm.setDataCellRenderer(3, this.__teamReplaceRenderer);
		},
		
		__updateMatches : function() {
		
			
			// create select box with teams
			var saisonTeams = this.__saisonTeams = this.__ligaManagerRpc.callSync("GetOnlyTeamsOfSaison", -1);
			
			
			if (saisonTeams == null || this.__matchesTable == null) return;
			
			var replaceMap = {};
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
