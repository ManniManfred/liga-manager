
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
		
	 
		this.setActivePage(null);
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
			apply : "__applyActivePage"
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
		__settings : null,
		__design : null,
		__coreRpc : null,
		__inButtons : null,
		__contentContainer : null,
		__emptyPage : null,
		__isLoggedIn : null,
		
		__userMenuContainer : null,
		
		// contains the side bar for a logged in user
		__inBar : null,
		
		// contains the side bar for all user (a not logged in user)
		__outBar : null,
	
		
		__blockSpace : 15,
		__innerSpace : 5,
		
		//
		// buttons for login, register
		//
		__btLogin : null,
		__btRegister : null,
		
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
		
		__applyActivePage : function(value, oldValue) {
			this.__contentContainer.removeAll();
			
			if (value != null) {
				this.__contentContainer.add(value);
			} else {
				this.__contentContainer.add(this.__emptyPage);
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
			
			var layout = new qx.ui.layout.VBox();
			var sidebar = new qx.ui.container.Composite(layout);
			sidebar.setPadding(0);
			sidebar.setAppearance("sidebar");
			
			var btLogin = this.__btLogin = new qx.ui.form.Button(this.tr("Login"), null);
			btLogin.setAppearance("sidebar/button");
			btLogin.addListener("execute", this.__onBtExecuted, this);
			btLogin.addListener("execute", this.__onBtLogin, this);
			sidebar.add(btLogin);
			
			
			sidebar.add(new qx.ui.core.Spacer(this.__blockSpace, this.__blockSpace));
			
			var btRegister = this.__btRegister = new qx.ui.form.Button(this.tr("Register"), null);
			btRegister.setAppearance("sidebar/button");
			btRegister.addListener("execute", this.__onBtExecuted, this);
			btRegister.addListener("execute", this.__onBtRegister, this);
			sidebar.add(btRegister);
			
			
			return sidebar;
		},
		
		
		__createInBar : function() {
		
			var layout = new qx.ui.layout.VBox();
			layout.setSpacing(this.__innerSpace);
			var sidebar = new qx.ui.container.Composite(layout);
			sidebar.setPadding(0);
			sidebar.setAppearance("sidebar");
			
			return sidebar;
		},
		
		__createSideBar : function() {
			
			var layout = new qx.ui.layout.VBox();
			layout.setSpacing(this.__innerSpace);
			var sidebar = new qx.ui.container.Composite(layout);
			sidebar.setAppearance("sidebar");
			
			
			var btTable = new qx.ui.form.Button(this.tr("Table"), null);
			btTable.setAppearance("sidebar/button");
			btTable.setUserData("page", ligamanager.pages.TablePage);
			btTable.addListener("execute", this.__onBtExecuted, this);
			btTable.addListener("execute", this.__onShowPage, this);
			sidebar.add(btTable);
			
			var btPlayings = new qx.ui.form.Button(this.tr("Playing Schedule"), null);
			btPlayings.setAppearance("sidebar/button");
			btPlayings.setUserData("page", ligamanager.pages.PlayingSchedulePage);
			btPlayings.addListener("execute", this.__onBtExecuted, this);
			btPlayings.addListener("execute", this.__onShowPage, this);
			sidebar.add(btPlayings);
			
			var btContact = new qx.ui.form.Button(this.tr("Contact"), null);
			btContact.setAppearance("sidebar/button");
			btContact.setUserData("page", ligamanager.pages.ContactPage);
			btContact.addListener("execute", this.__onBtExecuted, this);
			btContact.addListener("execute", this.__onShowPage, this);
			sidebar.add(btContact);
			
			var btGuestbook = new qx.ui.form.Button(this.tr("Guestbook"), null);
			btGuestbook.setAppearance("sidebar/button");
			btGuestbook.setUserData("page", ligamanager.pages.Guestbook);
			btGuestbook.addListener("execute", this.__onBtExecuted, this);
			btGuestbook.addListener("execute", this.__onShowPage, this);
			sidebar.add(btGuestbook);
			
			//
			// Documents
			//
			
			var docs = this.__coreRpc.callSync("GetEntities", "document");
			
			if (docs != null && docs.length > 0) {
			
				sidebar.add(new qx.ui.core.Spacer(this.__blockSpace, this.__blockSpace));
				
				var btDocuments = this.__btDocuments = new qx.ui.form.Button(this.tr("Documents"), null);
				btDocuments.setAppearance("sidebar/button");
				btDocuments.addListener("execute", this.__onBtExecuted, this);
				btDocuments.addListener("execute", this.__onBtShowEmptyPage, this);
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
					btDoc.addListener("execute", this.__onBtExecuted, this);
					btDoc.addListener("execute", this.__onShowDocument, this);
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
			btLogout.addListener("execute", this.__onBtExecuted, this);
			btLogout.addListener("execute", this.__onBtLogout, this);
			sidebar.add(btLogout);
			
			
			//
			// Verwaltung
			//
			
			sidebar.add(new qx.ui.core.Spacer(this.__blockSpace, this.__blockSpace));
				
			var btManager = new qx.ui.form.Button(this.tr("Manager"), null);
			btManager.setAppearance("sidebar/button");
			btManager.setUserData("page", ligamanager.pages.EmptyPage);
			btManager.addListener("execute", this.__onBtExecuted, this);
			btManager.addListener("execute", this.__onShowPage, this);
			sidebar.add(btManager);
			
			var managerContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
				spacing : this.__innerSpace
			}));
			managerContainer.setPaddingLeft(20);
			sidebar.add(managerContainer);
			
			var userRights = this.__isLoggedIn && this.__coreRpc.callSync("GetUserRights");

			if (userRights == "USER" || userRights == "TEAM_ADMIN" || 
				userRights == "LIGA_AMIN" || userRights == "ADMIN") {
			
				var btUserSettings = new qx.ui.form.Button(this.tr("User Settings"), null);
				btUserSettings.setAppearance("sidebar/button");
				btUserSettings.setUserData("parentButton", btManager);
				btUserSettings.setUserData("page", ligamanager.pages.UserSettingsPage);
				btUserSettings.addListener("execute", this.__onBtExecuted, this);
				btUserSettings.addListener("execute", this.__onShowPage, this);
				managerContainer.add(btUserSettings);
				
			}
			
			if (userRights == "TEAM_ADMIN" || userRights == "LIGA_AMIN" || userRights == "ADMIN") {
				
				var btMatches = new qx.ui.form.Button(this.tr("Matches"), null);
				btMatches.setAppearance("sidebar/button");
				btMatches.setUserData("parentButton", btManager);
				btMatches.setUserData("page", ligamanager.pages.ManageMatchesPage);
				btMatches.addListener("execute", this.__onBtExecuted, this);
				btMatches.addListener("execute", this.__onShowPage, this);
				managerContainer.add(btMatches);
			}
			
			if (userRights == "LIGA_AMIN" || userRights == "ADMIN") {
				
				//
				// liga manager
				//
				var btLiga = new qx.ui.form.Button(this.tr("LigaManager"), null);
				btLiga.setAppearance("sidebar/button");
				btLiga.setUserData("page", ligamanager.pages.LigaManagerPage);
				btLiga.setUserData("parentButton", btManager);
				btLiga.addListener("execute", this.__onBtExecuted, this);
				btLiga.addListener("execute", this.__onShowPage, this);
				managerContainer.add(btLiga);
			
				var ligaContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
					spacing : this.__innerSpace
				}));
				ligaContainer.setPaddingLeft(20);
				managerContainer.add(ligaContainer);
				
				
				var btUserManager = new qx.ui.form.Button(this.tr("User"), null);
				btUserManager.setAppearance("sidebar/button");
				btUserManager.setUserData("parentButton", btLiga);
				btUserManager.setUserData("page", ligamanager.pages.UserManagerPage);
				btUserManager.addListener("execute", this.__onBtExecuted, this);
				btUserManager.addListener("execute", this.__onShowPage, this);
				ligaContainer.add(btUserManager);
				
				
				var btDocumentsManager = new qx.ui.form.Button(this.tr("Documents"), null);
				btDocumentsManager.setAppearance("sidebar/button");
				btDocumentsManager.setUserData("parentButton", btLiga);
				btDocumentsManager.setUserData("page", ligamanager.pages.DocumentsManagerPage);
				btDocumentsManager.addListener("execute", this.__onBtExecuted, this);
				btDocumentsManager.addListener("execute", this.__onShowPage, this);
				ligaContainer.add(btDocumentsManager);
			
				var btSettingsManager = new qx.ui.form.Button(this.tr("Settings"), null);
				btSettingsManager.setAppearance("sidebar/button");
				btSettingsManager.setUserData("parentButton", btLiga);
				btSettingsManager.setUserData("page", ligamanager.pages.SettingsPage);
				btSettingsManager.addListener("execute", this.__onBtExecuted, this);
				btSettingsManager.addListener("execute", this.__onShowPage, this);
				ligaContainer.add(btSettingsManager);
				
			
				var btMasterDataLiga = new qx.ui.form.Button(this.tr("MasterData"), null);
				btMasterDataLiga.setAppearance("sidebar/button");
				btMasterDataLiga.setUserData("parentButton", btLiga);
				btMasterDataLiga.setUserData("page", ligamanager.pages.LigaMasterDataPage);
				btMasterDataLiga.addListener("execute", this.__onBtExecuted, this);
				btMasterDataLiga.addListener("execute", this.__onShowPage, this);
				ligaContainer.add(btMasterDataLiga);
				
				
				var btSaison = new qx.ui.form.Button(this.tr("Saison"), null);
				btSaison.setAppearance("sidebar/button");
				btSaison.setUserData("parentButton", btLiga);
				btSaison.setUserData("page", ligamanager.pages.SaisonManagerPage);
				btSaison.addListener("execute", this.__onBtExecuted, this);
				btSaison.addListener("execute", this.__onShowPage, this);
				ligaContainer.add(btSaison);
				
			}
			
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
		
		__onBtExecuted : function(evt) {
			this.__markNavigationItem(evt.getTarget());
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
		},
		
		__onBtShowEmptyPage : function() {
			this.setActivePage(null);
		},
		
				
		
		__onBtLogin : function() {
			
			if (!ligamanager.Utils.isInstanceOf(this.getActivePage(), ligamanager.pages.LoginPage)) {
				var loginPage = new ligamanager.pages.LoginPage();
				loginPage.addListener("successfulLogin", this.__onSuccessfulLogin, this);
				loginPage.addListener("showRegister", this.__onShowRegisterPage, this);
				this.setActivePage(loginPage);
			}
		},
		
		__onShowRegisterPage : function() {
			this.__onBtRegister();
			this.__markNavigationItem(this.__btRegister);
		},
		
		__onBtRegister : function() {
			
			if (!ligamanager.Utils.isInstanceOf(this.getActivePage(), ligamanager.pages.RegisterPage)) {
				var registerPage = new ligamanager.pages.RegisterPage();
				registerPage.addListener("successfulRegister", this.__onSuccessfulRegister, this);
				this.setActivePage(registerPage);
			}
		},
		
		__onSuccessfulRegister : function() {
			this.__onBtLogin();
			this.__markNavigationItem(this.__btLogin);
		},

		
		
		
		__onShowPage : function(evt) {
			var target = evt.getTarget();
			var pageClass = target.getUserData("page");
			
			if (!ligamanager.Utils.isInstanceOf(this.getActivePage(), pageClass)) {
				this.setActivePage(new pageClass(this));
			}
		},
		
		__onBtTable : function() {
			if (!ligamanager.Utils.isInstanceOf(this.getActivePage(), ligamanager.pages.TablePage)) {
				this.setActivePage(new ligamanager.pages.TablePage());
			}
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
