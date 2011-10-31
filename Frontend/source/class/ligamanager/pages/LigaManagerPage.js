
/*
#asset(qx/icon/${qx.icontheme}/22/actions/view-refresh.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
#asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
#asset(ligamanager/22/default.png)
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
		this.__content.setPadding(20);
		
		var paScroll = new qx.ui.container.Scroll(this.__content);
		this.add(paScroll, {left:0, top: 0, right: 0,bottom: 0});
		
		
		
		this.__ligaManagerRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.LigaManager");
		
		this.__createSaisonPart();
		this.__createTeamPart();
		
		this.__updateSaisons();
	},

	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties: {
		currentSaison : {
			check : "Map",
			nullable : true,
			init : null,
			apply : "__applyCurrentSaison"
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
		__content : null,
		__ligaManagerRpc : null,
		__lvSaison : null,
		__waSaison : null,
		
		__newSaisonForm : null,
		__newSaisonWindow : null,
		
		
		//
		// Saison handling
		//
		
		
		__createSaisonPart : function() {
			
			var laSaison = new qx.ui.basic.Label("Saison");
			laSaison.setAppearance("label-sep");
			this.__content.add(laSaison);
			
			var waSaison = this.__waSaison = new ligamanager.ui.WaitingContainer();
			this.__content.add(waSaison);
			
			var paSaison = new qx.ui.container.Composite();
			paSaison.setAllowGrowX(false);
			paSaison.setLayout(new qx.ui.layout.Dock());
			waSaison.add(paSaison);

			//
			// toolbar
			//
			var toolbar = new qx.ui.toolbar.ToolBar();
			paSaison.add(toolbar, {edge: "north"});

			var part = new qx.ui.toolbar.Part();
			toolbar.add(part);

			var btRefresh = new qx.ui.toolbar.Button(this.tr("Refresh"), "icon/22/actions/view-refresh.png" );
			btRefresh.addListener("execute", this.__onSaisonRefresh, this );
			part.add(btRefresh);
			
			part.add(new qx.ui.toolbar.Separator());
			
			var btNew = new qx.ui.toolbar.Button(this.tr("New"), "icon/22/actions/list-add.png");
			btNew.addListener("execute", this.__onNewSaison, this);
			part.add(btNew);


			var btDelete = new qx.ui.toolbar.Button(this.tr("Remove"), "icon/22/actions/list-remove.png");
			btDelete.addListener("execute", this.__onDeleteSaison, this);
			part.add(btDelete);

			part.add(new qx.ui.toolbar.Separator());
			
			var btSetDefault = new qx.ui.toolbar.Button(this.tr("SetDefault"), "ligamanager/22/default.png");
			btSetDefault.addListener("execute", this.__onSetDefault, this);
			part.add(btSetDefault);
			
			//
			// list view
			//
			
			var lvSaison = this.__lvSaison = new qx.ui.form.List();
			lvSaison.addListener("changeSelection", this.__saisonSelectionChanged, this);
			paSaison.add(lvSaison, {edge: "center"});


			toolbar.setShow("icon");
		},
		
		__updateSaisons : function() {
			
			var self = this;
			
			self.__waSaison.startWaiting();
			
			this.__ligaManagerRpc.callAsync(function(result, ex) {
				try {
					if (ex == null) {
						if (result != null) {
							self.__lvSaison.removeAll();
							for (var i=0; i < result.length; i++) {
								var item = new qx.ui.form.ListItem(result[i].name);
								item.setUserData("saison", result[i]);
								self.__lvSaison.add(item);
								
								if (result[i].isDefault == true) {
									item.setIcon("ligamanager/22/default.png");
								}
							}
						}
					} else {
						alert("Fehler beim Laden der Saisons.");
					}
				} finally {
					self.__waSaison.stopWaiting();
				}
				
			}, "GetSaisons");
			
		},
		
		__saisonSelectionChanged : function() {
			var selection = this.__lvSaison.getSelection();
			if (selection == null || selection.length <= 0) {
				this.setCurrentSaison(null);
			} else {
				this.setCurrentSaison(selection[0].getUserData("saison"));
			}
		},
		
		__onSaisonRefresh : function(evt) {
			this.__updateSaisons();
		},
		
		__applyCurrentSaison : function(value, oldValue) {
			this.__updateTeams();
		},
		
		__onDeleteSaison : function(evt) {
			
			var saison = this.getCurrentSaison();
			if (saison != null) {
				this.__ligaManagerRpc.callSync("RemoveSaison", saison.id);
				
				var items = this.__lvSaison.getChildren();
				for (var i = 0; i < items.length; i++) {
					if (items[i].getUserData("saison") == saison) {
						this.__lvSaison.remove(items[i]);
						break;
					}
				}
			}
		},
		
		__onSetDefault : function(evt) {
		
			var saison = this.getCurrentSaison();
			if (saison != null) {
			
				this.__ligaManagerRpc.callSync("SetDefaultSaison", saison.id);
				
				var items = this.__lvSaison.getChildren();
				for (var i = 0; i < items.length; i++) {
					if (items[i].getUserData("saison") == saison) {
						items[i].setIcon("ligamanager/22/default.png");
					} else {
						items[i].setIcon(null);
					}
				}
			
			}
			
		},
		
		__onNewSaison : function(evt) {
		
			var wm1 = this.__newSaisonWindow = new qx.ui.window.Window("Neue Saison", "icon/22/actions/list-add.png");
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
		},
		
		
		
		//
		// team handling
		//
		
		__teamsTable : null,
		
		__createTeamPart : function() {
			
			var laTeams = new qx.ui.basic.Label(this.tr("Teams"));
			laTeams.setAppearance("label-sep");
			this.__content.add(laTeams);
			
			this.__teamsTable = new ligamanager.pages.EntityTable("team", ["Name", "Webseite", "Logo"], ["name", "homepage", "icon"]);
			this.__teamsTable.setHeight(300);
			this.__teamsTable.setAllowGrowX(false);
			this.__content.add(this.__teamsTable);
			
			var table = this.__teamsTable.getTable();
			table.setColumnWidth( 0, 200 );
			table.setColumnWidth( 1, 200 );
			
		}
		
	}
});
