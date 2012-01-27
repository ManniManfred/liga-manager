//
// Copyright (c) 2011 Mensch und Maschine acadGraph GmbH
//


/**
 * LabeledNumberTextField
 */
qx.Class.define("ligamanager.ui.NumberField",
{
	extend : qx.ui.core.Widget,
	implement : [
		qx.ui.form.INumberForm,
		qx.ui.form.IForm
	],
	include : [
		qx.ui.core.MContentPadding,
		qx.ui.form.MForm
	],
	

	/*
	*****************************************************************************
	STATICS
	*****************************************************************************
	*/

	statics: {

	},


	/*
	*****************************************************************************
	CONSTRUCTOR
	*****************************************************************************
	*/

	/**
	* Creates a new LabeledDateField.
	*/
	construct: function() {
		this.base(arguments);
		
		this._setLayout(new qx.ui.layout.Grow());
		
		this.__textField = new qx.ui.form.TextField();
		this.__textField.setFilter(this._getFilterRegExp());
		this.__textField.setTextAlign("right");
		
		this.__textField.addListener("changeValue", this.__textChanged, this);
		this._add(this.__textField);
		
		this.addListener("changeValid", this.__validChanged, this);
	},




	/*
	*****************************************************************************
	PROPERTIES
	*****************************************************************************
	*/

	properties:
	{
		/** The value of the number field. */
		value:
		{
			check : "Number",
			nullable : true,
			apply : "_applyValue",
			init : null,
			event : "changeValue"
		},
		
		/** Controls the display of the number in the textfield */
		numberFormat :
		{
		  check : "qx.util.format.NumberFormat",
		  apply : "_applyNumberFormat",
		  nullable : true
		}
	},




	/*
	*****************************************************************************
	MEMBERS
	*****************************************************************************
	*/

	members:
	{
		__lastValidValue : null,
		__textField : null,
		
		__getNumberFormat : function() {
			var numberFormat = this.getNumberFormat();
			if (numberFormat == null) {
				numberFormat = new qx.util.format.NumberFormat(qx.locale.Manager.getInstance().getLocale());
			}
			return numberFormat;
		},
		
		__validChanged : function(dataEvent) {
			this.__textField.setValid(this.isValid());
		},
		
		
		__textChanged : function(dataEvent) {
			var strValue = dataEvent.getData();
			
			if (strValue == null || strValue == "") {
				this.setValue(null);
			} else {
				var numberFormat = this.__getNumberFormat();
				
				try {
					var newValue = numberFormat.parse(strValue);
					this.setValue(newValue);
				} catch (ex) {
					// if a error occur on parsing, use the old value.
					this.__textField.setValue(numberFormat.format(this.getValue()));
				}
			}
		},
		
		
		/**
		 * Returns the regular expression used as the text field's filter
		 *
		 * @return {RegExp} The filter RegExp.
		 */
		_getFilterRegExp : function()
		{
			var decimalSeparator = qx.locale.Number.getDecimalSeparator(
				qx.locale.Manager.getInstance().getLocale()
			);
			var groupSeparator = qx.locale.Number.getGroupSeparator(
				qx.locale.Manager.getInstance().getLocale()
			);

			var prefix = "";
			var postfix = "";
			var numberFormat = this.__getNumberFormat();
			prefix = numberFormat.getPrefix() || "";
			postfix = numberFormat.getPostfix() || "";

			var filterRegExp = new RegExp("[0-9" +
				qx.lang.String.escapeRegexpChars(decimalSeparator) +
				qx.lang.String.escapeRegexpChars(groupSeparator) +
				qx.lang.String.escapeRegexpChars(prefix) +
				qx.lang.String.escapeRegexpChars(postfix) +
				"\-]"
			);

			return filterRegExp;
		},
	
	
		/**
		* Apply routine for the value property.
		*
		* It checks the min and max values, disables / enables the
		* buttons and handles the wrap around.
		*
		* @param value {Number} The new value of the spinner
		* @param old {Number} The former value of the spinner
		*/
		_applyValue: function(value, old)
		{
			var textField = this.__textField;

			// save the last valid value of the spinner
			this.__lastValidValue = value;

			// write the value of the spinner to the textfield
			if (value !== null) {
				var numberFormat = this.__getNumberFormat();
				textField.setValue(numberFormat.format(value));
			} else {
				textField.setValue("");
			}
		},


		/**
		* Apply routine for the numberFormat property.<br/>
		* When setting a number format, the display of the
		* value in the textfield will be changed immediately.
		*
		* @param value {Boolean} The new value of the numberFormat property
		* @param old {Boolean} The former value of the numberFormat property
		*/
		_applyNumberFormat : function(value, old) {
			var textfield = this.getChildControl("textfield");
			textfield.setFilter(this._getFilterRegExp());

			this.getNumberFormat().addListener("changeNumberFormat",
				this._onChangeNumberFormat, this);

			this._applyValue(this.__lastValidValue, undefined);
		},
		
		
		 // overridden
		_applyTabIndex : function(value, old) {
			this.base(arguments, value, old);
			
			var textField = this.__textField;
			if (textField != null)
				textField.setTabIndex(value);
		},
		
		
		/**
		 * Callback method for the number format's "changeNumberFormat" event.
		 *
		 * @param ev {qx.event.type.Event} number format change event
		 */
		_onChangeNumberFormat : function(ev) {
			var textfield = this.__textField;
			textfield.setFilter(this._getFilterRegExp());
			textfield.setValue(this.__getNumberFormat().format(this.getValue()));
		}

	}
});
