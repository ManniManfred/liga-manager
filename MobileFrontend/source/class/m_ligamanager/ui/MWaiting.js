/*
#asset(m_ligamanager/waitcursor.gif)
*/

/**
 * Adds waiting ability to a widget. Classes that want to use this must
 * be a LayoutItem.
 */
qx.Mixin.define("m_ligamanager.ui.MWaiting",
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
		
			var layout = new qx.ui.mobile.layout.HBox().set({alignX:"center"});
			var waitLayer = new qx.ui.mobile.container.Composite(layout);
	 
			// waitLayer.setBackgroundColor("#FFFFFF");
			// waitLayer.setOpacity(0.8);
			// waitLayer.setZIndex(1000000);
			
			 
			var waitIcon = new qx.ui.mobile.basic.Image("m_ligamanager/waitcursor.gif");
			//waitIcon.setCursor("wait");
			waitLayer.add(waitIcon, {flex : 1});
			
			return waitLayer;
		}
	}
});
