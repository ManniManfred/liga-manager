/*
#asset(qx/icon/${qx.icontheme}/22/actions/view-refresh.png)
#asset(qx/icon/${qx.icontheme}/22/actions/document-properties.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
*/

qx.Class.define("ligamanager.pages.PlayerLockPage",
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
		this.__saisonFilter = {
			"saison_id" : null
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
		
		var sc = new ligamanager.pages.SaisonChoice();
		sc.addListener("changeSaison", function(evt) { this.__updateLocks(evt.getData()); }, this);
		this.__content.add(sc);
		
		this.__createLocksPart();
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
		__saisonFilter : null,
		__locksTable : null,
		__saisonTeams : null,
		__filterRadioGroup : null,
		
		
		__updateLocks : function(saison) {
			if (saison == null) return;
			
			//var trace = qx.dev.StackTrace.getStackTrace();
			//this.debug("__updateLocks: " + trace.join("\n"));
			
			// set filter
			var model = this.__locksTable.getTableModel();
			this.__saisonFilter["saison_id"] = saison.id;
			model.setFilter(this.__saisonFilter);
			model.startRpc();
		},
		
		
		__createLocksPart : function() {
		
			var laScorer = new qx.ui.basic.Label(this.tr("Locks"));
			laScorer.setAppearance("label-sep");
			this.__content.add(laScorer);
			
			this.__locksTable = new ligamanager.pages.EntityTable("locks", 
				["Vorname", "Nachname", "Mannschaft", "Datum"], 
				["firstname", "lastname", "team_name", "date"],
				false, false, false, false);
			this.__locksTable.setHeight(400);
			this.__locksTable.setAllowGrowX(false);
			this.__content.add(this.__locksTable);
			
			
			//
			// modify table model
			//
			var model = this.__locksTable.getTableModel();
			model.sortByColumn(3, false);
			model.setColumnEditable(0, false);
			model.setColumnEditable(1, false);
			model.setColumnEditable(2, false);
			model.setColumnEditable(3, false);
			
			
			//
			// modify table columns
			//
			
			var table = this.__locksTable.getTable();
			
			table.setColumnWidth( 0, 150 );
			table.setColumnWidth( 1, 150 );
			table.setColumnWidth( 2, 200 );
			table.setColumnWidth( 3, 150 );
			
			this.__locksTable.setWidth(650 + 20);
			
			
			var tcm = table.getTableColumnModel();

			// date renderer
			var dateRenderer = new ligamanager.ui.DateCellRenderer();
			dateRenderer.setDateFormat(ligamanager.Core.DISPLAY_FORMAT);
			tcm.setDataCellRenderer(3, dateRenderer);
			
			table.addListener("cellDblclick", this.__onCellDblClick, this);
		},
		
		__onCellDblClick : function(evt){
			var model = this.__locksTable.getTableModel();
			var lock = model.getRowData(evt.getRow());
			
			ligamanager.ui.Navigation.getInstance().showPage(
				this.tr("Playing Schedule") + "~" + lock.id_match);
		}
		
	}
});
