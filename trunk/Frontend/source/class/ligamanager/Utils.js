
/**
 * This is a class that provides some static util functions.
 */
qx.Class.define("ligamanager.Utils",
{
	type: "static",

	/*
	*****************************************************************************
	STATICS
	*****************************************************************************
	*/

	statics: {
		/**
		 * Do some initialising.
		 */
		isInstanceOf : function(qxObject, qxClass) {
			return (qxObject != null) && (qx.Class.isSubClassOf(qxObject.constructor, qxClass));
		},
		
		isImplementationOf : function(qxObject, qxInterface) {
			return (qxObject != null) && (qx.Class.hasInterface(qxObject.constructor, qxInterface));
		},
		
		areEqual : function(obj1, obj2) {
			return (obj1 == obj2)
				|| (obj1 != null && obj1.equals != undefined && obj1.equals(obj2));
		},
		
		//Send all to URL per Post
		postToURL: function(url, values, target) {
			values = values || {};

			if (target == undefined || target == null) {
				target = "_blank";
			}
			
			//Set Form-Attributes
			var form = document.createElement("form");
			form.setAttribute("action", url);
			form.setAttribute("method", "POST");
			form.setAttribute("style", "display: none");
			form.setAttribute("target", target);
			
			//For each property in Values create a hidden element
			for (var property in values)
			{
				if (values.hasOwnProperty(property))
				{
					var value = values[property];
					if (value instanceof Array)
					{
						for (var i = 0, l = value.length; i < l; i++)
						{
							//Create hidden Elemet
							var child = document.createElement("input");
							child.setAttribute("type", "hidden");
							child.setAttribute("name", property);
							child.setAttribute("value", value[i]);
							form.appendChild(child);
						}
					}
					else
					{
							//Create hidden Elemet
							var child = document.createElement("input");
							child.setAttribute("type", "hidden");
							child.setAttribute("name", property);
							child.setAttribute("value", value);
							form.appendChild(child);
					}
				}
			}
			
			//Set form and submit it
			document.body.appendChild(form);
			form.submit();
			document.body.removeChild(form);
		},
		
		numberComparer : function(number1, number2) {
			return number2 - number1;
		},
		
		/**
		 * Returns the position of the child or the position where to insert
		 * the child to be in order.
		 */
		binarySearch : function(collection, child, comparerFunc) {
			if (collection.length == 0) {
				return 0;
			}
			
			var upperLimit = collection.length - 1;
			var lowerLimit = 0;
			var compareResult = -1;
			var current = 0;
			var currentNode;

			while (upperLimit > lowerLimit && compareResult != 0)
			{
				current = parseInt((upperLimit + lowerLimit) / 2);

				currentNode = collection[current];
				compareResult = comparerFunc(currentNode, child);

				if (compareResult > 0)
				{
					upperLimit = current - 1;
				}
				else if (compareResult < 0)
				{
					lowerLimit = current + 1;
				}
			}
			current = parseInt((upperLimit + lowerLimit) / 2);

			currentNode = collection[current];
			compareResult = compareResult = comparerFunc(currentNode, child);

			if (compareResult < 0)
			{
				current++;
			}
			return current;
		}
	}

});
