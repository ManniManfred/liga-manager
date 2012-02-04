
/**
 * This is the Core.
 */
qx.Class.define("ligamanager.Core",
{
	extend : qx.core.Object,
	type : "singleton",

	/*
	*****************************************************************************
	STATICS
	*****************************************************************************
	*/

	statics: {
		DOCUMENT_FOLDER : "../../Backend/services/upload/",
		UPLOAD_BACKEND : "../../Backend/services/upload.php",
		RPC_BACKEND : "../../Backend/services/index.php",
		EXPORT : "../../Backend/services/export_entities.php",
		
		// is set in constructor
		DISPLAY_FORMAT : null,
		SOURCE_FORMAT : null
	},


	/*
	* ****************************************************************************
	* CONSTRUCTOR
	* ****************************************************************************
	*/

	/**
	 * Create a new Core.
	 */
	construct : function()
	{
		this.base(arguments);

		ligamanager.Core.DISPLAY_FORMAT = new qx.util.format.DateFormat("dd.MM.yyyy HH:mm");
		ligamanager.Core.SOURCE_FORMAT = new qx.util.format.DateFormat("yyyy-MM-dd HH:mm:ss");
		
		this.__rpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
	},

	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties : {
		/**
		 * Contains the active page of this navigation.
		 */
		user : {
			check : "Map",
			nullable : true,
			init : null,
			event : "changeUser"
		}
	},

	/*
	* ****************************************************************************
	* MEMBERS
	* ****************************************************************************
	*/

	members :
	{
		__rpc: null,
		__alreadAskedForUser : null,
		
		/**
		* TODOC
		*
		* @return {var} TODOC
		*/
		IsCorrectlyLoggedIn : function() {
			if (!this.__alreadAskedForUser) {
				this.setUser(this.__rpc.callSync("GetSelf"));
				this.__alreadAskedForUser = true;
			}
			return this.getUser() != null;
		},


		/**
		* Sign in with the specified user and password.
		*
		* @param func {Function} TODOC
		* @param user {var} TODOC
		* @param password {var} TODOC
		* @return {var} TODOC
		*/
		loginAsync : function(func, user, password) {
			var self = this;
			return this.__rpc.callAsync(function(result, ex) {
				if (result.result == true) {
					self.setUser(result.user);
				}
				func(result, ex);
			}, "Login", user, password);
			
		},

		/**
		 * register a new user
		 **/
		registerAsync : function(func, user, password, email){
			var self = this;
			return this.__rpc.callAsync(function(result, ex) {
				func(result, ex);
			}, "Register", user, password,email);
		   
		},

		/**
		* Sign out.
		*
		* @return {void} 
		*/
		logout : function() {
			this.__rpc.callSync("Logout");
			this.setUser(null);
		}

	}
});
