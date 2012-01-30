
/**
 * This class represents the main widget that is shown for this
 * application.
 */
qx.Class.define("m_ligamanager.pages.PlayingSchedulePage",
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
		__replaceMap : null,
		
		// overridden
		_initialize : function()
		{
			this.base(arguments);
			
			// create replace map for saison teams
			var lmRpc = new qx.io.remote.Rpc(m_ligamanager.Core.RPC_BACKEND , "ligamanager.LigaManager");
			var saisonTeams = lmRpc.callSync("GetOnlyTeamsOfSaison", -1);

			if (saisonTeams != null) {
			
				this.__replaceMap = {};
				for (var i = 0; i < saisonTeams.length; i++) {
					var row = saisonTeams[i];
					this.__replaceMap[row["id"]] = row["name"];
				}
			
			
			
				var coreRpc = new qx.io.remote.Rpc(m_ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
				var table = coreRpc.callSync("GetEntities", "match", "date", "asc", null, null, 
				{
					"saison_id" : "current"
				});
				
				this.__showTable(table);
			}
		},
		
		__showTable : function(playTable) {
			var self = this;
			
			// Create the list with a delegate that
			// configures the list item.
			var list = this.__list = new qx.ui.mobile.list.List({
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
					
					item.setSubTitle(subTitle);
				}
			});
			
			this.getContent().add(list);
			var model = new qx.data.Array(playTable);
			list.setModel(model);
		}

	}
});
