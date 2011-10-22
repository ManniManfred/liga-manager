
/*
#asset(ligamanager/normal/new.png)
#asset(ligamanager/normal/default.png)
#asset(ligamanager/normal/delete.png)
*/
qx.Class.define("ligamanager.pages.LigaManagerPage",
{
	extend: qx.ui.window.Desktop,
	implement: [ligamanager.pages.IPage],

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments, new qx.ui.window.Manager());
		
		var layout = new qx.ui.layout.VBox();
		layout.setSpacing(20);
		this.__content = new qx.ui.container.Composite(layout);
		this.add(this.__content, {left:0, top: 0, right: 0,bottom: 0});
		
		this.__content.setPadding(20);
		
		
		this.__ligaManagerRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.LigaManager");
		
		this.__createSaison();
		this.__updateSaisons();
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
		__content : null,
		__ligaManagerRpc : null,
		__lvSaison : null,
		
		__newSaisonForm : null,
		__newSaisonWindow : null,
		
		__createSaison : function() {
			
			var laSaison = new qx.ui.basic.Label("Saison");
			laSaison.setFont("bold");
			laSaison.setPadding(5);
			laSaison.setBackgroundColor("#CCCCCC");
			laSaison.setAllowGrowX(true);
			this.__content.add(laSaison);
			
			var paSaison = new qx.ui.container.Composite();
			paSaison.setAllowGrowX(false);
			paSaison.setLayout(new qx.ui.layout.Dock());
			this.__content.add(paSaison);

			//
			// toolbar
			//
			var toolbar = new qx.ui.toolbar.ToolBar();
			paSaison.add(toolbar, {edge: "north"});


			var btNew = new qx.ui.toolbar.Button(this.tr("New"), "ligamanager/normal/new.png");
			btNew.addListener("execute", this.__onNewSaison, this);
			toolbar.add(btNew);

			var btSetDefault = new qx.ui.toolbar.Button(this.tr("SetDefault"), "ligamanager/normal/default.png");
			btSetDefault.addListener("execute", this.__onSetDefault, this);
			toolbar.add(btSetDefault);

			var btDelete = new qx.ui.toolbar.Button(this.tr("SetDefault"), "ligamanager/normal/delete.png");
			btDelete.addListener("execute", this.__onDeleteSaison, this);
			toolbar.add(btDelete);

			var lvSaison = this.__lvSaison = new qx.ui.form.List();
			paSaison.add(lvSaison, {edge: "center"});


			toolbar.setShow("icon");
		},
		
		__updateSaisons : function() {
			
			var self = this;
			self.__lvSaison.removeAll();
			
			this.__ligaManagerRpc.callAsync(function(result, ex) {
				if (ex == null) {
					if (result != null) {
						for (var i=0; i < result.length; i++) {
							var item = new qx.ui.form.ListItem(result[i].name);
							item.setUserData("id", result[i].id);
							self.__lvSaison.add(item);
							
							if (result[i].isDefault == true) {
								item.setIcon("ligamanager/normal/default.png");
							}
						}
					}
				} else {
					alert("Fehler beim Laden der Saisons.");
				}
			}, "GetSaisons");
			
		},
		
		__onDeleteSaison : function(evt) {
			
			var selection = this.__lvSaison.getSelection();
			
			if (selection.length == 1) {
				var saisonId = selection[0].getUserData("id");
				this.__ligaManagerRpc.callSync("RemoveSaison", saisonId);
				
				this.__lvSaison.remove(selection[0]);
			}
		},
		
		__onSetDefault : function(evt) {
		
			var selection = this.__lvSaison.getSelection();
			
			if (selection.length == 1) {
			
				var saisonId = selection[0].getUserData("id");
				this.__ligaManagerRpc.callSync("SetDefaultSaison", saisonId);
				
				var items = this.__lvSaison.getChildren();
				for (var i = 0; i < items.length; i++) {
					items[i].setIcon(null);
				}
			
				selection[0].setIcon("ligamanager/normal/default.png");
			}
			
		},
		
		__onNewSaison : function(evt) {
		
			var wm1 = this.__newSaisonWindow = new qx.ui.window.Window("Neue Saison", "ligamanager/normal/new.png");
			wm1.setShowMaximize(false);
			wm1.setShowMinimize(false);
			wm1.setResizable(false);
			wm1.setLayout(new qx.ui.layout.Dock(null, 20));
			wm1.setModal(true);
			wm1.moveTo(150, 150);
			this.add(wm1);

			var layout = new qx.ui.layout.Grid(9, 5);
			layout.setColumnAlign(0, "right", "middle");
			layout.setSpacingX(5);
			layout.setSpacingY(5);
			layout.setColumnWidth(0, 100);
			layout.setColumnWidth(1, 180);

			var contentPane = new qx.ui.container.Composite(layout);
			wm1.add(contentPane, {edge: "center"});


			var form = this.__newSaisonForm = new qx.ui.form.Form();
			var tabIndex = 1;
			var suffix = " :";
			var requireSuffix = " * :";

			/*
			 * add input fields
			 */

			// name label
			var laName = new qx.ui.basic.Label("Name" + requireSuffix);
			contentPane.add(laName, { row: 1, column: 0 });

			// name textbox
			var tbName = new qx.ui.form.TextField();
			tbName.setTabIndex(tabIndex++);
			tbName.setRequired(true);
			tbName.setRequiredInvalidMessage(this.tr("The field %1 is required.", this.tr("Name")));
			contentPane.add(tbName, { row: 1, column: 1});
			form.add(tbName, "", null, "name");

			// name label
			var laCopy = new qx.ui.basic.Label("Kopie von" + suffix);
			contentPane.add(laCopy, { row: 2, column: 0 });

			// name textbox
			var sbCopy = new qx.ui.form.SelectBox();
			sbCopy.setTabIndex(tabIndex++);
			contentPane.add(sbCopy, { row: 2, column: 1});
			form.add(sbCopy, "", null, "copy");


			/*
			 * add buttons
			 */
			var paBottom = new qx.ui.container.Composite(
			  new qx.ui.layout.Flow().set({"alignX" : "right"}));
			wm1.add(paBottom, {edge:"south"});

			var btSend = new qx.ui.form.Button("OK");
			btSend.addListener("execute", this.__createNewSaison, this);
			paBottom.add(btSend);
			form.addButton(btSend);

			paBottom.add(new qx.ui.core.Spacer(10,10));

			// add a reset button
			var btAbort = new qx.ui.form.Button("Abbrechen");
			btAbort.addListener("execute", wm1.close, wm1);
			paBottom.add(btAbort);

			wm1.addListener("keypress", function(e) {
				if (e.getKeyIdentifier() == "Enter") {
					this.__createNewSaison();
				}
			} , this);
			wm1.open();
		},
		
		__createNewSaison : function() {
		
			if (this.__newSaisonForm.validate()) {
				var controller = new qx.data.controller.Form(null, this.__newSaisonForm);
				var model = controller.createModel();
				var data = qx.util.Serializer.toNativeObject(model);
				
				try {
					this.__ligaManagerRpc.callSync("CreateSaison", data);
					this.__newSaisonForm.reset();
					this.__newSaisonWindow.close();
					this.__updateSaisons();
				} catch (ex)
				{
					alert("Das Erzeugen der neuen Saison ist aus folgendem Grund fehlgeschlagen: \n" + ex);
				}
				
			} else {
				alert(this.__newSaisonForm.getValidationManager().getInvalidMessages().join("\n"));
			}
		}
	}
});
