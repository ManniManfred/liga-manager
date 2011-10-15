
/**
 * Adds waiting ability to a widget. Classes that want to use this must
 * be a LayoutItem.
 */
qx.Mixin.define("ligamanager.ui.MWaiting",
{

	/*
	*****************************************************************************
	STATICS
	*****************************************************************************
	*/

	statics: {
		/**
		 * Creates a new overlay wait layer.
		 */
		createWaitLayer : function() {
			//var layout = new qx.ui.layout.Flow();
			//layout.setAlignX("center");
			//layout.setAlignY("middle");
			
			//var layout = new qx.ui.layout.Grid();
			//layout.setColumnAlign(0, "center", "middle");
			
			var layout = new qx.ui.layout.Dock();
			var waitLayer = new qx.ui.container.Composite(layout);
	 
			waitLayer.setBackgroundColor("#FFFFFF");
			waitLayer.setOpacity(0.8);
			waitLayer.setZIndex(1000000);
			
			var waitIcon = new qx.ui.basic.Image("ligamanager/waitcursor.gif");
			waitIcon.setAlignX("center");
			waitIcon.setAlignY("middle");
			waitLayer.add(waitIcon, {edge : "center"});
			
			waitLayer.setCursor("wait");
		
			return waitLayer;
		}
	},

	/*
	*****************************************************************************
	CONSTRUCTOR
	*****************************************************************************
	*/

	construct: function() {
		
		// Document is the application root
		//var doc = ligamanager.Application.instance.getRoot();
		var doc = this.getApplicationRoot();

		this.__waitLayer = ligamanager.ui.MWaiting.createWaitLayer();
		
		// Add button to document at fixed coordinates
		doc.add(this.__waitLayer);
		
		this.__hideWaitingLayer();
	},


	/*
	*****************************************************************************
	PROPERTIES
	*****************************************************************************
	*/

	properties:
	{
	},




	/*
	*****************************************************************************
	MEMBERS
	*****************************************************************************
	*/

	members:
	{
		__waitLayer : null,
		__isWaiting : null,
		__widgetToOverlay : null,
		
		setWidgetToOverlay : function(widget) {
			this.__widgetToOverlay = widget;
		},
		
		getWidgetToOverlay : function() {
			return this.__widgetToOverlay;
		},
		
		//__addEventListener : function() {
		//    this.addListener("move", this.__setWaitingLayerBounds, this);
		//   this.addListener("resize", this.__setWaitingLayerBounds, this);
		//},
		
		
		/**
		 * Makes this control showing the wait status.
		 */
		startWaiting : function() {
		
			// if no widget to overlay is set explicit use this
			if (this.__widgetToOverlay == null) {
				this.__widgetToOverlay = this;
			}
			
			
			this.__isWaiting = true;
			if (this.__widgetToOverlay.isSeeable() == true) {
				this.__showWaitingLayer();
			} else {
				this.__widgetToOverlay.addListener("appear", this.__onAppear, this)
			}
		},

		/**
		 * Stops the waiting.
		 */
		stopWaiting : function() {
			this.__hideWaitingLayer();
			this.__isWaiting = false;
		},
		
		
		__onAppear : function(evt) {
			if (this.__isWaiting) {
				this.__showWaitingLayer();
			}
		},
		
		refreshWaitingLayerBounds : function() {
			var bounds = this.__widgetToOverlay.getBounds();
			var position = this.__widgetToOverlay.getContainerLocation("marging");
			
			if (bounds != null && position != null) {
				this.__waitLayer.set({width: bounds.width, height: bounds.height});
				this.__waitLayer.setLayoutProperties({left: position.left, top: position.top});
			}
		},
		
		__showWaitingLayer : function() {
			this.refreshWaitingLayerBounds();
			this.__waitLayer.setVisibility("visible");
		},
		
		

		__hideWaitingLayer : function() {
			if (this.__waitLayer != null) {
				this.__waitLayer.set({width: 0, height: 0});
				this.__waitLayer.setVisibility("hidden");
			}
		}
		
	}
});
