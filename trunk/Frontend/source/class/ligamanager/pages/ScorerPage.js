
/*
#asset(ligamanager/22/*)
*/

qx.Class.define("ligamanager.pages.ScorerPage",
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
		sc.addListener("changeSaison", function(evt) { this.__updateScorer(evt.getData()); }, this);
		this.__content.add(sc);
		
		this.__createScorerPart();
		
		
		this.__updateScorer(sc.getCurrentSaison());
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
		
		__createScorerPart : function() {
		
			var laScorer = new qx.ui.basic.Label(this.tr("Scorer"));
			laScorer.setAppearance("label-sep");
			this.__content.add(laScorer);
			
			this.__scorerTable = new ligamanager.pages.EntityTable("scorer", 
				["Vorname", "Nachname", "Mannschaft", "Tore"], 
				["firstname", "lastname", "team_name", "goals"],
				false, false, false, false);
			this.__scorerTable.setHeight(400);
			this.__scorerTable.setAllowGrowX(false);
			this.__content.add(this.__scorerTable);
			
			
			//
			// modify table model
			//
			var model = this.__scorerTable.getTableModel();
			model.sortByColumn(3, false);
			model.setColumnEditable(0, false);
			model.setColumnEditable(1, false);
			model.setColumnEditable(2, false);
			model.setColumnEditable(3, false);
			
			
			//
			// modify table columns
			//
			
			var table = this.__scorerTable.getTable();
			
			table.setColumnWidth( 0, 150 );
			table.setColumnWidth( 1, 150 );
			table.setColumnWidth( 2, 200 );
			table.setColumnWidth( 3, 50 );
			
			this.__scorerTable.setWidth(550 + 20);
			
		},
		
		__updateScorer : function(saison) {
			if (saison == null) return;
			
			// set filter
			var model = this.__scorerTable.getTableModel();
			this.__saisonFilter["saison_id"] = saison.id;
			model.setFilter(this.__saisonFilter);
			model.startRpc();
		}
		
	}
});
