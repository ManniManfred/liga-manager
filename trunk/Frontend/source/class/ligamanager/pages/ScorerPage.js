
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
		
		this.__createSaisonChoice();
		this.__createScorerPart();
		
		
		var selection = this.__lvSaison.getSelection();
		if (selection == null || selection.length <= 0) {
			this.setCurrentSaison(null);
		} else {
			this.setCurrentSaison(selection[0].getUserData("saison"));
		}
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
		__saisonFilter : null,
		__param : null,
		
		setParam : function(param) {
			this.__param = param;
			this.__matchesTableChanged();
		},
		
		__applyCurrentSaison : function(value, oldValue) {
			this.__updateScorer(value);
		},
		
		__createSaisonChoice : function() {
		
			var saisonChoice = this.__lvSaison = new qx.ui.form.SelectBox();
			saisonChoice.setAllowGrowX(false);
			this.__content.add(saisonChoice);
			
			// add saison items to select box
			var saisons = this.__ligaManagerRpc.callSync("GetSaisons");
			
			if (saisons != null) {
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
			
			
			// add changed listener
			saisonChoice.addListener("changeSelection", this.__coSaisonChanged , this);
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
		__filterRadioGroup : null,
		
		
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
			
			table.setColumnWidth( 0, 200 );
			table.setColumnWidth( 1, 200 );
			table.setColumnWidth( 2, 200 );
			table.setColumnWidth( 3, 50 );
			
			this.__scorerTable.setWidth(650 + 20);
			
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
