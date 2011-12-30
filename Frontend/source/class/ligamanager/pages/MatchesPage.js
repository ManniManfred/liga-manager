
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
		__saisonTeams : null,
		
		__createMatchPart : function() {
		
			var laTeams = new qx.ui.basic.Label(this.tr("Matches"));
			laTeams.setAppearance("label-sep");
			this.__content.add(laTeams);
			
			this.__matchesTable = new ligamanager.pages.EntityTable("match", 
				["Id", "Datum", "Mannschaft 1", "Mannschaft 2", "Tore 1", "Tore 2"], 
				["id", "date", "id_saison_team1", "id_saison_team2", "goal1", "goal2"],
				false, false, true);
			this.__matchesTable.setHeight(300);
			this.__matchesTable.setAllowGrowX(false);
			this.__content.add(this.__matchesTable);
			
			
			// add create matches button
			var btCreateMatches = new qx.ui.toolbar.Button(this.tr("New"), "icon/22/actions/list-add.png");
			btCreateMatches.addListener("execute", this.__onCreateMatches, this);
			
			var btDelete = new qx.ui.toolbar.Button(this.tr("Remove"), "icon/22/actions/list-remove.png");
			btDelete.addListener("execute", this.__onClearMatches, this);
				
			this.__matchesTable.addToolbarButtons([new qx.ui.toolbar.Separator(),
				btCreateMatches, btDelete]);
			
			
			var table = this.__matchesTable.getTable();
			table.setColumnWidth( 0, 50 );
			table.setColumnWidth( 1, 150 );
			table.setColumnWidth( 2, 200 );
			table.setColumnWidth( 3, 200 );
			table.setColumnWidth( 4, 50 );
			table.setColumnWidth( 5, 50 );
			
			var model = table.getTableModel();
			model.setColumnEditable(2, false);
			model.setColumnEditable(3, false);
			
			
			var tcm = table.getTableColumnModel();

			// bool renderer and editor
			// tcm.setDataCellRenderer(4, new qx.ui.table.cellrenderer.Boolean());
			// tcm.setCellEditorFactory(4, new qx.ui.table.celleditor.CheckBox());
			
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
			
			
			//this.__teamSelectBox = new qx.ui.table.celleditor.SelectBox();
			//tcm.setCellEditorFactory(2, this.__teamSelectBox);
			//tcm.setCellEditorFactory(3, this.__teamSelectBox);
			
		},
		
		__updateMatches : function(saison) {
		
			if (saison == null) return;
			
			
			// create select box with teams
			var saisonTeams = this.__saisonTeams = this.__ligaManagerRpc.callSync("GetOnlyTeamsOfSaison", saison.id);
			
			
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
			var filter = { "saison_id" : saison.id };
			model.setFilter(filter);
		},
		
		__onClearMatches : function() {
			var tableModel = this.__matchesTable.getTableModel();
			
			for (var i = 0, l = tableModel.getRowCount(); i < l; i++) {
				tableModel.removeRow(0);
			}
		},
		
		__onCreateMatches : function() {
			if (this.__saisonTeams == null) return;
			
			var tableModel = this.__matchesTable.getTableModel();
			
			if (tableModel.getRowCount() > 0) {
				dialog.Dialog.alert(qx.locale.Manager.tr("hint_matches_exist"));
				return;
			}
			
			
			  /*
			   * wizard widget
			   */
			  var pageData = 
			  [
			   {
				 "message" : "<p style='font-weight:bold'>Spiele erzeugen</p><p>W&auml;hle den Spielmodus aus</p>",
				 "formData" : {
				   "mode" : {
					 "type" : "radiogroup",
					 "label": "Spielmodus",
					 "options" : 
					 [
					  { "label" : "Jeder gegen Jeden", "value" : "AnyVsAny" }
					 ]
				   }
				 }
			   },
			   {
				 "message" : "<p style='font-weight:bold'>Start</p><p>Geben Sie den Begin der Saison an</p>",
				 "formData" : {
				   "round1" : {
					 "type" : "datefield",
					 "label" : "Hinrunde",
					 "dateFormat" : ligamanager.pages.MatchesPage.DISPLAY_FORMAT,
					 "value" : new Date(),
					 "validation" : {
					   "required" : true
					 }
				   },
				   "round2" : {
					 "type" : "datefield",
					 "label": "R&uuml;ckrunde",
					 "dateFormat" : ligamanager.pages.MatchesPage.DISPLAY_FORMAT,
					 "value" : new Date(),
					 "validation" : {
					   "required" : true
					 }
				   },
				   "periode" : {
					 "type" : "textfield",
					 "label": "Spielabstand (in Tage)",
					 "value": "7",
					 "validation" : {
					   "required" : true
					 }
				   }
				 }
			   }
			  ];
			  var wizard = new dialog.Wizard({
				width       : 500,
				maxWidth    : 500,
				pageData    : pageData, 
				allowCancel : true,
				callback    : this.__generateMatches,
				context     : this
			  });
			  wizard.start();
		},
		
		__generateMatches : function(map) {
		
			if (map == null) return;
			
			var matches = [];
			
			if (map.mode == "AnyVsAny") {
				var periode = parseInt(map.periode);
				
				var mCount = this.__saisonTeams.length;
				var workDate;
				var playDay;
				
				for (var z = 0; z < mCount; z++) {
					for (var s = 0; s < mCount; s++) {
						if (z == s) continue;
						
						playDay = (z + s - 1) % mCount;
						
						if ((z < s && (z + s) % 2 == 0)
							|| (z > s && (z + s) % 2 != 0)) {
							// Hinrunde
							workDate = this.addDays(map.round1, playDay * periode);
						} else {
							// Rueckrunde
							workDate = this.addDays(map.round2, playDay * periode);
						}
						var row = {"id" : null, 
							"date" : ligamanager.pages.MatchesPage.SOURCE_FORMAT.format(workDate),
							"id_saison_team1" : this.__saisonTeams[z].id,
							"id_saison_team2" : this.__saisonTeams[s].id,
							"goal1" : null,
							"goal2" : null};
						
						matches.push(row);
					}
				}
			}
			
			if (matches.length > 0) {
				var tableModel = this.__matchesTable.getTableModel();
				tableModel.addNewRows(matches);
			}
		},
		
		
		addDays : function(myDate, days) {
			return new Date(myDate.getTime() + days*24*60*60*1000);
		}
	}
	
	
});
