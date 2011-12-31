
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
			var label = new qx.ui.mobile.basic.Label("SpielTablle ...");
			this.getContent().add(label);
		}

	}
});
