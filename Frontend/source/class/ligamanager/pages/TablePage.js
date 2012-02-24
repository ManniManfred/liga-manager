/*
#asset(qx/icon/${qx.icontheme}/22/categories/internet.png)
*/

qx.Class.define("ligamanager.pages.TablePage",
{
	extend: qx.ui.container.Composite,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments, new qx.ui.layout.Canvas());
		
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
		sc.addListener("changeSaison", function(evt) {
			this.__updateTable(evt.getData());
		}, this);
		this.__content.add(sc);
		
		this.__createTablePart();
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
		__rankingTable : null,
		
		
		__createTablePart : function() {
		
			var laTeams = new qx.ui.basic.Label(this.tr("Table"));
			laTeams.setAppearance("label-sep");
			this.__content.add(laTeams);
			
			this.__rankingTable = new ligamanager.pages.EntityTable("play_table", 
				["Rang", "Mannschaft", "Spiele", "Tore", "Diff.", "Punkte"], 
				["rank", "name", "match_count", "goals", "goals_diff", "points"],
				false, false, false, false);
			this.__rankingTable.setHeight(300);
			this.__rankingTable.setAllowGrowX(false);
			this.__content.add(this.__rankingTable);
			
			//
			// add www button
			//
			
			var btWeb = new qx.ui.toolbar.Button(qx.locale.Manager.tr("Webseite anzeigen"), 
				"icon/22/categories/internet.png");
			btWeb.setToolTipText(qx.locale.Manager.tr("Webseite anzeigen"));
			btWeb.addListener("execute", this.__showTeamWebSite, this);
			
			this.__rankingTable.addToolbarButtons([new qx.ui.toolbar.Separator(),
				btWeb]);
			
			//
			// modify table model
			//
			var model = this.__rankingTable.getTableModel();
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
			
			var table = this.__rankingTable.getTable();
			table.setColumnWidth( 0, 50 );
			table.setColumnWidth( 1, 200 );
			table.setColumnWidth( 2, 50 );
			table.setColumnWidth( 3, 50 );
			table.setColumnWidth( 4, 50 );
			table.setColumnWidth( 5, 50 );
			table.addListener("cellDblclick", this.__showTeamWebSite, this);
		},
		
		__showTeamWebSite : function(evt){
			var selectionModel = this.__rankingTable.getTable().getSelectionModel();
			
			if (!selectionModel.isSelectionEmpty()) {
				var selectedIndex = selectionModel.getLeadSelectionIndex();
				var model = this.__rankingTable.getTableModel();
				var team = model.getRowData(selectedIndex);
			
				if (team.homepage != null && team.homepage.length > 0) {
					window.open(team.homepage)
				} else {
					alert("Bei der Mannschaft \"" + team.name + "\" ist keine Homepage angegeben.")
				}
			}
			
			
		},
		
		__updateTable : function(saison) {
		
			if (saison == null) return;
			
			
			// set filter
			var model = this.__rankingTable.getTableModel();
			model.setFilter({
				"saison_id" : saison.id
			});
			model.startRpc();
		}
	}
});
