
/**
 * This is the Core.
 */
qx.Class.define("m_ligamanager.Core",
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

		m_ligamanager.Core.DISPLAY_FORMAT = new qx.util.format.DateFormat("dd.MM.yyyy HH:mm");
		m_ligamanager.Core.SOURCE_FORMAT = new qx.util.format.DateFormat("yyyy-MM-dd HH:mm:ss");
		
		this.__rpc = new qx.io.remote.Rpc(m_ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
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
