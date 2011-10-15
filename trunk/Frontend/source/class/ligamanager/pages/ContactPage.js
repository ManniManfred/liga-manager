 
qx.Class.define("ligamanager.pages.ContactPage",
{
	extend: qx.ui.container.Composite,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments);
		
		this.__planInfoRpc = new qx.io.remote.Rpc("/ginfo", "PlanInfo");
		
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
		__planInfoRpc : null,
		__model : null,
		__form : null,
		
		
		__createUi : function() {
			
			var layout = new qx.ui.layout.Canvas();
			//var layout = new qx.ui.layout.Flow();
			this.setLayout(layout);
		
			/*
			var formDto = this.__planInfoRpc.callSync("GetContactForm");
			var form = ligamanager.base.ConvertObjectUtils.FromJson(formDto);
			
			var formWrapper = ligamanager.formdesigner.FormularWrapper.loadFromXml(null, form);
			this.add(formWrapper);
			
			*/
			
			//var manager = this.__manager = new qx.ui.form.validation.Manager();
			//manager.setRequiredFieldMessage("Das Feld darf nicht leer sein.");
			
			// create the model
			var model = this.__model = qx.data.marshal.Json.createModel({FirstName: "", LastName: ""});
			//var controller = new qx.data.controller.Object(model);


			var form = this.__form = new qx.ui.form.Form();
			

			var tabIndex = 1;

			var gridLayout = new qx.ui.layout.Grid();
			gridLayout.setColumnAlign(0, "right", "middle");
			gridLayout.setSpacingX(5);
			gridLayout.setSpacingY(5);
			gridLayout.setColumnWidth(1, 50); 
			gridLayout.setColumnWidth(2, 80);
			gridLayout.setColumnWidth(3, 50);

			var groupbox = new qx.ui.groupbox.GroupBox(this.tr("Contact"));
			groupbox.setLayout(gridLayout);
			this.add(groupbox, {left: 20, top:20});

			var suffix = " :";
			var requireSuffix = " * :";
			var rowIndex = 0;
			
			// create labels
			var laSalutation = new qx.ui.basic.Label(this.tr("Salutation") + suffix);
			groupbox.add(laSalutation, {row : rowIndex, column: 0});
			rowIndex++;
			
			var laFirstName = new qx.ui.basic.Label(this.tr("First name") + requireSuffix);
			groupbox.add(laFirstName, {row : rowIndex, column: 0});
			rowIndex++;
			
			var laLastName = new qx.ui.basic.Label(this.tr("Last name") + requireSuffix);
			groupbox.add(laLastName, {row : rowIndex, column: 0});
			rowIndex++;
			
			
			var la2 = new qx.ui.basic.Label(this.tr("Company") + suffix);
			groupbox.add(la2, {row : rowIndex, column: 0});
			rowIndex++;
			
			
			var la3 = new qx.ui.basic.Label(this.tr("Street / Number") + suffix);
			groupbox.add(la3, {row : rowIndex, column: 0});
			rowIndex++;
			
			
			var la4 = new qx.ui.basic.Label(this.tr("Postal Code / City") + suffix);
			groupbox.add(la4, {row : rowIndex, column: 0});
			rowIndex++;
			
			
			var la5 = new qx.ui.basic.Label(this.tr("Phone number") + suffix);
			groupbox.add(la5, {row : rowIndex, column: 0});
			rowIndex++;
			
			
			var la6 = new qx.ui.basic.Label(this.tr("Fax") + suffix);
			groupbox.add(la6, {row : rowIndex, column: 0});
			rowIndex++;
			
			
			var laEMail = new qx.ui.basic.Label(this.tr("E-Mail") + requireSuffix);
			groupbox.add(laEMail, {row : rowIndex, column: 0});
			rowIndex++;
			
			
			rowIndex = 0;
			
			// create textfields
			var cbSalutation = new qx.ui.form.ComboBox();
			cbSalutation.add(new qx.ui.form.ListItem(this.tr("Mr.")));
			cbSalutation.add(new qx.ui.form.ListItem(this.tr("Mrs.")));
			cbSalutation.setTabIndex(tabIndex++);
			groupbox.add(cbSalutation, {row : rowIndex, column : 1, colSpan : 3});
			form.add(cbSalutation, "", null, "Salutation");
			rowIndex++;
			
			
			var tbFirstName = new qx.ui.form.TextField();
			tbFirstName.setRequired(true);
			tbFirstName.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("First name")));
			tbFirstName.setTabIndex(tabIndex++);
			groupbox.add(tbFirstName, {row : rowIndex, column : 1, colSpan : 3});
			form.add(tbFirstName, "", null, "FirstName");
			rowIndex++;
			
			var tbLastName = new qx.ui.form.TextField();
			tbLastName.setRequired(true);
			tbLastName.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("Last name")));
			tbLastName.setTabIndex(tabIndex++);
			groupbox.add(tbLastName, {row : rowIndex, column : 1, colSpan : 3});
			form.add(tbLastName, "", null, "LastName");
			rowIndex++;
			
			var tbCompany = new qx.ui.form.TextField();
			tbCompany.setTabIndex(tabIndex++);
			groupbox.add(tbCompany, {row : rowIndex, column : 1, colSpan : 3});
			form.add(tbCompany, "", null, "Company");
			rowIndex++;
			
			var tbStreet = new qx.ui.form.TextField();
			tbStreet.setTabIndex(tabIndex++);
			groupbox.add(tbStreet, {row : rowIndex, column : 1, colSpan : 2});
			form.add(tbStreet, "", null, "Street");
			
			var tbStreetNumber = new qx.ui.form.TextField();
			tbStreetNumber.setTabIndex(tabIndex++);
			groupbox.add(tbStreetNumber, {row : rowIndex, column : 3});
			form.add(tbStreetNumber, "", null, "StreetNumber");
			rowIndex++;
			
			var tbPostalCode = new qx.ui.form.TextField();
			tbPostalCode.setTabIndex(tabIndex++);
			groupbox.add(tbPostalCode, {row : rowIndex, column : 1});
			form.add(tbPostalCode, "", null, "PostalCode");

			
			var tbCity = new qx.ui.form.TextField();
			tbCity.setTabIndex(tabIndex++);
			groupbox.add(tbCity, {row : rowIndex, column : 2, colSpan : 2});
			form.add(tbCity, "", null, "City");
			rowIndex++;
			
			var tbTel = new qx.ui.form.TextField();
			tbTel.setTabIndex(tabIndex++);
			groupbox.add(tbTel, {row : rowIndex, column : 1, colSpan : 3});
			form.add(tbTel, "", null, "Telephone");
			rowIndex++;
			
			
			var tbFax = new qx.ui.form.TextField();
			tbFax.setTabIndex(tabIndex++);
			groupbox.add(tbFax, {row : rowIndex, column : 1, colSpan : 3});
			form.add(tbFax, "", null, "Fax");
			rowIndex++;
			
			
			var tbEMail = new qx.ui.form.TextField();
			tbEMail.setRequired(true);
			tbEMail.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("E-Mail")));
			tbEMail.setTabIndex(tabIndex++);
			groupbox.add(tbEMail, {row : rowIndex, column : 1, colSpan : 3});
			form.add(tbEMail, "", qx.util.Validate.email(), "EMail");
			rowIndex++;
			

			
			var gbMessage = new qx.ui.groupbox.GroupBox(this.tr("Message"));
			gbMessage.setLayout(new qx.ui.layout.Grow());
			gbMessage.set({width : 350, height : 300});
			this.add(gbMessage, {left: 350, top:20});
			
			var taMessage = new qx.ui.form.TextArea();
			taMessage.setRequired(true);
			taMessage.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("Message")));
			taMessage.setTabIndex(tabIndex++);
			gbMessage.add(taMessage);
			form.add(taMessage, "", null, "Message");
			
			var cbSendCopy = new qx.ui.form.CheckBox(this.tr("Send a copy of your mail to your e-mail address."));
			this.add(cbSendCopy, {left: 20, top : 330});
			form.add(cbSendCopy, "", null, "SendCopy");
			
			var btSend = new qx.ui.form.Button(this.tr("Send"));
			btSend.setTabIndex(tabIndex++);
			btSend.addListener("execute", this.__onBtSend, this);
			this.add(btSend, {left : 20, top : 360 });
			form.addButton(btSend);
			
			
			// add a reset button
			var resetButton = new qx.ui.form.Button(this.tr("Reset"));
			this.add(resetButton, {left: 85, top: 360});
			resetButton.addListener("execute", function() {
				form.reset();
			});
			form.addButton(resetButton);

		},
		
		__onBtSend : function(evt) {
			if (this.__form.validate()) {
				var controller = new qx.data.controller.Form(null, this.__form);
				var model = controller.createModel();
				try {
					this.__planInfoRpc.callSync("SendContactRequest", qx.util.Serializer.toNativeObject(model));
					alert(this.tr("The message was succesfully send."));
					this.__form.reset();
				} catch (ex)
				{
					alert("" + this.tr("Sending the messsaged failed. The following error occured: ") + ex);
				}
				
			} else {
				alert(this.__form.getValidationManager().getInvalidMessages().join("\n"));
			}
		}
	}
});
