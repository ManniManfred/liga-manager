
qx.Class.define("ligamanager.pages.EmptyPage",
{
	extend: qx.ui.container.Composite,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments, new qx.ui.layout.Dock());
		
		/*
		this.setBackgroundColor("#FFFFFF");
		this.setOpacity(0.8);
		this.setZIndex(1000000);
		*/
		
		
		var backImage = new qx.ui.basic.Image("ligamanager/bgimage.png");
		backImage.setAlignX("center");
		backImage.setAlignY("middle");
		this.add(backImage, {edge : "center"});
		
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
	}
});
