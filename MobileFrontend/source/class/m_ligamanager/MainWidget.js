
/**
 * This class represents the main widget that is shown for this
 * application.
 */
qx.Class.define("m_ligamanager.MainWidget",
{
	extend: qx.ui.mobile.page.NavigationPage,

	/*
	*****************************************************************************
	STATICS
	*****************************************************************************
	*/

	statics: {
	},


	/*
	* ****************************************************************************
	* CONSTRUCTOR
	* ****************************************************************************
	*/

	/**
	 * 
	 */
	construct: function() {
		this.base(arguments);

		this.__coreRpc = new qx.io.remote.Rpc(m_ligamanager.Core.RPC_BACKEND , "ligamanager.Core");
		
		// call get instance, to init date formats
		m_ligamanager.Core.getInstance();
//
//		if (core.IsCorrectlyLoggedIn()) {
//			this.__isLoggedIn = true;
//		} else {
//			this.__isLoggedIn = false;
//		}

		this.addListener("initialize", this.__initialize, this);
		
		// load design
		this.loadDesign();
		this.setDesign(this.__design);
		
	},

	/*
	* ****************************************************************************
	* PROPERTIES
	* ****************************************************************************
	*/

	properties: {
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
		__settings : null,
		__design : null,
		__coreRpc : null,
		__isLoggedIn : null,
		
		
		getSettings : function() {
			return this.__settings;
		},
		
		__initialize : function() {
		
			var tablePage = new m_ligamanager.pages.TablePage(this);
			var btTable = new qx.ui.mobile.form.Button("Tabelle");
			this.getContent().add(btTable);
			btTable.addListener("tap", function() {
				tablePage.show();
			}, this);
			
			
			var playingPage = new m_ligamanager.pages.PlayingSchedulePage(this);
			var btPlaying = new qx.ui.mobile.form.Button("Spielplan");
			this.getContent().add(btPlaying);
			btPlaying.addListener("tap", function() {
				playingPage.show();
			}, this);
			
			var scorerPage = new m_ligamanager.pages.ScorerPage(this);
			var btScorer = new qx.ui.mobile.form.Button("Torjäger");
			this.getContent().add(btScorer);
			btScorer.addListener("tap", function() {
				scorerPage.show();
			}, this);
			
			var playerLockPage = new m_ligamanager.pages.PlayerLockPage(this);
			var btPlayerLock = new qx.ui.mobile.form.Button("Sperren");
			this.getContent().add(btPlayerLock);
			btPlayerLock.addListener("tap", function() {
				playerLockPage.show();
			}, this);
			
		},
		
		/**
		 * Loads the design stored in the server
		 * and sets the appearance.
		 */
		loadDesign : function() {
			
			// create default design
			var design = this.__design = {};
			design.Title = "Hobbyliga Kreis Borken";
			design.Image = "fussball_gras.png";
			design.TitleBackColor = "rgb(16,153,9)";
			design.TitleFrontColor = "#ffffff";
			design.NavBackColor = "#002953";
			design.NavFrontColor = "#FFF";
			design.HighlightColor = "#AAFFFF";
			
			var storedDesign = this.__coreRpc.callSync("GetDesign");
			
			// take properties from storedDesign
			if (storedDesign != null) {
				for (var key in storedDesign) {
					design[key] = storedDesign[key];
				}
			}
			
		},
		
		getDesign : function() {
			return this.__design;
		},
		
		setDesign : function(design) {
			this.__design = design;
			
			this.setTitle(design.Title);
		}
		

	}
});
