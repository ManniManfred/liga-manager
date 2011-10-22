
qx.Class.define("ligamanager.pages.RegisterPage",
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

		this.__userRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND, "ligamanager.Usermanager");
		
		this.createUi();
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
		* Fired when the user registered successefully.
		*/
		"successfulRegister": "qx.event.type.Event"
	},


	/*
	* ****************************************************************************
	* MEMBERS
	* ****************************************************************************
	*/

	members:
	{
		__userRpc : null,
		
		__userField : null,
		__passwordField : null,
		__emailField : null,
		__statusAtom : null,
		__appName : null,
		__form : null,
		
		__onEnter: function(e) {

			if (e.getKeyIdentifier() == "Enter") {
				this.__register();
			}

		},

		
		
		createUi : function() {
		
			var tabIndex = 1;
			var form = this.__form = new qx.ui.form.Form();
			
			//
			// user information
			//
		
			var suffix = " :";
			var requireSuffix = " * :";
			
			// create content pane
			var layout = new qx.ui.layout.Grid(9, 5);
			layout.setColumnAlign(0, "right", "middle");
			layout.setSpacingX(5);
			layout.setSpacingY(5);
			layout.setColumnWidth(0, 130);
			layout.setColumnWidth(1, 180);

			var contentPane = new qx.ui.groupbox.GroupBox(this.tr("Register to"));
			contentPane.setLayout(layout);
			
			this.add(contentPane, { left: 20, top: 20 });

			// name label
			var nameLabel = new qx.ui.basic.Label(this.tr("User name") + requireSuffix);
			contentPane.add(nameLabel, { row: 1, column: 0 });

			// name textbox
			this.__userField = new qx.ui.form.TextField();
			this.__userField.setTabIndex(tabIndex++);
			this.__userField.setRequired(true);
			this.__userField.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("Name")));
			contentPane.add(this.__userField, { row: 1, column: 1});
			form.add(this.__userField, "", null, "UserName");
			
			// password label
			var passwordLabel = new qx.ui.basic.Label(this.tr("Password") + requireSuffix);
			contentPane.add(passwordLabel,{row: 2, column: 0 });

			// password textbox
			var passwordField = this.__passwordField = new qx.ui.form.PasswordField();
			passwordField.setTabIndex(tabIndex++);
			passwordField.setRequired(true);
			passwordField.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("Password")));
			contentPane.add(passwordField,{row: 2, column: 1 });
			form.add(passwordField, "", function(value) {
				if (value == null || value.length < 6) {
					throw new qx.core.ValidationError("", qx.locale.Manager.tr("The password must have a length of 6."));
				}
			}, "Password");
		
			// confirm password label
			var confirmPasswordLabel = new qx.ui.basic.Label(this.tr("Confirm password") + requireSuffix);
			contentPane.add(confirmPasswordLabel,{row: 3, column: 0 });

			// confirm password textbox
			this.__confirmPasswordField = new qx.ui.form.PasswordField();
			this.__confirmPasswordField.setTabIndex(tabIndex++);
			contentPane.add(this.__confirmPasswordField,{row: 3, column: 1 });
			form.add(this.__confirmPasswordField, "", function(value) {
				if (value == null || value == "") {
					throw new qx.core.ValidationError("", qx.locale.Manager.tr("The field %1 is required.", 
						qx.locale.Manager.tr("Confirm password")));
				} else if (value != passwordField.getValue()) {
					throw new qx.core.ValidationError("", qx.locale.Manager.tr("Password and confirm password are not equal."));
				}
			}, "ConfirmPassword");
		
			// email label
			var emailLabel = new qx.ui.basic.Label(this.tr("E-Mail") + requireSuffix);
			contentPane.add(emailLabel, { row: 4, column: 0 });

			// email field
			this.__emailField = new qx.ui.form.TextField();
			this.__emailField.setTabIndex(tabIndex++);
			this.__emailField.setRequired(true);
			this.__emailField.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("E-Mail")));
			contentPane.add(this.__emailField, { row: 4, column: 1 });
			form.add(this.__emailField, "", qx.util.Validate.email(), "EMail");
			
		   
			// team label
			var nameLabel = new qx.ui.basic.Label(this.tr("Team") + suffix);
			contentPane.add(nameLabel, { row: 5, column: 0 });

			// team textbox
			this.__teamField = new qx.ui.form.TextField();
			this.__teamField.setTabIndex(tabIndex++);
			contentPane.add(this.__teamField, { row: 5, column: 1});
			//form.add(this.__teamField, "", null, "Team");
			
			
			
			var btSend = new qx.ui.form.Button(this.tr("Send"));
			btSend.addListener("execute", this.__register, this);
			this.add(btSend, {left : 20, top : 210 });
			form.addButton(btSend);
			
			
			// add a reset button
			var resetButton = new qx.ui.form.Button(this.tr("Reset"));
			this.add(resetButton, {left: 85, top: 210});
			resetButton.addListener("execute", function() {
				form.reset();
			});
			form.addButton(resetButton);
			
			
			this.addListener("keypress", this.__onEnter, this);
		},
		
		
		/**
		* register the user
		*
		* @return {void} 
		*/
		__register: function() {
		
			if (this.__form.validate()) {
				var controller = new qx.data.controller.Form(null, this.__form);
				var model = controller.createModel();
				var data = qx.util.Serializer.toNativeObject(model);
				
				try {
					this.__userRpc.callSync("AddUser", data);
					alert(this.tr("You are successfully registered."));
					this.__form.reset();
					
					this.fireDataEvent("successfulRegister");
				} catch (ex)
				{
					alert("" + this.tr("Register failed. The following error occured: ") + ex);
				}
				
			} else {
				alert(this.__form.getValidationManager().getInvalidMessages().join("\n"));
			}
			
		}

	}
});
