
/*
#asset(qx/icon/${qx.icontheme}/22/status/dialog-information.png)
*/
qx.Class.define("ligamanager.pages.ManageMatchesPage",
{
	extend: qx.ui.window.Desktop,
	implement: [ligamanager.pages.IPage],

	
	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function(param) {
		this.base(arguments, new qx.ui.window.Manager());
		
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
		//this.__coreRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
		
		this.setParam(param);
		
		
		this.__createMatchPart();
		
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
		
		setParam : function(param) {
			if (this.__laHint != null) {
				this.__content.remove(this.__laHint);
				this.__laHint = null;
			}
			
			if (param != null) {
				// create hint
				if (param == "hint") {
					var laTeams = this.__laHint = new qx.ui.basic.Atom(this.tr("hint_choose_match"), 
						"icon/22/status/dialog-information.png");
					laTeams.setAppearance("label-sep");
					this.__content.add(laTeams);
				} else if (param == "saved") {
					var laTeams = this.__laHint = new qx.ui.basic.Atom(this.tr("The match was successful saved"), 
						"icon/22/status/dialog-information.png");
					laTeams.setAppearance("label-sep");
					this.__content.add(laTeams);
				}
			}
		},
		
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
			
			
			var btEdit = new qx.ui.toolbar.Button(qx.locale.Manager.tr("Edit Match"), 
				"ligamanager/22/edit.png");
			btEdit.addListener("execute", this.__editSelectedMatch, this);
			btEdit.setToolTipText(qx.locale.Manager.tr("Edits the selected match."));
			
			this.__matchesTable.addToolbarButtons([new qx.ui.toolbar.Separator(),
				btEdit]);
			
			var table = this.__matchesTable.getTable();
			
			
			table.setColumnWidth( 0, 50 );
			table.setColumnWidth( 1, 150 );
			table.setColumnWidth( 2, 200 );
			table.setColumnWidth( 3, 200 );
			table.setColumnWidth( 4, 50 );
			table.setColumnWidth( 5, 50 );
			table.setWidth(720);
			
			var model = table.getTableModel();
			model.sortByColumn(1, true);
			model.setColumnEditable(1, false);
			model.setColumnEditable(2, false);
			model.setColumnEditable(3, false);
			model.setColumnEditable(4, false);
			model.setColumnEditable(5, false);
			
			
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
			
			
			table.addListener("cellDblclick", this.__editSelectedMatch, this);
		},
		
		__editSelectedMatch : function(evt){
			var selectionModel = this.__matchesTable.getTable().getSelectionModel();
			
			if (selectionModel.isSelectionEmpty()) {
				dialog.Dialog.alert(this.tr("First select a match."))
			} else {
				var selectedIndex = selectionModel.getLeadSelectionIndex();
				var model = this.__matchesTable.getTableModel();
				var match = model.getRowData(selectedIndex);
			
				ligamanager.ui.Navigation.getInstance().showPage(
					this.tr("Manager") + "." + this.tr("Match Details") + "~" + match.id);
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
			
			var filter = {
				"matchesOfUser" : true
			};
			model.setFilter(filter);
			
			model.startRpc();
		}
	}
	
	
});
