
/*
#asset(qx/icon/${qx.icontheme}/22/actions/view-refresh.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
#asset(ligamanager/22/default.png)
*/
qx.Class.define("ligamanager.pages.SaisonManagerPage",
{
	extend: qx.ui.window.Desktop,
	implement: [ligamanager.pages.IPage],

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
		this.__createRelationsPart();
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
		__lvTeams : null,
		
		__applyCurrentSaison : function(value, oldValue) {
			this.__updateRelations();
		},
		
		__createSaisonChoice : function() {
		
			var saisonChoice = new qx.ui.form.SelectBox();
			saisonChoice.setAllowGrowX(false);
			this.__content.add(saisonChoice);
			
			// add changed listener
			saisonChoice.addListener("changeSelection", function(evt) {
				var selection = evt.getData();
				//var selection = this.__lvSaison.getSelection();
				if (selection == null || selection.length <= 0) {
					this.setCurrentSaison(null);
				} else {
					this.setCurrentSaison(selection[0].getUserData("saison"));
				}
			}, this);
			
			
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
		
		__createRelationsPart : function() {
			
			var laSaison = new qx.ui.basic.Label("Saison Zuordnungen");
			laSaison.setAppearance("label-sep");
			this.__content.add(laSaison);
			
			var paTeams = new qx.ui.container.Composite();
			paTeams.setAllowGrowX(false);
			paTeams.setLayout(new qx.ui.layout.Dock());
			this.__content.add(paTeams);

			
			//
			// toolbar
			//
			var toolbar = new qx.ui.toolbar.ToolBar();
			paTeams.add(toolbar, {edge: "north"});

			var part = new qx.ui.toolbar.Part();
			toolbar.add(part);

			var btRefresh = new qx.ui.toolbar.Button(this.tr("Refresh"), "icon/22/actions/view-refresh.png" );
			btRefresh.addListener("execute", this.__updateRelations, this );
			part.add(btRefresh);
			
			part.add(new qx.ui.toolbar.Separator());
			
			toolbar.setShow("icon");
			
			//
			// list teams
			//
			
			var lvTeams = this.__lvTeams = new qx.ui.form.List();
			//lvTeams.addListener("changeSelection", this.__saisonSelectionChanged, this);
			paTeams.add(lvTeams, {edge: "center"});


			
			
			//
			// list player
			//
		},
		
		__updateRelations : function() {
			//var teams = this.__ligaManagerRpc.callSync("GetTeams", this.getCurrentSaison());
			var teams = [{name : "HSV", related : true}, {name : "Lupine", related : true}];
			
			for(var i = 0; i < teams.length; i++) {
				var item = new qx.ui.form.CheckBox(teams[i]["name"]);
				item.setValue(teams[i]["related"]);
				this.__lvTeams.add(item);
			}
		}
		
	}
});
