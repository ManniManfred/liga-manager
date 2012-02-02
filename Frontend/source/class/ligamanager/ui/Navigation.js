
/**
 * This class represents the main widget that is shown for this
 * application.
 */
qx.Class.define("ligamanager.ui.Navigation",
{
	extend: qx.ui.container.Composite,
	type: "singleton",
	
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
	construct: function() {
		this.base(arguments);

		this.__menuMap = {};
		
		
		qx.bom.History.getInstance().addListener("request", function(e)
		{
			var state = e.getData();

			// application specific state update (= application code)
			this.showPage(state);
		}, this);


		this.showPage(qx.bom.History.getInstance().getState());
	},

	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties: {
		activePage : {
			check : "ligamanager.pages.IPage",
			nullable : true,
			init : null,
			event : "changeActivePage"
		}
	},

	/*
	 * ****************************************************************************
	 * EVENTS
	 * ****************************************************************************
	 */

	events:
	{
		"showPage" : "qx.event.type.Data"
	},


	/*
	* ****************************************************************************
	* MEMBERS
	* ****************************************************************************
	*/

	members:
	{
		__menuMap : null,
		
		__blockSpace : 15,
		__innerSpace : 5,
		
		
		showPage : function(pageName) {
			if (this.__menuMap[pageName]) {
				this.__menuMap[pageName].execute();
			}
		},
		
		
		createMenu : function(menuDef, parentButton) {
			
			var layout = new qx.ui.layout.VBox();
			layout.setSpacing(this.__innerSpace);
			var sidebar = new qx.ui.container.Composite(layout);
			sidebar.setAppearance("sidebar");
			
			
			for(var i = 0, l = menuDef.length; i < l ;i++) {
				var entry = menuDef[i];
				
				var btEntry = this.__btTable = new qx.ui.form.Button(entry.name, null);
				btEntry.setAppearance("sidebar/button");
				btEntry.setUserData("page", entry.page);
				if (parentButton != null) {
					btEntry.setUserData("parentButton", parentButton);
				}
				
				btEntry.addListener("execute", this.__onBtExecuted, this);
				
				
				if (entry.children != null) {
					sidebar.add(new qx.ui.core.Spacer(this.__blockSpace, this.__blockSpace));
					sidebar.add(btEntry);
				
					var subMenu = this.createMenu(entry.children, btEntry);
					subMenu.setPaddingLeft(sidebar.getPaddingLeft() + 20);
					sidebar.add(subMenu);

				} else {
					sidebar.add(btEntry);
				}
				
				this.__menuMap[entry.name] = btEntry;
			}
			
			return sidebar; 
		},
		

		__onBtExecuted : function(evt) {
			var btEntry = evt.getTarget();
			qx.bom.History.getInstance().addToHistory(btEntry.getLabel());
			this.__markNavigationItem(evt.getTarget());
			
			//this.fireDataEvent("showPage", )
			
			var pageClass = btEntry.getUserData("page");
			
			if (!ligamanager.Utils.isInstanceOf(this.getActivePage(), pageClass)) {
				this.setActivePage(new pageClass(this));
			}
		},
		
		
		
		__onShowPage : function(evt) {
			var target = evt.getTarget();
			var pageClass = target.getUserData("page");
			
			if (!ligamanager.Utils.isInstanceOf(this.getActivePage(), pageClass)) {
				this.setActivePage(new pageClass(this));
			}
		},
		
		/**
		 * Marks the specified button.
		 */
		__markNavigationItem : function(button) {
			// clear state isIn button
			if (this.__inButtons != null) {
				for (var i = 0, l = this.__inButtons.length; i < l; i++) {
					this.__inButtons[i].removeState("isIn");
				}
			}
		
			this.__inButtons = [];
			this.__inButtons.push(button);
			button.addState("isIn");
			
			var parentButton = button.getUserData("parentButton");
			while (parentButton != undefined && parentButton != null) {
				parentButton.addState("isIn");
				this.__inButtons.push(parentButton);
				var parentButton = parentButton.getUserData("parentButton");
			}
		}
	}
});
