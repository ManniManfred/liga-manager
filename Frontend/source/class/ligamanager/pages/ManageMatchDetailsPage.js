
/*
#asset(qx/icon/${qx.icontheme}/22/actions/document-save.png)
#asset(qx/icon/${qx.icontheme}/22/actions/view-refresh.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
#asset(qx/icon/${qx.icontheme}/22/actions/dialog-cancel.png)
#asset(ligamanager/22/default.png)
*/
qx.Class.define("ligamanager.pages.ManageMatchDetailsPage",
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
		
		this.__param = param;
		
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
		

		this.__show();
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
		
		__param : null,
		
		setParam : function(param) {
			if (this.__param != param) {
				this.__content.removeAll();
				this.__param = param;
				this.__show();
			}
		},
		
		__show : function() {
		
			if (this.__param == null) {
				window.setTimeout(function() {
					ligamanager.ui.Navigation.getInstance().showPage(
						qx.locale.Manager.tr("Manager") + "." + qx.locale.Manager.tr("Matches") + "~hint");
				},  1);
				
			} else {
				this.__createDetailsPart();
				var self = this;
				
				this.__ligaManagerRpc.callAsync(function(result, ex, id)
				{
					if (ex == null) {
						var user = ligamanager.Core.getInstance().getUser();
						
						if (user.rights == "ADMIN" || user.rights == "LIGA_ADMIN"
							|| result.id_team1 == user.id_team || result.id_team2 == user.id_team) {
							self.__updateDetails(result);
						} else {
							ligamanager.ui.Navigation.getInstance().showPage(
								qx.locale.Manager.tr("Manager") + "." + qx.locale.Manager.tr("Matches") + "~forbidden");
						}
					} else {
						dialog.Dialog.warning(self.tr("Error during request: %1", ex));
					}
				}, "GetMatch", self.__param);
				
			}

		},
		
		__createDetailsPart : function() {
			
			
			var laDetails = this.__laDetails = new qx.ui.basic.Label(this.tr("Details"));
			laDetails.setAppearance("label-sep");
			this.__content.add(laDetails);
			
			
			var hbox = new qx.ui.container.Composite(new qx.ui.layout.HBox(2).set({
				alignY : "middle"
			}));
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
			fiGoals1.setWidth(40);
			hbox.add(fiGoals1);
			
			hbox.add(new qx.ui.basic.Label(this.tr(" vs ")));
			
			var fiGoals2 = this.__fiGoals2 = new ligamanager.ui.NumberField();
			fiGoals2.setWidth(40);
			hbox.add(fiGoals2);
			
			//
			// Spielerbesonderheiten
			//
			this.__saisonPlayers = this.__ligaManagerRpc.callSync("GetAllSaisonPlayers");
			
			this.__playersTable = new ligamanager.pages.EntityTable("player_match", 
				["Id", "Spieler", "Mannschaft", "Tore", "Gelbe", "Gelb Rote", "Rote"], 
				["id", "id_saison_player", "id_saison_team", "goals", "hasYellowCard", "hasYellowRedCard", "hasRedCard"],
				true, true, false, false, false);
			this.__playersTable.setHeight(300);
			this.__playersTable.setAllowGrowX(false);
			//this.__playersTable.setAllowShrinkX(true);
			
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
			table.setWidth(570);
			
			var model = table.getTableModel();
			model.setColumnEditable(0, false);
			
			var tcm = table.getTableColumnModel();
			var playersRenderer = this.__playersRenderer = new ligamanager.pages.SaisonPlayersRenderer();
			playersRenderer.setPlayer(this.__saisonPlayers);
			
			
			this.__teamReplaceRenderer = new qx.ui.table.cellrenderer.Replace();
			this.__teamReplaceRenderer.setUseAutoAlign(false);
			
			tcm.setDataCellRenderer(1, playersRenderer);
			tcm.setDataCellRenderer(2, this.__teamReplaceRenderer);
			tcm.setDataCellRenderer(4, new qx.ui.table.cellrenderer.Boolean());
			tcm.setDataCellRenderer(5, new qx.ui.table.cellrenderer.Boolean());
			tcm.setDataCellRenderer(6, new qx.ui.table.cellrenderer.Boolean());
			
			this.__playersEditor = new ligamanager.pages.SaisonPlayersEditor();
			this.__playersEditor.setPlayer(this.__saisonPlayers);
			this.__playersEditor.addListener("dataEdited", this.__onPlayerEdited, this);
			this.__playerTeamSelectBox = new qx.ui.table.celleditor.SelectBox()
			
			tcm.setCellEditorFactory(1, this.__playersEditor);
			tcm.setCellEditorFactory(2, this.__playerTeamSelectBox); 
			tcm.setCellEditorFactory(4, new qx.ui.table.celleditor.CheckBox());
			tcm.setCellEditorFactory(5, new qx.ui.table.celleditor.CheckBox());
			tcm.setCellEditorFactory(6, new qx.ui.table.celleditor.CheckBox());
			
			var laHint = new qx.ui.basic.Label();
			laHint.setRich(true);
			laHint.setValue("<b>Hinweis:</b><br> Spieler, die noch nicht in der Liste vorhanden sind,"
				+ " einfach in dem Format \"&lt;Vorname&gt; &lt;Nachname&gt;\" angeben und die zugehörige Mannschaft auswählen. "
				+ "Beispiel: Manuel Neuer");
			this.__content.add(laHint);
			
			
			this.__fiDesc = new ligamanager.ui.HtmlEditor();
			this.__fiDesc.setHeight(200);
			this.__fiDesc.setAllowGrowX(false);
			this.__content.add(this.__fiDesc);
			
			var paButtons = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
			this.__content.add(paButtons);
			
			var btBack = new qx.ui.form.Button(this.tr("Back"), "icon/22/actions/dialog-cancel.png");
			btBack.addListener("execute", this.__onBack, this);
			btBack.setAllowGrowX(false);
			paButtons.add(btBack);
			
			var btSave = new qx.ui.form.Button(this.tr("Save"), "icon/22/actions/document-save.png");
			btSave.addListener("execute", this.__onSave, this);
			btSave.setAllowGrowX(false);
			paButtons.add(btSave);
			
			
			var btSaveAndClose = new qx.ui.form.Button(this.tr("Save and close"), "icon/22/actions/document-save.png");
			btSaveAndClose.addListener("execute", this.__onSaveAndClose, this);
			btSaveAndClose.setAllowGrowX(false);
			paButtons.add(btSaveAndClose);
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
		
		__updateDetails : function(match) {
			this.__currentMatch = match;
			
			this.__laDetails.setValue( 
				match.name_team1
				+ " vs "
				+ match.name_team2);

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
			teams.push([match.name_team1, null, match.id_saison_team1]);
			teams.push([match.name_team2, null, match.id_saison_team2]);
			this.__playerTeamSelectBox.setListData(teams);
			
			var replaceMap = {};
			replaceMap[match.id_saison_team1] = match.name_team1;
			replaceMap[match.id_saison_team2] = match.name_team2;
			
			this.__teamReplaceRenderer.setReplaceMap(replaceMap);
			
			//this.__playersTable.getTable().getSelectionModel().resetSelection();
			
			var playersModel = this.__playersTable.getTableModel();
			playersModel.setNewRowDefaults({
				"id_match" : match.id,
				"id_saison_team" : match.id_saison_team1,
				"hasYellowCard" : false, 
				"hasYellowRedCard" : false, 
				"hasRedCard" : false,
				"goals" : 0
			});
			playersModel.setFilter({
				"match_id" : match.id
				});
			playersModel.startRpc();
			
		},
		
		__save: function(successCallback, context) {
			
			var match = this.__currentMatch;

			match.date = ligamanager.Core.SOURCE_FORMAT.format(this.__fiDate.getValue());
			match.goal1 = this.__fiGoals1.getValue();
			match.goal2 = this.__fiGoals2.getValue();

			var desc = this.__fiDesc.getValue();
			match.description = desc;

			var playersModel = this.__playersTable.getTableModel();
			var playerChanges = playersModel.getChanges();
			
			ligamanager.MainWidget.getInstance().startWaiting();
			
			this.__ligaManagerRpc.callAsync(function(result, ex, id){
				
				ligamanager.MainWidget.getInstance().stopWaiting();
				if (ex == null) {
					successCallback.call(context);
				} else {
					dialog.Dialog.warning(qx.locale.Manager.tr("Error on saving match: %1", ex))
				}
			}, "StoreMatch", match, playerChanges);
			
			playersModel.clearChanges();
		},
		
		__onSaveAndClose : function(evt) {
			
			this.__save(function() {
				ligamanager.ui.Navigation.getInstance().showPage(
					qx.locale.Manager.tr("Manager") + "." + qx.locale.Manager.tr("Matches") + "~saved");
			}, this);
		},
		
		
		__onSave : function(evt) {
			
			var playersModel = this.__playersTable.getTableModel();
			var hasPlayerChanges = playersModel.hasChanges();
			
			this.__save(function() {
				if (hasPlayerChanges) {

					// update players renderer
					this.__saisonPlayers = this.__ligaManagerRpc.callSync("GetAllSaisonPlayers");
					this.__playersRenderer.setPlayer(this.__saisonPlayers);

					playersModel.reloadData();
				}
				dialog.Dialog.alert(this.tr("The match was successful saved"));
			}, this);

		},
		
		__onBack : function(evt) {
			ligamanager.ui.Navigation.getInstance().showPage(
						qx.locale.Manager.tr("Manager") + "." + qx.locale.Manager.tr("Matches"));
		}
	}
	
	
});
