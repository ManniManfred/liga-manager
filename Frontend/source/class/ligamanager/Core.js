
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
		DOCUMENT_FOLDER : "/LigaManager/Backend/services/upload/",
		UPLOAD_BACKEND : "/LigaManager/Backend/services/upload.php",
		RPC_BACKEND : "/LigaManager/Backend/services/index.php",
		EXPORT : "/LigaManager/Backend/services/export_entities.php"
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

		this.__rpc = new qx.io.remote.Rpc(ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
	},

	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties : {},

	/*
	* ****************************************************************************
	* MEMBERS
	* ****************************************************************************
	*/

	members :
	{
		__rpc: null,

		/**
		* TODOC
		*
		* @return {var} TODOC
		*/
		IsCorrectlyLoggedIn : function() {
			var result = this.__rpc.callSync("IsCorrectlyLoggedIn");
			return result;
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
		}

	}
});
