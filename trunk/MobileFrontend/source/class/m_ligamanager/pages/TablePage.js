
/**
 * This class represents the main widget that is shown for this
 * application.
 */
qx.Class.define("m_ligamanager.pages.TablePage",
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

		this.setTitle("Spieltabelle");
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
			return ["GetEntities", "play_table", null, null, null, null, 
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
					item.setTitle("<b>" + data.rank + "</b> " + data.name);
					item.setSubtitle(
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
