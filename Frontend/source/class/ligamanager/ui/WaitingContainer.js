

qx.Class.define("ligamanager.ui.WaitingContainer",
{
	extend: qx.ui.container.Composite,

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments, new qx.ui.layout.Grow());
		
		this.__waitLayer = ligamanager.ui.MWaiting.createWaitLayer();
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
