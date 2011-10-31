/*
#asset(uploadwidget/*)
#asset(qx/icon/${qx.icontheme}/22/actions/document-save.png)
#asset(qx/icon/${qx.icontheme}/16/actions/dialog-ok.png)
#asset(qx/icon/${qx.icontheme}/16/actions/document-revert.png)
#asset(qx/icon/${qx.icontheme}/16/actions/document-save.png)
*/

qx.Class.define("ligamanager.pages.DocumentsManagerPage",
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
		
		
		this.__docsRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.Documents");
		
		this.__content = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
		this.__content.setPadding(20);
		this.add(this.__content);
		
		
		
		this.__createFileUploadUi();
		this.__createDocumentsUi();
		this.__updateDocuments();
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
		__docsTableModel : null,
		__docsTable : null,
		__docsRpc : null,
		
		__waDocs : null,
		__filesSelectBox : null,
		
		__createFileUploadUi : function() {
			
		
			var laUpload = new qx.ui.basic.Label(this.tr("File Upload"));
			laUpload.setAppearance("label-sep");
			this.__content.add(laUpload);
			
			  
			var container2 = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

			var form2 = new uploadwidget.UploadForm('uploadFrm', ligamanager.Core.UPLOAD_BACKEND);
			form2.setParameter('rm','upload_multiple');
			form2.setPadding(8);
			form2.setAllowGrowX(false);

			var vb = new qx.ui.layout.VBox(10)
			form2.setLayout(vb);
			container2.add(form2);
			  
			var file1 = new uploadwidget.UploadField('uploadfile1', 'Select File 1','icon/16/actions/document-save.png');
			form2.add(file1);

			var bt = new qx.ui.form.Button(this.tr("Upload"), "icon/16/actions/dialog-ok.png");
			bt.set({ marginTop : 10, allowGrowX : false });
			form2.add(bt);

			form2.addListener('completed',function(e) {
				form2.clear();
				var response = this.getIframeHtmlContent();
				bt.setEnabled(true);
			});

			form2.addListener('completed', function(e) {
				var files = this.__docsRpc.callSync("GetFiles");
				this.__filesSelectBox.setListData(files);
			}, this);

			bt.addListener('execute', function(e) {
				form2.send();
				this.setEnabled(false);
			});
			
			this.__content.add(container2);

			
		},
		
		__createDocumentsUi : function() {
		
			var laDocs = new qx.ui.basic.Label(this.tr("Documents"));
			laDocs.setAppearance("label-sep");
			this.__content.add(laDocs);
			
			
			this.__waDocs = new ligamanager.ui.WaitingContainer();
			this.__content.add(this.__waDocs);
			
			var paDocs = new qx.ui.container.Composite();
			paDocs.setAllowGrowX(false);
			paDocs.setLayout(new qx.ui.layout.Dock());
			this.__waDocs.add(paDocs);

			//
			// toolbar
			//
			var toolbar = new qx.ui.toolbar.ToolBar();
			paDocs.add(toolbar, {edge: "north"});

			var part = new qx.ui.toolbar.Part();
			toolbar.add(part);

			var btRefresh = new qx.ui.toolbar.Button(this.tr("Refresh"), "icon/22/actions/view-refresh.png" );
			btRefresh.addListener("execute", this.__onDocumentsRefresh, this );
			part.add(btRefresh);
			
			part.add(new qx.ui.toolbar.Separator());
			
			var btNew = new qx.ui.toolbar.Button(this.tr("New"), "icon/22/actions/list-add.png");
			btNew.addListener("execute", this.__onNewDocument, this);
			part.add(btNew);


			var btDelete = new qx.ui.toolbar.Button(this.tr("Remove"), "icon/22/actions/list-remove.png");
			btDelete.addListener("execute", this.__onDeleteDocument, this);
			part.add(btDelete);

			part.add(new qx.ui.toolbar.Separator());
			
			var btSave = new qx.ui.toolbar.Button(this.tr("Save"), "icon/22/actions/document-save.png");
			btSave.addListener("execute", this.__onSaveDocuments, this);
			part.add(btSave);

			
			toolbar.setShow("icon");
			
			//
			// documents table
			//
			
			this.__docsTableModel = new ligamanager.pages.EntityTableModel(this.__docsRpc, "Documents");
			//this.__docsTableModel = new qx.ui.table.model.Simple();
			this.__docsTableModel.setColumns(["Name", "Datei"], ["name", "filename"]);
			
			this.__docsTableModel.setColumnEditable(0, true);
			this.__docsTableModel.setColumnEditable(1, true);
			this.__docsTableModel.addListener("dataChanged", this.__docsChanged, this);
			
			this.__docsTable = new qx.ui.table.Table(this.__docsTableModel);
			
			
			this.__docsTable.setColumnWidth( 0, 200 );
			this.__docsTable.setColumnWidth( 1, 200 );
			
			
			var tcm = this.__docsTable.getTableColumnModel();

			// Display a select box for file choose
			this.__filesSelectBox = new qx.ui.table.celleditor.SelectBox();
			tcm.setCellEditorFactory(1, this.__filesSelectBox);
			
			
			paDocs.add(this.__docsTable, {edge:"center"} );

		},
		
		__updateDocuments : function(evt) {
		
			var files = this.__docsRpc.callSync("GetFiles");
			this.__filesSelectBox.setListData(files);
			
			this.__docsTableModel.reloadData();
		},
		
		__docsChanged : function(evt) {
			var data = evt.getData();
		},
		
		__onDocumentsRefresh : function(evt) {
			this.__updateDocuments();
		},
		
		__onNewDocument : function(evt) {
			var newdoc = {id : null, name : "Neues Dok", filename : ""};
			
			this.__docsTableModel.addNewRow(newdoc);
		},
		
		__onDeleteDocument : function(evt) {
			var selection = this.__docsTable.getSelectionModel();
			var	selectedData = null;
			var docId = null;
			if( selection.isSelectionEmpty() == false ) {
			
				var selectedRanges = selection.getSelectedRanges();
				for (var i=0; i < selectedRanges.length; i++ ) {
					for (var index = selectedRanges[i]["minIndex"]; index <= selectedRanges[i]["maxIndex"]; index++ ) {
						this.__docsTableModel.removeRow(index);
					}
				}
			}
		},
		
		/**
		 * Stores all changed.
		 */
		__onSaveDocuments : function(evt) {
			this.__docsTableModel.saveChanges();
		}
		
	}
});
