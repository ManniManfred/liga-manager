

qx.Class.define("m_ligamanager.ui.WaitingContainer",
{
	extend: qx.ui.mobile.container.Composite,

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments, new qx.ui.mobile.layout.HBox().set({alignX:"center"}));
		
		this.__waitLayer = m_ligamanager.ui.MWaiting.createWaitLayer();
		this.add(this.__waitLayer);
		
		this.stopWaiting();
	},

	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties: {},

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
		__waitLayer : null,
		
		
		/**
		 * Makes this control showing the wait status.
		 */
		startWaiting : function() {
			this.__waitLayer.setVisibility("visible");
		},

		/**
		 * Stops the waiting.
		 */
		stopWaiting : function() {
			this.__waitLayer.setVisibility("hidden");
		}

	}
});
