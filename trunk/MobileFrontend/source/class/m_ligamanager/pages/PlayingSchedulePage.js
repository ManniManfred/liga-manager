
/**
 * This class represents the main widget that is shown for this
 * application.
 */
qx.Class.define("m_ligamanager.pages.PlayingSchedulePage",
{
	extend: m_ligamanager.pages.AbstractDataPage,

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
		this.base(arguments, mainWidget);
		
		this.setTitle("Spieltabelle");
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
		__replaceMap : null,
		
		
		// overridden
		_executeRequest : function(callback) {
		
			var self = this;
		
			var getTeamsOfSaisonHandler = function(saisonTeams, exc) {
				if (exc == null) {
					if (saisonTeams != null) {
						self.__replaceMap = {};
						for (var i = 0; i < saisonTeams.length; i++) {
							var row = saisonTeams[i];
							self.__replaceMap[row["id"]] = row["name"];
						}
					
						self._coreRpc.callAsync(callback, "GetEntities", "match", "date", "asc", null, null, 
						{
							"saison_id" : "current"
						});
					}
				} else {
					callback(null, exc);
				}
			};
			
			// create replace map for saison teams
			var lmRpc = new qx.io.remote.Rpc(m_ligamanager.Core.RPC_BACKEND , "ligamanager.LigaManager");
			lmRpc.callAsync(getTeamsOfSaisonHandler, "GetOnlyTeamsOfSaison", -1);

		},
		
		
		// overridden
		_fillData : function(playTable) {
			var self = this;
			
			// Create the list with a delegate that
			// configures the list item.
			var list = new qx.ui.mobile.list.List({
				configureItem : function(item, data, row)
				{
					item.setSelectable(false);
					
					var team1 = self.__replaceMap[data.id_saison_team1];
					var team2 = self.__replaceMap[data.id_saison_team2];
					var dateStr = m_ligamanager.Core.DISPLAY_FORMAT.format(m_ligamanager.Core.SOURCE_FORMAT.parse(data.date))
					
					item.setTitle(dateStr);
					
					var subTitle = team1 + " - " + team2;
					if (data.goal1 != null) {
						subTitle += " <b>" + data.goal1 + ":" + data.goal2 + "</b>";
					}
					
					item.setSubtitle(subTitle);
				}
			});
			
			this.getContent().add(list);
			var model = new qx.data.Array(playTable);
			list.setModel(model);
		}

	}
});
