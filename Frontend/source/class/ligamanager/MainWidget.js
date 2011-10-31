
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

		
		
		// create ui
		var layout = new qx.ui.layout.Dock();
		this.setLayout(layout);
		
		var header = this.__createHeader();
		this.add(header, {edge : "north"});
		
		
		this.__inBar = this.__createInBar();
		this.__outBar = this.__createOutBar();
		
		var sideBar = this.__createSideBar();
		this.add(sideBar, {edge : "west"});
		
		var contentContainer = this.__contentContainer = new qx.ui.container.Composite(new qx.ui.layout.Grow());
		this.add(contentContainer, {edge : "center"});
		
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
			
		
			var title = new qx.ui.basic.Atom("Hobbyliga", "ligamanager/fussball_gras.png");
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
				
				
				var documentsContainer = this.__documentsContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({spacing : this.__innerSpace}));
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
			
			var userRights = this.__isLoggedIn && this.__coreRpc.callSync("GetUserRights");

			if (userRights == "USER") {
				// nothing: keine besonderen Berechtigungen..
			}
			
			else if( userRights == "ADMIN_TEAM" || userRights == "ADMIN_LIGA" || userRights == "ADMIN" ) {
				
				sidebar.add(new qx.ui.core.Spacer(this.__blockSpace, this.__blockSpace));
				
				var btManager = new qx.ui.form.Button(this.tr("Manager"), null);
				btManager.setAppearance("sidebar/button");
				btManager.setUserData("page", ligamanager.pages.ManagerPage);
				btManager.addListener("execute", this.__onBtExecuted, this);
				btManager.addListener("execute", this.__onShowPage, this);
				sidebar.add(btManager);
			
				
				var managerContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({spacing : this.__innerSpace}));
				managerContainer.setPaddingLeft(20);
				sidebar.add(managerContainer);
				
				var btUserManager = new qx.ui.form.Button(this.tr("User"), null);
				btUserManager.setAppearance("sidebar/button");
				btUserManager.setUserData("page", ligamanager.pages.UserManagerPage);
				btUserManager.addListener("execute", this.__onBtExecuted, this);
				btUserManager.addListener("execute", this.__onShowPage, this);
				managerContainer.add(btUserManager);
				
				
				var btDocumentsManager = new qx.ui.form.Button(this.tr("Documents"), null);
				btDocumentsManager.setAppearance("sidebar/button");
				btDocumentsManager.setUserData("page", ligamanager.pages.DocumentsManagerPage);
				btDocumentsManager.addListener("execute", this.__onBtExecuted, this);
				btDocumentsManager.addListener("execute", this.__onShowPage, this);
				managerContainer.add(btDocumentsManager);
			}

			if( userRights == "ADMIN_LIGA" || userRights == "ADMIN" ) {
				// addittional: liga manager
				var btLiga = new qx.ui.form.Button(this.tr("Liga"), null);
				btLiga.setAppearance("sidebar/button");
				btLiga.setUserData("page", ligamanager.pages.LigaManagerPage);
				btLiga.addListener("execute", this.__onBtExecuted, this);
				btLiga.addListener("execute", this.__onShowPage, this);
				managerContainer.add(btLiga);
			
			}
			
			if( userRights == "ADMIN" ) {
				// to be defined
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
			if (parentButton != undefined && parentButton != null) {
				parentButton.addState("isIn");
				this.__inButtons.push(parentButton);
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
				this.setActivePage(new pageClass());
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
