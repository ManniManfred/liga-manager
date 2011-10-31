 
qx.Class.define("ligamanager.pages.Guestbook",
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
		
		this.__guestRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND, "ligamanager.guestbook");
		
		
		var props = qx.lang.Object.clone(qx.theme.modern.Font.fonts.bold);
		props.size = 22;
		this.__headerFont = qx.bom.Font.fromConfig(props);
		
		this.__content = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
		this.__content.setPadding(20);
		this.add(this.__content);
				
		this.__createEntryInput();
		this.__createEntries();
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
		__guestRpc : null,
		__model : null,
		__form : null,
		__headerFont : null,
		__content : null,
		__paGbContent : null,
		
		__createEntryInput : function() {
			
		
			var laTeams = new qx.ui.basic.Label(this.tr("New Entry"));
			laTeams.setAppearance("label-sep");
			this.__content.add(laTeams);
			
			
			var paCreateEntry = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
			this.__content.add(paCreateEntry);
			
			// create the model
			
			var model = this.__model = qx.data.marshal.Json.createModel({Name: ""});


			var form = this.__form = new qx.ui.form.Form();
			

			var tabIndex = 1;

			var gridLayout = new qx.ui.layout.Grid();
			gridLayout.setColumnAlign(0, "right", "middle");
			gridLayout.setSpacingX(5);
			gridLayout.setSpacingY(5);
			gridLayout.setColumnWidth(1, 50); 
			gridLayout.setColumnWidth(2, 80);
			gridLayout.setColumnWidth(3, 50);

			
			var groupbox = new qx.ui.container.Composite(gridLayout);
			paCreateEntry.add(groupbox, {left: 0, top:0});

			var suffix = " :";
			var requireSuffix = " * :";
			var rowIndex = 0;
			
			// create labels
			var laFirstName = new qx.ui.basic.Label(this.tr("Name") + requireSuffix);
			groupbox.add(laFirstName, {row : rowIndex, column: 0});
			rowIndex++;
			
			
			var laEMail = new qx.ui.basic.Label(this.tr("E-Mail") + suffix);
			groupbox.add(laEMail, {row : rowIndex, column: 0});
			rowIndex++;
			
			var laMessage = new qx.ui.basic.Label(this.tr("Message") + requireSuffix);
			groupbox.add(laMessage, {row : rowIndex, column: 0});
			rowIndex++;
			
			rowIndex = 0;
			
			// create textfields
			
			var tbFirstName = new qx.ui.form.TextField();
			tbFirstName.setRequired(true);
			tbFirstName.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("Name")));
			tbFirstName.setTabIndex(tabIndex++);
			groupbox.add(tbFirstName, {row : rowIndex, column : 1, colSpan : 3});
			form.add(tbFirstName, "", null, "name");
			rowIndex++;
			
			
			var tbEMail = new qx.ui.form.TextField();
			//tbEMail.setRequired(false);
			//tbEMail.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("E-Mail")));
			tbEMail.setTabIndex(tabIndex++);
			groupbox.add(tbEMail, {row : rowIndex, column : 1, colSpan : 3});
			form.add(tbEMail, "", function(value) { return value == null || value == "" || qx.util.Validate.checkEmail(value, null, null); }, "email");
			rowIndex++;
			
			var taMessage = new qx.ui.form.TextArea();
			taMessage.setRequired(true);
			taMessage.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("Message")));
			taMessage.setTabIndex(tabIndex++);
			groupbox.add(taMessage, {row : rowIndex, column : 1, colSpan : 3});
			form.add(taMessage, "", null, "message");
			rowIndex++;
			
			
			
			var btSend = new qx.ui.form.Button(this.tr("Send"));
			btSend.setTabIndex(tabIndex++);
			btSend.addListener("execute", this.__onBtSend, this);
			paCreateEntry.add(btSend, {left : 0, top : 190 });
			form.addButton(btSend);
			
			
			// add a reset button
			var resetButton = new qx.ui.form.Button(this.tr("Reset"));
			paCreateEntry.add(resetButton, {left: 65, top: 190});
			resetButton.addListener("execute", function() {
				form.reset();
			});
			form.addButton(resetButton);

			
		},
		
		
		__createEntries : function() {
		
			var laGuestbook = new qx.ui.basic.Label(this.tr("Guestbook"));
			laGuestbook.setAppearance("label-sep");
			this.__content.add(laGuestbook);
			
			var paContent = this.__paGbContent = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
			this.__content.add(paContent);
			
			var entries = this.__guestRpc.callSync("GetEntries");
			if (entries != null) {
				for (var i = 0; i < entries.length; i++) {
					this.__addItem(entries[i]);
				}
			}
		},
		
		
		__addItem : function(entry) {
		
			var count = this.__paGbContent.getChildren().length;
			
			var paItem = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
			paItem.setPadding(10);
			
			if (count % 2 === 0) {
				paItem.setBackgroundColor("#DDDDD0");
			} else {
			    paItem.setBackgroundColor("#DDDDDD");
			}
			
			var lyHeader = new qx.ui.layout.HBox(10);
			lyHeader.setAlignY("bottom");
			var paHeader = new qx.ui.container.Composite(lyHeader);
			paItem.add(paHeader);
			
			var laName = new qx.ui.basic.Label(entry.name);
			laName.setFont(this.__headerFont);
			paHeader.add(laName);
			
			var laDate = new qx.ui.basic.Label(entry.date);
			paHeader.add(laDate);
			
			
			var laMessage = new qx.ui.basic.Label("<pre>" + entry.message + "</pre>");
			laMessage.setRich(true);
			laMessage.setSelectable(true);
			paItem.add(laMessage);
			
			this.__paGbContent.addAt(paItem, 0);
		},
		
		__onBtSend : function(evt) {
			if (this.__form.validate()) {
				var controller = new qx.data.controller.Form(null, this.__form);
				var model = controller.createModel();
				try {
					var entry = qx.util.Serializer.toNativeObject(model);
					this.__addItem(entry);
					this.__guestRpc.callSync("AddEntry", entry);
					alert(this.tr("The message was succesfully entered."));
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
