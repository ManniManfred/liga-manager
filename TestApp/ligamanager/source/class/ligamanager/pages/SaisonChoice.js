/*
#asset(qx/icon/${qx.icontheme}/22/actions/view-refresh.png)
#asset(qx/icon/${qx.icontheme}/22/actions/document-properties.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
*/

qx.Class.define("ligamanager.pages.SaisonChoice",
{
	extend: qx.ui.container.Composite,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments);
		
		this.__ligaManagerRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.LigaManager");


		var layout = new qx.ui.layout.VBox();
		layout.setSpacing(20);
		this.setLayout(layout);
		
		
		this.__content = this;
		this.__createSaisonChoice();
		
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
			event : "changeSaison"
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
		__inInit : null,
		
		__createSaisonChoice : function() {
		
			var saisonChoice = this.__lvSaison = new qx.ui.form.SelectBox();
			saisonChoice.setAllowGrowX(false);
			this.__content.add(saisonChoice);
			
			var self = this;
			
			// add saison items to select box
			var saisons = this.__ligaManagerRpc.callAsync(function(saisons, ex) {
			
				if (saisons != null) {
					var defaultItem = null;
					
					if (saisons.length > 1) {
						self.__inInit = true;
					}
					
					for (var i=0; i < saisons.length; i++) {
						var item = new qx.ui.form.ListItem(saisons[i].name);
						item.setUserData("saison", saisons[i]);
						saisonChoice.add(item);

						if (saisons[i].isDefault == true) {
							defaultItem = item;
						}
					}
					self.__inInit = false;
					
					// select default saison
					if (defaultItem != null) {
						defaultItem.setIcon("ligamanager/22/default.png");
						saisonChoice.setSelection([defaultItem]);
					}
				}
			},"GetSaisons");
			
			
			// add changed listener
			saisonChoice.addListener("changeSelection", this.__coSaisonChanged , this);
		},
		
		__coSaisonChanged : function(evt) {
			var selection = evt.getData();
			//var selection = this.__lvSaison.getSelection();
			if (!this.__inInit) {
				if (selection == null || selection.length <= 0) {
					this.setCurrentSaison(null);
				} else {
					this.setCurrentSaison(selection[0].getUserData("saison"));
				}
			}
		}
		
	}
});
