
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
		__list : null,
		
		// overridden
		_start : function()
		{
			this.base(arguments);
			
			this.getContent().removeAll();
			
			var button = new qx.ui.mobile.form.Button("test ");
			this.getContent().add(button);
			
			button.addListener("tap", function() {
				this.getContent().add(new qx.ui.mobile.form.Button("bt 2"));
			}, this);
			
				
			//var waiting = new m_ligamanager.ui.WaitingContainer();
			//this.getContent().add(waiting);
			/*
			waiting.startWaiting();
			
			var self = this;
		
			var coreRpc = new qx.io.remote.Rpc(m_ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
			coreRpc.callAsync(function(result, ex) {
				waiting.stopWaiting();
				self.getContent().remove(waiting);
				
				var button = new qx.ui.mobile.form.Button("test ");
				this.getContent().add(button);
				
				// try {
					// if (ex == null) {
						// if (result != null) {
							// self.__showTable(result);
							qx.ui.mobile.core.DomUpdatedHandler.refresh();
						// }
					// } else {
						// alert("Fehler beim Laden der Tabelle.");
					// }
				// } catch(ex) {
						// alert("Fehler beim Aufbau der Tabelle.");
				// }
			}, "GetEntities", "play_table");
			*/
		    
		},
		
		__showTable : function(playTable) {
			
			// Create the list with a delegate that
			// configures the list item.
			// var list = this.__list = new qx.ui.mobile.list.List({
				// configureItem : function(item, data, row)
				// {
					// item.setSelectable(false);
					// item.setTitle(data.rank + ". " + data.name);
					// item.setSubTitle("Punkte: " + data.points);
				// }
			// });
			
			// this.getContent().add(list);
			// var model = new qx.data.Array(playTable);
			// list.setModel(model);
			
			var button;
			for (var i = 0, l = playTable.length; i < l; i++) {
				button = new qx.ui.mobile.form.Button(playTable[i].name);
				this.getContent().add(button);
			}
			
			
			// var st = getComputedStyle(this.getContent().getContainerElement());
			// var dis = st.getPropertyValue("display");
			
			// var st2 = getComputedStyle(button.getContainerElement());
			// var dis2 = st2.getPropertyValue("display");
			
			//qx.ui.mobile.core.Widget.domUpdated();
			//qx.ui.mobile.core.Widget.scheduleDomUpdated();
		}

	}
});
