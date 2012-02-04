
/**
 * An instance of this class manage the navigation of this application.
 * Therefor it is a singleton. One for this applicaiton.
 */
qx.Class.define("ligamanager.ui.Navigation",
{
	extend: qx.ui.container.Composite,
	type: "singleton",
	

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
		
		// add history events
		qx.bom.History.getInstance().addListener("request", function(e)
		{
			var state = e.getData();
			this.showPage(state);
		}, this);
	},

	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties: {
		/**
		 * Contains the active page of this navigation.
		 */
		activePage : {
			check : "ligamanager.pages.IPage",
			nullable : true,
			init : null,
			event : "changeActivePage"
		},
		
		blockSpace : {
			check : "Integer",
			init : 15
		},
		
		innerSpace : {
			check  : "Integer",
			init : 5
		}
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
		__menuMap : null,
		__inButtons : null,
		
		
		/**
		 * Shows the page with the specified name.
		 * @param pageName {String} The name/title of the page that should be shown.
		 */
		showPage : function(pageState) {
			var pageName = pageState;
			var param = null;
			
			var tildePos = pageState.indexOf("~");
			if (tildePos > 0) {
				pageName = pageState.substr(0, tildePos);
				param = pageState.substr(tildePos + 1);
			}
		
			if (this.__menuMap[pageName]) {
				var core = ligamanager.Core.getInstance();
				var user = core.getUser();
				var allowedGroups = this.__menuMap[pageName].getUserData("userGroups");
				
				if (allowedGroups == null
					|| (user != null && qx.lang.Array.contains(allowedGroups, user.rights))) {
					var btEntry = this.__menuMap[pageName];
					btEntry.setUserData("param", param);
					btEntry.execute();
				} else {
					this.setActivePage(null);
				}
			}
		},
		
		/**
		 * Creates a new side bar menu out of the menu definition
		 * and the specified parent button.
		 * @param menuDef {Map} The menu definition to create the menu
		 * @param parentButton {qx.ui.form.Button?null} Optional parent button
		 */
		createMenu : function(menuDef, parentButton, naviId) {
			
			var layout = new qx.ui.layout.VBox();
			layout.setSpacing(this.getInnerSpace());
			var sidebar = new qx.ui.container.Composite(layout);
			sidebar.setAppearance("sidebar");
			
			var core = ligamanager.Core.getInstance();
			var user = core.getUser();
			
			for(var i = 0, l = menuDef.length; i < l ;i++) {
				var entry = menuDef[i];
				
				if (entry.userGroups == null
					|| (user != null && qx.lang.Array.contains(entry.userGroups, user.rights))) {
					
					
					var btEntry = this.__btTable = new qx.ui.form.Button(entry.name, null);
					btEntry.setAppearance("sidebar/button");
					btEntry.setUserData("page", entry.page);
					btEntry.setUserData("url", entry.url);
					btEntry.setUserData("action", entry.action);
					btEntry.setUserData("userGroups", entry.userGroups);

					if (parentButton != null) {
						btEntry.setUserData("parentButton", parentButton);
					}

					btEntry.addListener("execute", this.__onBtExecuted, this);

					var entryNaviId = naviId == null ? entry.name : naviId + "." + entry.name;

					if (entry.children != null) {
						sidebar.add(new qx.ui.core.Spacer(this.getBlockSpace(), this.getBlockSpace()));
						sidebar.add(btEntry);

						var subMenu = this.createMenu(entry.children, btEntry, entryNaviId);
						subMenu.setPaddingLeft(sidebar.getPaddingLeft() + 20);
						sidebar.add(subMenu);

					} else {
						sidebar.add(btEntry);
					}


					this.__menuMap[entryNaviId] = btEntry;
				}
			}
			
			return sidebar; 
		},
		

		__onBtExecuted : function(evt) {
			var btEntry = evt.getTarget();
			this.__markNavigationItem(btEntry);
			
			// add to history
			var label = "";
			for(var i = this.__inButtons.length - 1; i >= 0 ; i--) {
				label += this.__inButtons[i].getLabel();
				if (i > 0) {
					label += ".";
				}
			}
			
			// get user data
			var param =  btEntry.getUserData("param");
			var pageClass = btEntry.getUserData("page");
			var url =  btEntry.getUserData("url");
			var action = btEntry.getUserData("action");
			var param = btEntry.getUserData("param");
			
			if (param != null)
				label += "~" + param;
			qx.bom.History.getInstance().addToHistory(label, label);
			
			
			
			
			if (action) {
				action();
			}
			
			if (pageClass != null) {
				if (!ligamanager.Utils.isInstanceOf(this.getActivePage(), pageClass)) {
					var page = new pageClass(param);
					this.setActivePage(page);
				} else {
					var page = this.getActivePage();
					if (param != null && page.setParam != null) {
						page.setParam(param);
					}
				}
			} else if (url != null) {
				if (!ligamanager.Utils.isInstanceOf(this.getActivePage(), ligamanager.pages.IFramePage)) {
					this.setActivePage(new ligamanager.pages.IFramePage());
				}
			
				var framePage = this.getActivePage();
				framePage.setSource(url);
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
