
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
		this.setBackButtonText("Zurück");
		
		this.addListener("back", function() {
			mainWidget.show({
				reverse:true
			});
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
		__list : null,
		
		// overridden
		_initialize : function()
		{
			this.base(arguments);
			
			var coreRpc = new qx.io.remote.Rpc(m_ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
			var table = coreRpc.callSync("GetEntities", "play_table", null, null, null, null, 
				{"saison_id" : "current"});
				
			this.__showTable(table);
		    
		},
		
		__showTable : function(playTable) {
			
			// Create the list with a delegate that
			// configures the list item.
			var list = this.__list = new qx.ui.mobile.list.List({
				configureItem : function(item, data, row)
				{
					item.setSelectable(false);
					item.setTitle("<b>" + data.rank + "</b> " + data.name);
					item.setSubTitle(
						"<b>Spiele:</b> " + data.match_count 
						+ " <b>Tore:</b> " + data.goals 
						+ " <b>Diff:</b> " + data.goals_diff
						+ " <b>Punkte:</b> " + data.points);
				}
			});
			
			this.getContent().add(list);
			var model = new qx.data.Array(playTable);
			list.setModel(model);
		}

	}
});
