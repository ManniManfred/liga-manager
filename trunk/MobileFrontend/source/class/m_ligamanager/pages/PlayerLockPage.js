
/**
 * This class represents the main widget that is shown for this
 * application.
 */
qx.Class.define("m_ligamanager.pages.PlayerLockPage",
{
	extend: m_ligamanager.pages.AbstractDataPage,


	/*
	* ****************************************************************************
	* CONSTRUCTOR
	* ****************************************************************************
	*/

	/**
	 * 
	 */
	construct: function(mainWidget) {
		this.base(arguments, mainWidget);

		this.setTitle("Sperren");
	},


	/*
	* ****************************************************************************
	* MEMBERS
	* ****************************************************************************
	*/

	members:
	{
		// overridden
		_getRequest : function() {
			return ["GetEntities", "locks", "date", "asc", null, null, 
						{"saison_id" : "current"}];
		},
		
		
		// overridden
		_fillData : function(playTable) {
			
			// Create the list with a delegate that
			// configures the list item.
			var list = new qx.ui.mobile.list.List({
				configureItem : function(item, data, row)
				{
					item.setSelectable(false);
					item.setTitle("<b>"  + data.firstname + " " + data.lastname + "</b>");
					item.setSubtitle(
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
