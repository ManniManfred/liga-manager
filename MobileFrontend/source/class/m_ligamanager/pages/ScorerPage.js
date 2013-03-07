
/**
 * This class represents the main widget that is shown for this
 * application.
 */
qx.Class.define("m_ligamanager.pages.ScorerPage",
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
		
		this.setTitle("Torjäger");
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
			return ["GetEntities", "scorer",  "goals", "desc", null, null, 
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
					item.setTitle("<b>" + data.firstname + " " + data.lastname + "</b> ");
					item.setSubtitle(
						"<b>Mannschaft:</b> " + data.team_name
						+ " <b>Tore:</b> " + data.goals);
				}
			});
			
			this.getContent().add(list);
			var model = new qx.data.Array(playTable);
			list.setModel(model);
		}

	}
});
