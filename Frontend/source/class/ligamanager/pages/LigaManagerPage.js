
/*
#asset(ligamanager/normal/new.png)
#asset(ligamanager/normal/default.png)
*/
qx.Class.define("ligamanager.pages.LigaManagerPage",
{
	extend: qx.ui.container.Composite,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		var layout = new qx.ui.layout.VBox();
		layout.setSpacing(20);
		this.base(arguments, layout);
		
		this.setPadding(20);
		
		
		this.__ligaManagerRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.LigaManager");
		
		this.__createSaison();
		this.__updateSaisons();
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
		__ligaManagerRpc : null,
	
		__lvSaison : null,
		
		
		__createSaison : function() {
			
			var gbSaison = new qx.ui.groupbox.GroupBox("Saison");
			gbSaison.setAllowGrowX(false);
			gbSaison.setLayout(new qx.ui.layout.Dock());
			this.add(gbSaison);

			//
			// toolbar
			//
			var toolbar = new qx.ui.toolbar.ToolBar();
			gbSaison.add(toolbar, {edge: "north"});


			var btNew = new qx.ui.toolbar.Button(this.tr("New"), "ligamanager/normal/new.png");
			btNew.addListener("execute", this.__onNewSaison, this);
			toolbar.add(btNew);

			var btSetDefault = new qx.ui.toolbar.Button(this.tr("SetDefault"), "ligamanager/normal/default.png");
			btSetDefault.addListener("execute", this.__onSetDefault, this);
			toolbar.add(btSetDefault);


			var lvSaison = this.__lvSaison = new qx.ui.form.List();
			gbSaison.add(lvSaison, {edge: "center"});


			toolbar.setShow("icon");
		},
		
		__updateSaisons : function() {
			
			var self = this;
			this.__ligaManagerRpc.callAsync(function(result, ex) {
				if (ex == null) {
					
					for (var i=0; i < result.length; i++) {
						var item = new qx.ui.form.ListItem(result[i].name);
						self.__lvSaison.add(item);
						
						if (result[i].isDefault == true) {
							item.setIcon("ligamanager/normal/default.png");
						}
					}
				} else {
					alert("Fehler beim Laden der Saisons.");
				}
			}, "GetSaisons");
			
		},
		
		__onSetDefault : function(evt) {
			alert("set default");
		},
		
		__onNewSaison : function(evt) {
			alert("Neue Saison");
		}
	}
});
