
/**
 * This class represents the main widget that is shown for this
 * application.
 */
qx.Class.define("ligamanager.MainWidget",
{
	extend: qx.ui.container.Composite,

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

		if (core.IsCorrectlyLoggedIn()) {
			this.__isLoggedIn = true;
		} else {
			this.__isLoggedIn = false;
		}

		
		// load design
		this.loadDesign();
		this.setDesign(this.__design);
		
		
		// create ui
		var layout = new qx.ui.layout.Dock();
		this.setLayout(layout);
		
		var header = this.__createHeader();
		this.add(header, {
			edge : "north"
		});
		
		
		this.__inBar = this.__createInBar();
		this.__outBar = this.__createOutBar();
		
		var sideBar = this.__createSideBar();
		this.add(sideBar, {
			edge : "west"
		});
		
		var contentContainer = this.__contentContainer = new qx.ui.container.Composite(new qx.ui.layout.Grow());
		this.add(contentContainer, {
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
		__isLoggedIn : null,
		
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
				"name" : this.tr("Locks"), 
				"page" :  ligamanager.pages.PlayerLockPage
			},
			{
				"name" : this.tr("Contact"), 
				"page" :  ligamanager.pages.ContactPage
			},
			{
				"name" : this.tr("Guestbook"), 
				"page" :  ligamanager.pages.Guestbook
			}];

			var sidebar = this.__navi.createMenu(menuDef);

			//
			// Add Documents
			//
			var docs = this.__coreRpc.callSync("GetEntities", "document");
			
			if (docs != null && docs.length > 0) {
			
				sidebar.add(new qx.ui.core.Spacer(this.__blockSpace, this.__blockSpace));
				
				var btDocuments = this.__btDocuments = new qx.ui.form.Button(this.tr("Documents"), null);
				btDocuments.setAppearance("sidebar/button");
				//btDocuments.addListener("execute", this.__onBtExecuted, this);
				//btDocuments.addListener("execute", this.__onBtShowEmptyPage, this);
				sidebar.add(btDocuments);
				
				
				var documentsContainer = this.__documentsContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
					spacing : this.__innerSpace
				}));
				documentsContainer.setPaddingLeft(20);
				sidebar.add(documentsContainer);
				
				
				for (var i = 0, l = docs.length; i < l; i++) {
				
					var btDoc = new qx.ui.form.Button(docs[i].name, null);
					btDoc.setAppearance("sidebar/button");
					btDoc.setUserData("parentButton", btDocuments);
					btDoc.setUserData("pdfUrl", ligamanager.Core.DOCUMENT_FOLDER + docs[i].filename);
					//btDoc.addListener("execute", this.__onBtExecuted, this);
					//btDoc.addListener("execute", this.__onShowDocument, this);
					documentsContainer.add(btDoc);
				}
			}
			
			sidebar.add(new qx.ui.core.Spacer(20, 20));
			
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
			
			var btLogout = new qx.ui.form.Button(this.tr("Logout"), null);
			btLogout.setAppearance("sidebar/button");
			//btLogout.addListener("execute", this.__onBtExecuted, this);
			//btLogout.addListener("execute", this.__onBtLogout, this);
			sidebar.add(btLogout);
			
			
			//
			// Verwaltung
			//
			
			var inMenuDef = [
				{
				"name" : this.tr("Manager"), 
				"page" :  ligamanager.pages.EmptyPage,
				"children" : [
					{
						"name" : this.tr("User Settings"), 
						"page" :  ligamanager.pages.UserSettingsPage,
						"userGroups" : ["USER", "TEAM_ADMIN", "LIGA_AMIN", "ADMIN"]
					},
					{
						"name" : this.tr("Matches"), 
						"page" :  ligamanager.pages.ManageMatchesPage,
						"userGroups" : ["TEAM_ADMIN", "LIGA_AMIN", "ADMIN"]
					},
					{
						"name" : this.tr("LigaManager"), 
						"page" :  ligamanager.pages.LigaManagerPage,
						"userGroups" : ["LIGA_AMIN", "ADMIN"],
						"children" : [
							{
								"name" : this.tr("User"), 
								"page" :  ligamanager.pages.UserManagerPage,
								"userGroups" : ["LIGA_AMIN", "ADMIN"]
							},
							{
								"name" : this.tr("Documents"), 
								"page" :  ligamanager.pages.DocumentsManagerPage,
								"userGroups" : ["LIGA_AMIN", "ADMIN"]
							},
							{
								"name" : this.tr("Settings"), 
								"page" :  ligamanager.pages.SettingsPage,
								"userGroups" : ["LIGA_AMIN", "ADMIN"]
							},
							{
								"name" : this.tr("MasterData"), 
								"page" :  ligamanager.pages.LigaMasterDataPage,
								"userGroups" : ["LIGA_AMIN", "ADMIN"]
							},
							{
								"name" : this.tr("Saison"), 
								"page" :  ligamanager.pages.SaisonManagerPage,
								"userGroups" : ["LIGA_AMIN", "ADMIN"]
							},
							{
								"name" : this.tr("Matches"), 
								"page" :  ligamanager.pages.MatchesPage,
								"userGroups" : ["LIGA_AMIN", "ADMIN"]
							}
						]
					}]
				}];
	
			var inMenu = this.__navi.createMenu(inMenuDef);
			sidebar.add(inMenu);
		},
		
		__updateSideBar : function() {
			this.__userMenuContainer.removeAll();
			if (this.__isLoggedIn) {
				this.__userMenuContainer.add(this.__inBar);
			} else {
				this.__userMenuContainer.add(this.__outBar);
			}
			
			this.__updateInBar();
		},
		
		__onSuccessfulLogin : function() {
			this.__isLoggedIn = true;
			
			this.setActivePage(null);
			
			this.__updateSideBar();
		},
		
		
		//
		// button actions
		//
		
		
		__onBtShowEmptyPage : function() {
			this.setActivePage(null);
		},
		
				

		
		
		
		__onShowSite: function (evt) {
			var target = evt.getTarget();
			var site = target.getUserData("site");

			if (!ligamanager.Utils.isInstanceOf(this.getActivePage(), ligamanager.pages.IFramePage)) {
				this.setActivePage(new ligamanager.pages.IFramePage());
			}

			var framePage = this.getActivePage();
			framePage.setSource("/sites/" + site + "/");
		},


		__onShowDocument : function(evt) {
		
			var target = evt.getTarget();
			var pdfUrl = target.getUserData("pdfUrl");
			
			if (!ligamanager.Utils.isInstanceOf(this.getActivePage(), ligamanager.pages.IFramePage)) {
				this.setActivePage(new ligamanager.pages.IFramePage());
			}
			
			var framePage = this.getActivePage();
			framePage.setSource(pdfUrl);
			
		},
		
		
		
		/**
		 * TODOC
		 *
		 * @return {void} 
		 */
		__onBtLogout: function() {
			var core = ligamanager.Core.getInstance();
			core.logout();

			this.__isLoggedIn = false;
			this.__updateSideBar();
			this.setActivePage(null);
		}

		
		

	}
});
