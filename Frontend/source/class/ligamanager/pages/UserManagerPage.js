/*
#asset(qx/icon/${qx.icontheme}/22/actions/view-refresh.png)
#asset(qx/icon/${qx.icontheme}/22/actions/document-properties.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
*/

qx.Class.define("ligamanager.pages.UserManagerPage",
{
	extend: qx.ui.container.Scroll,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments);
		
		this.__coreRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.Core");

		
		this.__content = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
		this.__content.setPadding(20);
		this.add(this.__content);
		
		
		this.__createUI();
		this.__updateTeams();
		
		this.__usersTable.getTableModel().startRpc();
	},

	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties: {},

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
		__coreRpc : null,
		__usersTable : null,
		
		
		__createUI : function() {
		
			var laCaption = new qx.ui.basic.Label(this.tr("User Manager"));
			laCaption.setAppearance("label-sep");
			this.__content.add(laCaption);
	
	
			this.__usersTable = new ligamanager.pages.EntityTable("users", 
				["Id", "Benutzername", "Passwort", "Vorname", "Nachname", "E-Mail", "Mannschaft", "Rechte"], 
				["id", "username", "password", "firstname", "lastname", "email", "id_team", "rights"],
				true, true, true, false);
			this.__usersTable.setHeight(300);
			this.__usersTable.setAllowGrowX(false);
			this.__content.add(this.__usersTable);
			
			//
			// modify table model
			//
			var model = this.__usersTable.getTableModel();
			model.setNewRowDefaults({"password" : null}); // workaround for password renderer
			model.sortByColumn(1, true);
			//model.setColumnEditable(0, false);
			//model.setColumnEditable(1, false);
			
			
			//
			// modify table columns
			//
			
			var table = this.__usersTable.getTable();
			table.setColumnWidth( 0, 30 );
			table.setColumnWidth( 1, 100 );
			table.setColumnWidth( 2, 80 );
			table.setColumnWidth( 3, 150 );
			table.setColumnWidth( 4, 150 );
			table.setColumnWidth( 5, 200 );
			table.setColumnWidth( 6, 150 );
			table.setColumnWidth( 7, 100 );
			
			var tcm = table.getTableColumnModel();

			// password renderer / editor
			tcm.setDataCellRenderer(2, new qx.ui.table.cellrenderer.Password());
			tcm.setCellEditorFactory(2, new qx.ui.table.celleditor.PasswordField()); 
			
			// rights editor
			//'USER','TEAM_ADMIN','LIGA_AMIN','ADMIN'
			var rightsSelectBox = new qx.ui.table.celleditor.SelectBox();
			rightsSelectBox.setListData([
				["USER", null, "USER"],
				["TEAM_ADMIN", null, "TEAM_ADMIN"],
				["LIGA_AMIN", null, "LIGA_AMIN"],
				["ADMIN", null, "ADMIN"]
				]);
			tcm.setCellEditorFactory(7, rightsSelectBox);
			
			// select box for teams
			this.__teamReplaceRenderer = new qx.ui.table.cellrenderer.Replace();
			this.__teamReplaceRenderer.setUseAutoAlign(false);
			tcm.setDataCellRenderer(6, this.__teamReplaceRenderer);
			
			this.__teamSelectBox = new qx.ui.table.celleditor.SelectBox();
			tcm.setCellEditorFactory(6, this.__teamSelectBox);
		},
		
		
		__updateTeams : function() {
		
			// create select box with teams
			var teams = this.__coreRpc.callSync("GetEntities", "team");
			
			
			if (teams == null) return;
			
			var replaceMap = {};
			var teamsMap = [];
			
			replaceMap[null] = "-";
			replaceMap[Number.NaN] = "-";
			teamsMap.push(["-", null, null]);
			
			for (var i = 0; i < teams.length; i++) {
				var row = teams[i];
				replaceMap[row["id"]] = row["name"];
				teamsMap.push([row["name"], null, row["id"]]);
			}
			
			this.__teamSelectBox.setListData(teamsMap);
			this.__teamReplaceRenderer.setReplaceMap(replaceMap);
			//this.__teamReplaceRenderer.addReversedReplaceMap();
			
			//this.__matchesTable.getTable().updateContent();
			
		}
			
	}
});
