/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define("ligamanager.theme.Font",
{
  extend : qx.theme.modern.Font,
  fonts  : {
	"bold-underline" : {
		size : (qx.core.Environment.get("os.name") == "win" &&
			(qx.core.Environment.get("os.version") == "7" ||
			qx.core.Environment.get("os.version") == "vista")) ? 12 : 11,
		lineHeight : 1.4,
		family : qx.core.Environment.get("os.name") == "osx"
			? [ "Lucida Grande" ] 
			: ((qx.core.Environment.get("os.name") == "win" &&
					(qx.core.Environment.get("os.version") == "7" ||
					qx.core.Environment.get("os.version") == "vista")))
				? [ "Segoe UI", "Candara" ] 
				: [ "Tahoma", "Liberation Sans", "Arial", "sans-serif" ],
		bold : true,
		decoration : "underline"
	}
  }
});