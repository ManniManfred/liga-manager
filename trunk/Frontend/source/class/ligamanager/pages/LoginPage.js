
/*
#asset(ligamanager/fussball_gras.png) 
#asset(ligamanager/waitcursor.gif)
#asset(ligamanager/22/warn.png)
#asset(ligamanager/22/info.png)
*/

qx.Class.define("ligamanager.pages.LoginPage",
{
	extend: qx.ui.container.Composite,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments, new qx.ui.layout.Canvas());
		
		var appName = this.tr("Hobbyliga")
		var tabIndex = 1;
		
		var gbLogin = new qx.ui.groupbox.GroupBox();        
		gbLogin.setWidth(250);
		gbLogin.setHeight(120);
		
		this.add(gbLogin, {"left" : 50, "top" : 20});
		
		gbLogin.setLayout(new qx.ui.layout.Dock());

		gbLogin.setContentPadding(16);

		// create image for log
		var logo = new qx.ui.basic.Image("ligamanager/fussball_gras.png");
		gbLogin.add(logo, { edge: "west" });

		// create content pane
		var layout = new qx.ui.layout.Grid(9, 5);       
		layout.setColumnAlign(0, "right", "middle");
		layout.setColumnWidth(1, 140);
		layout.setColumnWidth(2, 40);
	  

		var contentPane = new qx.ui.container.Composite(layout);
		gbLogin.add(contentPane, { edge: "center" });

		var statusAtom = this.__statusAtom = new qx.ui.basic.Atom("<b>" + this.tr("Welcome to")+ " " + appName + "</b>");
		statusAtom.setRich(true);
		statusAtom.setHeight(32);

		contentPane.add(statusAtom,
		{
			row: 0,
			column: 0,
			colSpan: 3
		});

		var suffix = " :";
		
		// name label
		var nameLabel = new qx.ui.basic.Label(this.tr("Name") + suffix);
		contentPane.add(nameLabel,
		{
			row: 1,
			column: 0
		});

		// name textbox
		this.__userField = new qx.ui.form.TextField();
		this.__userField.setTabIndex(tabIndex++);
		contentPane.add(this.__userField,
		{
			row: 1,
			column: 1
		});

		// password label
		var passwordLabel = new qx.ui.basic.Label(this.tr("Password") + suffix);
		contentPane.add(passwordLabel,
		{
			row: 2,
			column: 0
		});

		// password textbox
		this.__passwordField = new qx.ui.form.PasswordField();
		this.__passwordField.setTabIndex(tabIndex++);
		contentPane.add(this.__passwordField,
		{
			row: 2,
			column: 1
		});


		// login button
		var btLogin = this.__okButton = new qx.ui.form.Button(this.tr("Anmelden"));
		this.__okButton.setTabIndex(tabIndex++);
		btLogin.addListener("execute", this.__login, this);
		
		contentPane.add(btLogin,
		{
		   row: 4,
		   column: 1
		});


		gbLogin.addListener("keypress", this.__onEnter, this);
		
		
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
		/**
		 * Fired when the user logged in successefully.
		 */
		"successfulLogin" : "qx.event.type.Event",
		
		/**
		 * Fire if the user clicks on register.
		 */
		"showRegister" : "qx.event.type.Event"
	},

	/*
	* ****************************************************************************
	* MEMBERS
	* ****************************************************************************
	*/

	members:
	{
		__userField: null,
		__passwordField: null,
		__statusAtom: null,
		
		__onEnter: function(e) {

			if (e.getKeyIdentifier() == "Enter") {
				this.__login();
			}

		},
		
		/**
		* Sign in with the specified user and password.
		*
		* @return {void} 
		*/
		__login: function() {
			var username = this.__userField.getValue();
			var password = this.__passwordField.getValue();
			var core = ligamanager.Core.getInstance();

			// TODO: check username and password are empty
			this.__statusAtom.setLabel(this.tr("Login ..."));
			this.__statusAtom.setIcon("ligamanager/waitcursor.gif");

			var self = this;

			var onGInfoLogin = function(result, ex) {
				if (ex == null) {
					if (result.result == true) {
						// Fire event to the outside
						self.fireDataEvent("successfulLogin");
					}
					else {
						self.__statusAtom.setLabel(self.tr("Login failed: %1", result.message));
						self.__statusAtom.setIcon("ligamanager/22/info.png");
					}
				}
				else {
					self.__statusAtom.setLabel(self.tr("Connection error"));
					self.__statusAtom.setIcon("ligamanager/22/warn.png");
				}
			};

			core.loginAsync(onGInfoLogin, username, password);
		},

		/**
		* Open the register window.
		*
		* @return {void} 
		*/
		__register: function() {
			this.fireEvent("showRegister");
		}
		
	}
});
