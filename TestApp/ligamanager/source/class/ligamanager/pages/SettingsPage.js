
/*
#asset(qx/icon/${qx.icontheme}/22/actions/document-save.png)
*/

qx.Class.define("ligamanager.pages.SettingsPage",
{
	extend: qx.ui.container.Scroll,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function(mainWidget) {
		this.base(arguments);
		
		this.__docsRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.Documents");
		this.__coreRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
		this.__mainWidget = mainWidget;
		
		this.__content = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
		this.__content.setPadding(20);
		this.add(this.__content);
		
		

		// create form
		this.__form = new qx.ui.form.Form();


		this.__createMailUi();
		this.__createDesingUi();


		var buttonContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox());
		buttonContainer.setAllowGrowX(false);
		this.__content.add(buttonContainer);

		/* TODO: find a way to change theme dynamically
		// add a reset button
		var resetButton = new qx.ui.form.Button(this.tr("Reset"));
		buttonContainer.add(resetButton);
		resetButton.addListener("execute", this.__onBtReset, this);
		form.addButton(resetButton);

		// add test button
		var btTest = new qx.ui.form.Button(this.tr("Test"));
		btTest.setTabIndex(tabIndex++);
		btTest.addListener("execute", this.__onBtTest, this);
		buttonContainer.add(btTest);
		form.addButton(buttonContainer);
		*/

		// add save button
		var btSend = new qx.ui.form.Button(this.tr("Save"), "icon/22/actions/document-save.png");
		btSend.addListener("execute", this.__onBtSend, this);
		buttonContainer.add(btSend);
		this.__form.addButton(btSend);

		// set data
		var settings = this.__coreRpc.callSync("GetSettings");
		var controller = this.__controller = new qx.data.controller.Form(null, this.__form);
		var model = this.__model= controller.createModel();
		model.set(settings);
		//var model = this.__model = qx.data.marshal.Json.createModel(settings);
		//controller.setModel(model);
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
		__coreRpc : null,
		__docsRpc : null,
		
		__content : null,
		__mainWidget : null,
		
		__form : null,
		__controller : null,
		__model : null,
		
		__createMailUi : function() {
			var form = this.__form;
		
			var suffix = " :";
			var requireSuffix = " * :";
			
			var laDesign = new qx.ui.basic.Label(this.tr("Mail"));
			laDesign.setAppearance("label-sep");
			this.__content.add(laDesign);
			
			var gridLayout = new qx.ui.layout.Grid();
			gridLayout.setColumnAlign(0, "right", "middle");
			gridLayout.setColumnAlign(1, "left", "middle");
			gridLayout.setSpacingX(5);
			gridLayout.setSpacingY(5);
			gridLayout.setColumnWidth(1, 50); 
			gridLayout.setColumnWidth(2, 150);

			var groupbox = new qx.ui.container.Composite();
			groupbox.setLayout(gridLayout);
			this.__content.add(groupbox);
			
			
			var rowIndex = 0;
			var tabIndex = 1;
			
			
			// create cbSendMails
			var laSendMails = new qx.ui.basic.Label(this.tr("Send new guestbook entries") + requireSuffix);
			groupbox.add(laSendMails, {row : rowIndex, column: 0});
			
			var cbSendMails = new qx.ui.form.CheckBox("");
			cbSendMails.setTabIndex(tabIndex++);
			groupbox.add(cbSendMails, {row : rowIndex, column : 1});
			form.add(cbSendMails, "", null, "mail_guestbook");
			rowIndex++;
			
			// create cbSendMails
			var laSendMails = new qx.ui.basic.Label(this.tr("Active") + requireSuffix);
			groupbox.add(laSendMails, {row : rowIndex, column: 0});
			
			var cbSendMails = new qx.ui.form.CheckBox("");
			cbSendMails.setTabIndex(tabIndex++);
			groupbox.add(cbSendMails, {row : rowIndex, column : 1});
			form.add(cbSendMails, "", null, "mail_sendMails");
			rowIndex++;
			
			
			// create from
			var laFrom = new qx.ui.basic.Label(this.tr("From") + requireSuffix);
			groupbox.add(laFrom, {row : rowIndex, column: 0});
			
			var tbFrom = new qx.ui.form.TextField();
			tbFrom.setTabIndex(tabIndex++);
			groupbox.add(tbFrom, {row : rowIndex, column : 1, colSpan : 3});
			form.add(tbFrom, "", qx.util.Validate.email(), "mail_from");
			rowIndex++;
			
		},
		
		
		__createDesingUi : function() {
			var form = this.__form;
		
			var laDesign = new qx.ui.basic.Label(this.tr("Design"));
			laDesign.setAppearance("label-sep");
			this.__content.add(laDesign);
			
			
			var tabIndex = 10;

			var gridLayout = new qx.ui.layout.Grid();
			gridLayout.setColumnAlign(0, "right", "middle");
			gridLayout.setColumnAlign(1, "left", "middle");
			gridLayout.setColumnAlign(2, "left", "middle");
			gridLayout.setColumnAlign(3, "left", "middle");
			gridLayout.setSpacingX(5);
			gridLayout.setSpacingY(5);
			gridLayout.setColumnWidth(1, 50); 
			gridLayout.setColumnWidth(2, 80);
			gridLayout.setColumnWidth(3, 30);

			var groupbox = new qx.ui.container.Composite();
			groupbox.setLayout(gridLayout);
			this.__content.add(groupbox);

			var suffix = " :";
			var requireSuffix = " * :";
			var rowIndex = 0;
			
			// create labels
			var laSalutation = new qx.ui.basic.Label(this.tr("Title") + requireSuffix);
			groupbox.add(laSalutation, {row : rowIndex, column: 0});
			rowIndex++;
			
			var laFirstName = new qx.ui.basic.Label(this.tr("Image") + requireSuffix);
			groupbox.add(laFirstName, {row : rowIndex, column: 0});
			rowIndex++;
			
			var laLastName = new qx.ui.basic.Label(this.tr("TitleBackColor") + requireSuffix);
			groupbox.add(laLastName, {row : rowIndex, column: 0});
			rowIndex++;
			
			
			var la2 = new qx.ui.basic.Label(this.tr("TitleFrontColor") + requireSuffix);
			groupbox.add(la2, {row : rowIndex, column: 0});
			rowIndex++;
			
			
			var la3 = new qx.ui.basic.Label(this.tr("NavBackColor") + requireSuffix);
			groupbox.add(la3, {row : rowIndex, column: 0});
			rowIndex++;
			
			
			var la4 = new qx.ui.basic.Label(this.tr("NavFrontColor") + requireSuffix);
			groupbox.add(la4, {row : rowIndex, column: 0});
			rowIndex++;
			
			
			var la5 = new qx.ui.basic.Label(this.tr("HighlightColor") + requireSuffix);
			groupbox.add(la5, {row : rowIndex, column: 0});
			rowIndex++;
			
			
			rowIndex = 0;
			
			// create textfields
			var btChooseColor;
			
			var tbTitle = new qx.ui.form.TextField();
			tbTitle.setRequired(true);
			tbTitle.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("Title")));
			tbTitle.setTabIndex(tabIndex++);
			groupbox.add(tbTitle, {row : rowIndex, column : 1, colSpan : 3});
			form.add(tbTitle, "", null, "design_Title");
			rowIndex++;
			
			
			
			
			var cbImage = new qx.ui.form.ComboBox();
			var files = this.__docsRpc.callSync("GetFiles");
			for (var i = 0; i < files.length; i++) {
				cbImage.add(new qx.ui.form.ListItem(files[i]));
			}
			cbImage.setRequired(true);
			cbImage.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("Image")));
			cbImage.setTabIndex(tabIndex++);
			groupbox.add(cbImage, {row : rowIndex, column : 1, colSpan : 3});
			form.add(cbImage, "", null, "design_Image");
			rowIndex++;
			
			this.__addColorChooser(groupbox, rowIndex++, "TitleBackColor", this.tr("TitleBackColor"));
			this.__addColorChooser(groupbox, rowIndex++, "TitleFrontColor", this.tr("TitleFrontColor"));
			this.__addColorChooser(groupbox, rowIndex++, "NavBackColor", this.tr("NavBackColor"));
			this.__addColorChooser(groupbox, rowIndex++, "NavFrontColor", this.tr("NavFrontColor"));
			this.__addColorChooser(groupbox, rowIndex++, "HighlightColor", this.tr("HighlightColor"));
			
			
			
			
		},
		
		__addColorChooser : function(container, rowIndex, name, label) {
		
			var textfield = new qx.ui.form.TextField();
			textfield.setRequired(true);
			textfield.setRequiredInvalidMessage(this.tr("The field %1 is required.", name));
			//textfield.setTabIndex(rowIndex++);
			container.add(textfield, {row : rowIndex, column : 1, colSpan : 2});
			this.__form.add(textfield, "", null, "design_" + name);
			
			var btChooseColor = new qx.ui.form.Button("...");
			btChooseColor.setBackgroundColor(textfield.getValue());
			btChooseColor.setUserData("textbox", textfield);
			btChooseColor.addListener("execute", this.__chooseColor, this)
			container.add(btChooseColor, {row : rowIndex, column : 3});
		},
		
		
		__chooseColor : function(evt) {
			var target = evt.getTarget();
			var textbox = target.getUserData("textbox");
			
			var mypop = new qx.ui.control.ColorPopup();
			mypop.exclude();
			
			mypop.setValue(textbox.getValue());
			mypop.placeToWidget(textbox);
			mypop.show();
			
			mypop.addListener("changeValue", function(e) {
				textbox.setValue(e.getData());
			}, this);
		},
		__onBtReset : function(evt) {
			this.__mainWidget.loadDesign();
			var design = this.__mainWidget.getDesign();
			this.__mainWidget.setDesign(design);
			this.__model.set(design);
		},
		
		__onBtTest : function(evt) {
			if (this.__form.validate()) {
				var design = qx.util.Serializer.toNativeObject(this.__model);
				this.__mainWidget.setDesign(design);
			} else {
				alert(this.__form.getValidationManager().getInvalidMessages().join("\n"));
			}
		},
		
		__onBtSend : function(evt) {
			if (this.__form.validate()) {
				
				try {
					var settings = qx.util.Serializer.toNativeObject(this.__model);
					//this.__mainWidget.setDesign(design);
					
					this.__coreRpc.callSync("SetSettings", settings);
					alert(this.tr("The settings were succesfully stored."));
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
