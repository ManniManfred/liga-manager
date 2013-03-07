/*
#asset(m_ligamanager/warn.png)
#asset(m_ligamanager/waitcursor.gif)
*/

/**
 * This is the abstract base class for pages, that need data from server.
 */
qx.Class.define("m_ligamanager.pages.AbstractDataPage",
{
	type : "abstract",
	extend: qx.ui.mobile.page.NavigationPage,
	
	/*
	* ****************************************************************************
	* CONSTRUCTOR
	* ****************************************************************************
	*/

	/**
	 * 
	 */
	construct: function(mainWidget) {
		this.base(arguments);

		this._mainWidget = mainWidget;
		this._coreRpc = new qx.io.remote.Rpc(m_ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
		
		// back button
		this.setShowBackButton(true);
		this.setBackButtonText("Zurück");
		this.addListener("back", function() {
			mainWidget.show({
				reverse:true
			});
		}, this);

		// action button / refresh
		this.setShowButton(true);
		this.setButtonText("Aktualisieren");
		this.addListener("action", this.__refresh, this);
		
	},



	/*
	* ****************************************************************************
	* MEMBERS
	* ****************************************************************************
	*/

	members:
	{
		_coreRpc : null,
		_mainWidget : null,
		
		
		// overridden
		_initialize : function()
		{
			this.base(arguments);
			
			this.__refresh();
		},
		
		__refresh : function() {
		
			//this.getContent().removeAll();
			
			// show wait cursor
			var atom = new qx.ui.mobile.basic.Atom("Warten ...", "m_ligamanager/waitcursor.gif");
			this.getContent().addAt(atom, 0);
			
			var self = this;
			// start request
			var handler = function(result, exc) {
				self.getContent().removeAll();
				
				if (exc == null) {
					self._fillData(result);
				} else {
					var atom = new qx.ui.mobile.basic.Atom("" + exc, "m_ligamanager/warn.png");
					self.getContent().add(atom, 0);
				}
			};
			this._executeRequest(handler);
		},
		
		// virtual
		_executeRequest : function(callback) {
			var parameters = this._getRequest();
			parameters = qx.lang.Array.insertAt(parameters, callback);
			
			this._coreRpc.callAsync.apply(this._coreRpc, parameters);
		},
		
		// abstract
		_getRequest : function() {
			// has to be overridden
		},
		
		
		// abstract
		_fillData : function(data) {
			// has to be overridden
		}
	}
});
