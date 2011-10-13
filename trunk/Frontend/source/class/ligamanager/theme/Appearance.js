/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define("ligamanager.theme.Appearance",
{
  extend : qx.theme.modern.Appearance,

	appearances : {
	  
		"toolbar-textfield" : {
			alias : "textfield",
			include : "textfield",

			style : function(states)
			{
				return {
					marginTop : 4,
					marginBottom : 2
					/*
					padding : (states.pressed || states.checked || states.hovered) && !states.disabled
							|| (states.disabled && states.checked) ? 3 : 5,
					decorator : states.pressed || (states.checked && !states.hovered) || (states.checked && states.disabled) ?
								"toolbar-button-checked" :
							  states.hovered && !states.disabled ?
								"toolbar-button-hovered" : undefined */
				};  
			}
		},
		
		"tabview-small" : {
			alias : "tabview",
			include : "tabview",
			
			style : function(states)
			{
				return {
					contentPadding : 1
				};  
			}
		},
		
		"dock-title" : {
			style : function(states) {
				return {
					padding : [ 3 ],
					textColor : "text-selected",
					backgroundColor : "#7d7d7d" //"ActiveCaption"
				};
			}
		},
		
		"dock-title/label" : {
			alias : "label",
			include : "label",
			style : function(states) {
				return {
					font : "bold"
				};
			}
		},
		
		"dock-title/button" : {
			alias : "label-button",
			include : "label-button"
		},
		
		
		"label-button" : {
			alias : "atom",
			include : "atom",
			style : function(states) {
				return {
					textColor : states.hovered ? "Highlight" : undefined,
					cursor : "pointer",
					font : "bold-underline"
				};
			}
		},
		
		
		//
		// app header
		//
		
		"app-header/button" : {
			alias : "atom",
			include : "atom",
			style : function(states) {
				return {
					textColor : states.hovered ? "#f9f0af" : undefined,
					cursor : "pointer",
					font : "bold-underline"
				};
			}
		},
		
		
		"app-title" : {
			style : function(states) {
				return {
					font : "bold",
					textColor : "text-selected",
					padding : [8, 12],
					backgroundColor : "#7d7d7d" //"#002953"
				};
			}
		},
		
		"app-title/button" : {
			alias : "atom",
			include : "atom",
			style : function(states) {
				return {
					textColor : states.hovered ? "#f9f0af" : undefined,
					cursor : "pointer",
					font : states.isIn ? "bold-underline" : undefined
				};
			}
		},
		
		
		//
		// sidebar
		//
		
		"sidebar" : {
			style : function(states) {
				return {
					padding : [8, 12],
					backgroundColor : "#d2d2d2" //"#002953"
				};
			}
		},
		
		"sidebar/button" : {
			alias : "atom",
			include : "atom",
			style : function(states) {
				return {
					allowGrowX : false,
					textColor : states.hovered ? "#f9f0af" : undefined,
					cursor : "pointer",
					font : states.isIn ? "bold-underline" : undefined
				};
			}
		}
	}
});