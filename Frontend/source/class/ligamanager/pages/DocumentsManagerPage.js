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

		// read files
		var files = this.__docsRpc.callSync("GetFiles");
		this.__filesSelectBox.setListData(files);
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
		__docsTable : null,
		__docsRpc : null,
		
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
			
			//
			// documents table
			//
			
			this.__docsTable = new ligamanager.pages.EntityTable("document", ["Name", "Datei"], ["name", "filename"]);
			this.__docsTable.setHeight(200);
			this.__docsTable.setAllowGrowX(false);
			this.__content.add(this.__docsTable);
			
			var table = this.__docsTable.getTable();
			table.setColumnWidth( 0, 200 );
			table.setColumnWidth( 1, 200 );
			
			
			var tcm = table.getTableColumnModel();

			// Display a select box for file choose
			this.__filesSelectBox = new qx.ui.table.celleditor.SelectBox();
			tcm.setCellEditorFactory(1, this.__filesSelectBox);
			
		}
		
	}
});
