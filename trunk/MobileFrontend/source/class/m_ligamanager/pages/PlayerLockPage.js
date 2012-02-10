
/**
 * This class represents the main widget that is shown for this
 * application.
 */
qx.Class.define("m_ligamanager.pages.PlayerLockPage",
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
		
		this.setTitle("Sperren");
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
			var table = coreRpc.callSync("GetEntities", "locks", "date", "asc", null, null, 
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
					item.setTitle("<b>"  + data.firstname + " " + data.lastname + "</b>");
					item.setSubTitle(
						"<b>Mannschaft:</b> " + data.team_name
						+ " <b>Datum:</b> " + m_ligamanager.Core.DISPLAY_FORMAT.format(m_ligamanager.Core.SOURCE_FORMAT.parse(data.date))
						);
				}
			});
			
			this.getContent().add(list);
			var model = new qx.data.Array(playTable);
			list.setModel(model);
		}

	}
});
