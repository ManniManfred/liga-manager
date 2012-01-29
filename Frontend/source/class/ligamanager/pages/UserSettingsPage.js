
qx.Class.define("ligamanager.pages.UserSettingsPage",
{
	extend: qx.ui.container.Scroll,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments);
		
		this.__coreRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
		this.__userRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND, "ligamanager.Usermanager");
		
		this.__content = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
		this.__content.setPadding(20);
		this.add(this.__content);
		
		this.__createUi();
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
		__userRpc : null,
		__coreRpc : null,
		
		__userField : null,
		__firstNameField : null,
		__surNameField : null,
		__emailField : null,
		__passwordField : null,
		__statusAtom : null,
		__appName : null,
		__form : null,
		
		__createUi : function() {
			
			var tabIndex = 1;
			var form = this.__form = new qx.ui.form.Form();
			
			//
			// user information
			//
		
			var laSettings = new qx.ui.basic.Label(this.tr("User Settings"));
			laSettings.setAppearance("label-sep");
			this.__content.add(laSettings);
			
			
			var suffix = " :";
			var requireSuffix = " * :";
			
			// create content pane
			var layout = new qx.ui.layout.Grid(9, 5);
			layout.setColumnAlign(0, "right", "middle");
			layout.setSpacingX(5);
			layout.setSpacingY(5);
			layout.setColumnWidth(0, 130);
			layout.setColumnWidth(1, 180);

			var contentPane = new qx.ui.container.Composite();
			contentPane.setLayout(layout);
			
			this.__content.add(contentPane);

			// name label
			var nameLabel = new qx.ui.basic.Label(this.tr("User name") + requireSuffix);
			contentPane.add(nameLabel, { row: 1, column: 0 });
			// name textbox
			this.__userField = new qx.ui.form.TextField();
			this.__userField.setTabIndex(tabIndex++);
			this.__userField.setRequired(true);
			this.__userField.setEnabled(false);
			this.__userField.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("Name")));
			contentPane.add(this.__userField, { row: 1, column: 1});
			form.add(this.__userField, "", null, "username");
					
			// first name  label
			var firstNameLabel = new qx.ui.basic.Label(this.tr("first name") + requireSuffix);
			contentPane.add(firstNameLabel, { row: 2, column: 0 });
			// first name field
			this.__firstNameField = new qx.ui.form.TextField();
			this.__firstNameField.setTabIndex(tabIndex++);
			this.__firstNameField.setRequired(true);
			this.__firstNameField.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("first name")));
			contentPane.add(this.__firstNameField, { row: 2, column: 1 });
			form.add(this.__firstNameField, "", null, "firstname");

			// surname  label
			var surnameLabel = new qx.ui.basic.Label(this.tr("surname") + requireSuffix);
			contentPane.add(surnameLabel, { row: 3, column: 0 });
			// surname field
			this.__surnameField = new qx.ui.form.TextField();
			this.__surnameField.setTabIndex(tabIndex++);
			this.__surnameField.setRequired(true);
			this.__surnameField.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("surname")));
			contentPane.add(this.__surnameField, { row: 3, column: 1 });
			form.add(this.__surnameField, "", null, "lastname");
			
			// email label
			var emailLabel = new qx.ui.basic.Label(this.tr("E-Mail") + requireSuffix);
			contentPane.add(emailLabel, { row: 4, column: 0 });
			// email field
			this.__emailField = new qx.ui.form.TextField();
			this.__emailField.setTabIndex(tabIndex++);
			this.__emailField.setRequired(true);
			this.__emailField.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("E-Mail")));
			contentPane.add(this.__emailField, { row: 4, column: 1 });
			form.add(this.__emailField, "", qx.util.Validate.email(), "email");
			
		   
			// team
			var nameLabel = new qx.ui.basic.Label(this.tr("Team") + suffix);
			contentPane.add(nameLabel, { row: 5, column: 0 });
			
			// team select box
			this.__teamField = new qx.ui.form.SelectBox();
			this.__teamField.setEnabled(false);
			this.__teamField.setTabIndex(tabIndex++);
			contentPane.add(this.__teamField, { row: 5, column: 1});
			form.add(this.__teamField, "", null, "id_team");
			
			this.__teamField.add(new qx.ui.form.ListItem("-- Keine --", null, null));
			
			// add teams to select list
			var teams = this.__coreRpc.callSync("GetEntities", "team");
			if (teams != null) {
				for (var i = 0, l = teams.length; i < l; i++) {
					this.__teamField.add(new qx.ui.form.ListItem(teams[i].name, null, teams[i].id));
				}
			}
			
			// password label
			var passwordLabel = new qx.ui.basic.Label(this.tr("Password") + requireSuffix);
			contentPane.add(passwordLabel,{row: 6, column: 0 });
			// password textbox
			var passwordField = this.__passwordField = new qx.ui.form.PasswordField();
			passwordField.setTabIndex(tabIndex++);
			passwordField.setRequired(true);
			passwordField.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("Password")));
			contentPane.add(passwordField,{row: 6, column: 1 });
			form.add(passwordField, "", function(value) {
				if (value == null || value.length < 6) {
					throw new qx.core.ValidationError("", qx.locale.Manager.tr("The password must have a length of 6."));
				}
			}, "password");
		
			// confirm password label
			var confirmPasswordLabel = new qx.ui.basic.Label(this.tr("Confirm password") + requireSuffix);
			contentPane.add(confirmPasswordLabel,{row: 7, column: 0 });
			// confirm password textbox
			this.__confirmPasswordField = new qx.ui.form.PasswordField();
			this.__confirmPasswordField.setTabIndex(tabIndex++);
			contentPane.add(this.__confirmPasswordField,{row: 7, column: 1 });
			form.add(this.__confirmPasswordField, "", function(value) {
				if (value == null || value == "") {
					throw new qx.core.ValidationError("", qx.locale.Manager.tr("The field %1 is required.", 
						qx.locale.Manager.tr("Confirm password")));
				} else if (value != passwordField.getValue()) {
					throw new qx.core.ValidationError("", qx.locale.Manager.tr("Password and confirm password are not equal."));
				}
			}, "confirmPassword");

			var hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			this.__content.add(hBox);
			
			var btSend = new qx.ui.form.Button(this.tr("Send"));
			btSend.addListener("execute", this.__onSave, this);
			hBox.add(btSend);
			form.addButton(btSend);
			
			
			// add a reset button
			var resetButton = new qx.ui.form.Button(this.tr("Reset"));
			hBox.add(resetButton);
			resetButton.addListener("execute", function() {
				form.reset();
			});
			form.addButton(resetButton);
			
			
			var user = this.__coreRpc.callSync("GetSelf");
			this.__userModel = qx.data.marshal.Json.createModel(user);
			
			var controller = this.__qxController = new qx.data.controller.Form(this.__userModel, form);
			
			this.addListener("keypress", this.__onEnter, this);
		},
		
		__onEnter: function(e) {

			if (e.getKeyIdentifier() == "Enter") {
				this.__onSave();
			}

		},
		
		__onSave : function() {
			
			if (this.__form.validate()) {
				var data = qx.util.Serializer.toNativeObject(this.__userModel);
				
				try {
					this.__userRpc.callSync("UpdateUser", data);
					alert(this.tr("Your settings are stored."));
					
				} catch (ex)
				{
					alert("" + this.tr("Something goes wrong: ") + ex);
				}
				
			} else {
				alert(this.__form.getValidationManager().getInvalidMessages().join("\n"));
			}
		}
	}
});
