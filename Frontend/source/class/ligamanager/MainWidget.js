
/**
 * This class represents the main widget that is shown for this
 * application.
 */
qx.Class.define("ligamanager.MainWidget",
{
	extend: ligamanager.ui.WaitingContainer,
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

		this.__navi = ligamanager.ui.Navigation.getInstance();
		this.__navi.addListener("changeActivePage", this.__onActivePageChanged, this);
		this.__coreRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
		
		var core = ligamanager.Core.getInstance();

		core.IsCorrectlyLoggedIn();
		this.__prevUser = core.getUser();
		core.addListener("changeUser", this.__onUserChanged, this);

		// load design
		this.loadDesign();
		this.setDesign(this.__design);
		
		
		// create ui
		this.__allContainer = new qx.ui.container.Composite(new qx.ui.layout.Dock());
		this.add(this.__allContainer);
		
		var header = this.__createHeader();
		this.__allContainer.add(header, {
			edge : "north"
		});
		
		
		this.__inBar = this.__createInBar();
		this.__outBar = this.__createOutBar();
		
		var sideBar = this.__createSideBar();
		var paSideScroll = new qx.ui.container.Scroll(sideBar);
		paSideScroll.setWidth(200);
		this.__allContainer.add(paSideScroll, {
			edge : "west"
		});
		
		var contentContainer = this.__contentContainer = new qx.ui.container.Composite(new qx.ui.layout.Grow());
		this.__allContainer.add(contentContainer, {
			edge : "center"
		});
		
		this.__emptyPage = new ligamanager.pages.EmptyPage();
		
		
		this.__updateSideBar();
		
		
		this.__navi.setActivePage(null);
		this.__navi.showPage(qx.bom.History.getInstance().getState());
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
		__settings : null,
		__design : null,
		__coreRpc : null,
		__inButtons : null,
		__contentContainer : null,
		__emptyPage : null,
		__prevUser : null,
		
		__navi : null,
		
		__blockSpace : 15,
		__innerSpace : 5,
		
		__userMenuContainer : null,
		
		// contains the side bar for a logged in user
		__inBar : null,
		
		// contains the side bar for all user (a not logged in user)
		__outBar : null,
	
		
		//
		// buttons for login, register
		//
		__btLogin : null,
		__btRegister : null,
		
		
		__onActivePageChanged : function(e) {
			var page = e.getData();
			
			this.__contentContainer.removeAll();
			
			if (page != null) {
				this.__contentContainer.add(page);
			} else {
				this.__contentContainer.add(this.__emptyPage);
			}
		},
		
		getSettings : function() {
			return this.__settings;
		},
		
		/**
		 * Loads the design stored in the server
		 * and sets the appearance.
		 */
		loadDesign : function() {
			
			// create default design
			var design = this.__design = {};
			design.Title = "Hobbyliga Kreis Borken";
			design.Image = "fussball_gras.png";
			design.TitleBackColor = "rgb(16,153,9)";
			design.TitleFrontColor = "#ffffff";
			design.NavBackColor = "#002953";
			design.NavFrontColor = "#FFF";
			design.HighlightColor = "#AAFFFF";
			
			var storedDesign = this.__coreRpc.callSync("GetDesign");
			
			// take properties from storedDesign
			if (storedDesign != null) {
				for (var key in storedDesign) {
					design[key] = storedDesign[key];
				}
			}
			
		},
		
		getDesign : function() {
			return this.__design;
		},
		
		setDesign : function(design) {
			this.__design = design;
			
			var appearance = ligamanager.theme.Appearance.appearances;
			
			//
			// set title
			//
			if (this.__title != null) {
				this.__title.setLabel(design.Title);
				this.__title.setIcon(ligamanager.Core.DOCUMENT_FOLDER + design.Image);
			}
			
			appearance["app-title"].style = function(states) {
				return {
					font : "bold",
					textColor : design.TitleFrontColor,
					padding : [8, 12],
					backgroundColor : design.TitleBackColor //"#002953"
				};
			}
				
			
			//
			// set navigation style
			//
			
			appearance["sidebar"].style = function(states) {
				return {
					padding : [8, 12],
					textColor : design.NavFrontColor,
					backgroundColor : design.NavBackColor //"#002953"
				};
			}
			
			appearance["sidebar/button"].style = function(states) {
				return {
					allowGrowX : false,
					textColor : states.hovered ? design.HighlightColor : undefined,
					cursor : "pointer",
					font : states.isIn ? "bold-underline" : undefined
				};
			}
		},
		
		
		
		/**
		 * Creates the header for this main window.
		 */
		__createHeader : function() {
			var layout = new qx.ui.layout.HBox();
			var header = new qx.ui.container.Composite(layout);
			header.setAppearance("app-title");
			
		
			var title = this.__title = new qx.ui.basic.Atom(
				this.__design.Title, 
				ligamanager.Core.DOCUMENT_FOLDER + this.__design.Image);
			header.add(title);
			
			//this.__activeWorkspaceLabel = new qx.ui.basic.Label();
			//header.add(new qx.ui.core.Spacer, {flex : 1});
			//header.add(this.__activeWorkspaceLabel);
			
			return header; 
		},
		
		__createContentDesktop : function() {
			return new qx.ui.window.Desktop(new qx.ui.window.Manager());
		},
		
		__createOutBar : function() {
			
			var outMenuDef = [
			{
				"name" : this.tr("Login"), 
				"page" :  ligamanager.pages.LoginPage
			},
			{
				"name" : this.tr("Register"), 
				"page" :  ligamanager.pages.RegisterPage
			}];

			var sidebar = this.__navi.createMenu(outMenuDef);
			
			return sidebar;
		},
		
		
		__createInBar : function() {
		
			var layout = new qx.ui.layout.VBox();
			//layout.setSpacing(this.__innerSpace);
			var sidebar = new qx.ui.container.Composite(layout);
			sidebar.setPadding(0);
			sidebar.setAppearance("sidebar");
			
			return sidebar;
		},
		
		
		__createSideBar : function() {
			var menuDef = [
			{
				"name" : this.tr("Table"), 
				"page" :  ligamanager.pages.TablePage
			},
			{
				"name" : this.tr("Playing Schedule"), 
				"page" :  ligamanager.pages.PlayingSchedulePage
			},
			{
				"name" : this.tr("Scorer"), 
				"page" :  ligamanager.pages.ScorerPage
			},
			{
				"name" : this.tr("Locks"), 
				"page" :  ligamanager.pages.PlayerLockPage
			},
			{
				"name" : this.tr("Impressum"), 
				"url" :  ligamanager.Core.DOCUMENT_FOLDER + "Impressum.html"
			},
			{
				"name" : this.tr("Contact"), 
				"page" :  ligamanager.pages.ContactPage
			},
			{
				"name" : this.tr("Guestbook"), 
				"page" :  ligamanager.pages.Guestbook
			}];


			//
			// Add Documents
			//
			var docs = this.__coreRpc.callSync("GetEntities", "document");
			
			if (docs != null && docs.length > 0) {
				var docsEntry = {
					"name" : this.tr("Documents"),
					"page" :  ligamanager.pages.EmptyPage,
					"children" : []
				};
				
				menuDef.push(docsEntry);
				
				for (var i = 0, l = docs.length; i < l; i++) {
				
					var docEntry = {
						"name" : docs[i].name,
						"url" : ligamanager.Core.DOCUMENT_FOLDER + docs[i].filename
					};
					docsEntry.children.push(docEntry);
				}
			}

			var sidebar = this.__navi.createMenu(menuDef);

			this.__userMenuContainer = new qx.ui.container.Composite(new qx.ui.layout.Grow());
			//this.__userMenuContainer.setHeight(400);
			sidebar.add(this.__userMenuContainer);
			
			return sidebar; 
		},
		
		/**
		 * updates the sidebar for logged in status.
		 */
		__updateInBar : function() {
		
			var sidebar = this.__inBar;
			
			sidebar.removeAll();
			
			//
			// Verwaltung
			//
			
			var inMenuDef = [
				{
				"name" : this.tr("Logout"),
				"userGroups" : ["USER", "TEAM_ADMIN", "LIGA_ADMIN", "ADMIN"],
				"action" : function() {
						var core = ligamanager.Core.getInstance();
						core.logout();
						ligamanager.ui.Navigation.getInstance().showPage(
							qx.locale.Manager.tr("Table"));
					}
				},
				{
				"name" : this.tr("Manager"), 
				"page" :  ligamanager.pages.EmptyPage,
				"userGroups" : ["USER", "TEAM_ADMIN", "LIGA_ADMIN", "ADMIN"],
				"children" : [
					{
						"name" : this.tr("User Settings"), 
						"page" :  ligamanager.pages.UserSettingsPage,
						"userGroups" : ["USER", "TEAM_ADMIN", "LIGA_ADMIN", "ADMIN"]
					},
					{
						"name" : this.tr("Player"), 
						"page" :  ligamanager.pages.ChangeNames,
						"userGroups" : ["TEAM_ADMIN", "LIGA_ADMIN", "ADMIN"]
					},
					{
						"name" : this.tr("Matches"), 
						"page" :  ligamanager.pages.ManageMatchesPage,
						"userGroups" : ["TEAM_ADMIN", "LIGA_ADMIN", "ADMIN"]
					},
					{
						"name" : this.tr("Match Details"), 
						"page" :  ligamanager.pages.ManageMatchDetailsPage,
						"userGroups" : ["TEAM_ADMIN", "LIGA_ADMIN", "ADMIN"]
					},
					{
						"name" : this.tr("LigaManager"), 
						"page" :  ligamanager.pages.LigaManagerPage,
						"userGroups" : ["LIGA_ADMIN", "ADMIN"],
						"children" : [
							{
								"name" : this.tr("User"), 
								"page" :  ligamanager.pages.UserManagerPage,
								"userGroups" : ["ADMIN"]
							},
							{
								"name" : this.tr("Documents"), 
								"page" :  ligamanager.pages.DocumentsManagerPage,
								"userGroups" : ["ADMIN"]
							},
							{
								"name" : this.tr("Settings"), 
								"page" :  ligamanager.pages.SettingsPage,
								"userGroups" : ["ADMIN"]
							},
							{
								"name" : this.tr("MasterData"), 
								"page" :  ligamanager.pages.LigaMasterDataPage,
								"userGroups" : ["LIGA_ADMIN", "ADMIN"]
							},
							{
								"name" : this.tr("Saison"), 
								"page" :  ligamanager.pages.SaisonManagerPage,
								"userGroups" : ["LIGA_ADMIN", "ADMIN"]
							},
							{
								"name" : this.tr("Matches"), 
								"page" :  ligamanager.pages.MatchesPage,
								"userGroups" : ["LIGA_ADMIN", "ADMIN"]
							}
						]
					}]
				}];
	
			var inMenu = this.__navi.createMenu(inMenuDef);
			sidebar.add(inMenu);
		},
		
		__updateSideBar : function() {

			this.__userMenuContainer.removeAll();
			if (this.__prevUser != null) {
				this.__userMenuContainer.add(this.__inBar);
			} else {
				this.__userMenuContainer.add(this.__outBar);
			}
			
			this.__updateInBar();
		},
		
		__onUserChanged : function() {
			var core = ligamanager.Core.getInstance();
			var user = core.getUser();
			
			if ((this.__prevUser == null && user != null)
				|| (this.__prevUser != null && user == null)
				|| (this.__prevUser != null && user != null && this.__prevUser.id != user.id)) {
				this.__prevUser = user;
				this.__updateSideBar();
			}
		}

	}
});
