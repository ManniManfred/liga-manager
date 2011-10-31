
qx.Class.define("ligamanager.pages.TeamTableModel",
{
  extend : qx.ui.table.model.Remote,

	/*
	 * ****************************************************************************
	 * CONSTRUCTOR
	 * ****************************************************************************
	 */

	construct: function() {
		this.base(arguments);
		
		this.__ligaManagerRpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.LigaManager");
		
	},
	
	
	members :
	{
		__ligaManagerRpc : null,

		// overloaded - called whenever the table requests the row count
		_loadRowCount : function()
		{
			var self = this;
			
			// send request
			this.__ligaManagerRpc.callAsync(function(result, ex) {
				if (ex == null) {
					if (result != null) {
						// Apply it to the model - the method "_onRowCountLoaded" has to be called
						self._onRowCountLoaded(result);
					}
				} else {
					alert("Fehler beim Laden der Saisons.");
				}
			}, "GetTeamsCount");

		},


		// overloaded - called whenever the table requests new data
		_loadRowData : function(firstRow, lastRow)
		{
			var self = this;
			
			// send request
			this.__ligaManagerRpc.callAsync(function(result, ex) {
				if (ex == null) {
					if (result != null) {
						// Apply it to the model - the method "_onRowCountLoaded" has to be called
						self._onRowDataLoaded(result);
					}
				} else {
					alert("Fehler beim Laden der Saisons.");
				}
				
			}, "GetTeams");
		}
	}
});