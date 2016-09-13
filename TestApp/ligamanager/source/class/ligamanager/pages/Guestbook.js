 
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
		
		var core = ligamanager.Core.getInstance();
		var user = core.getUser();

		this.__addDeleteButtons = user != null && user.rights == "ADMIN";
		
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
		__content : null,
		__paGbContent : null,
		__addDeleteButtons : null,
		
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
		
			var messageText = entry.message.replace(/\r\n/g, "\n");
			messageText = messageText.replace(/\n/g, "<br>");
			
			var message = "<div style=\"border:2px solid #c0c0c1;\">"
				+ "<div style=\"padding:1px;background:#F2F1DE;\">"
					+ "<p style=\"margin-left: 8px; font-size: large; font-weight: bold\">"
						+ (entry.email != null ? "<a style=\"color:black;\" href=\"mailto: " + entry.email + "\">" : "") 
							+ entry.name
							+ (entry.email != null ? "</a>" : "") 
						+ "</p>"
					+ "<p style=\"position:absolute; top: 0px; right: 8px;\">" 
						+ ligamanager.Core.DISPLAY_FORMAT.format(ligamanager.Core.SOURCE_FORMAT.parse(entry.date))
						+ "</p>"
				+ "</div>"
			
				+ "<div style=\"padding: 5px\">"
				+ "<p>" + messageText + "</p>"
				+ "</div>";
			
			var laMessage = new qx.ui.basic.Label(message);
			laMessage.setRich(true);
			laMessage.setSelectable(true);
			laMessage.setAllowGrowX(true);
			
			
			this.__paGbContent.addAt(laMessage, 0);
			
			if (this.__addDeleteButtons) {
				var removeButton = new qx.ui.form.Button(this.tr("Delete following entry"));
				removeButton.setUserData("entry", entry);
				removeButton.setUserData("item", laMessage);
				removeButton.setAllowGrowX(false);
				removeButton.addListener("execute", this.__onDelete, this);
				this.__paGbContent.addAt(removeButton, 0);
			}
		},
		
		__onDelete : function(e) {
			var button = e.getTarget();
			var entry = button.getUserData("entry");
			var item = button.getUserData("item");
			
			this.__guestRpc.callSync("RemoveEntry", entry.id);
			this.__paGbContent.remove(item);
			this.__paGbContent.remove(button);
		},
		
		
		__onBtSend : function(evt) {
			if (this.__form.validate()) {
				var controller = new qx.data.controller.Form(null, this.__form);
				var model = controller.createModel();
				try {
					var entry = qx.util.Serializer.toNativeObject(model);
					entry.date = ligamanager.Core.SOURCE_FORMAT.format(new Date());
					entry.id = this.__guestRpc.callSync("AddEntry", entry);
					
					this.__addItem(entry);
					//alert(this.tr("The message was succesfully entered."));
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
