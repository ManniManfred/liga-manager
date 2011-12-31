
/**
 * This class represents the main widget that is shown for this
 * application.
 */
qx.Class.define("m_ligamanager.pages.TablePage",
{
	extend: qx.ui.mobile.page.NavigationPage,

	/*
	*****************************************************************************
	STATICS
	*****************************************************************************
	*/

	statics: {
	},


	/*
	* ****************************************************************************
	* CONSTRUCTOR
	* ****************************************************************************
	*/

	/**
	 * 
	 */
	construct: function(mainWidget) {
		this.base(arguments);

		this.__mainWidget = mainWidget;
		
		this.setTitle("Spieltabelle");
		this.setShowBackButton(true);
		this.setBackButtonText("Back");
		
		
		this.addListener("initialize", this.__initialize,this);
		this.addListener("back", function() {
			mainWidget.show({reverse:true});
		}, this);

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
		__mainWidget : null,
		
		__initialize : function() {
		
			var coreRpc = new qx.io.remote.Rpc(m_ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
			var playTable = coreRpc.callSync("GetEntities", "play_table");
				
		   
			// Create the list with a delegate that
			// configures the list item.
			var list = new qx.ui.mobile.list.List({
				configureItem : function(item, data, row)
				{
					item.setSelectable(false);
					item.setTitle(data.rank + ". " + data.name);
					item.setSubTitle("Punkte: " + data.points);
				}
			});
			list.setModel(new qx.data.Array(playTable));
			this.getContent().add(list);
		}

	}
});
