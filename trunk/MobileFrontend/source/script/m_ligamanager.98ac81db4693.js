/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/**
 * Superclass for formatters and parsers.
 */
qx.Interface.define("qx.util.format.IFormat",
{

  members :
  {
    /**
     * Formats an object.
     *
     * @abstract
     * @param obj {var} The object to format.
     * @return {String} the formatted object.
     * @throws {Error} the abstract function warning.
     */
    format : function(obj) {},


    /**
     * Parses an object.
     *
     * @abstract
     * @param str {String} the string to parse.
     * @return {var} the parsed object.
     * @throws {Error} the abstract function warning.
     */
    parse : function(str) {}
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A formatter and parser for dates, see
 * http://www.unicode.org/reports/tr35/#Date_Format_Patterns
 *
 * Here is a quick overview of the format pattern keys:
 * <table>
 * <tr><th>Key &nbsp;<th>Description
 * <tr><td><code> G </code><td> era, e.g. "AD"
 * <tr><td><code> y </code><td> year
 * <tr><td><code> Y </code><td> week year
 * <tr><td><code> u </code><td> extended year [Not supported yet]
 * <tr><td><code> Q </code><td> quarter
 * <tr><td><code> q </code><td> stand-alone quarter
 * <tr><td><code> M </code><td> month
 * <tr><td><code> L </code><td> stand-alone month
 * <tr><td><code> I </code><td> chinese leap month [Not supported yet]
 * <tr><td><code> w </code><td> week of year
 * <tr><td><code> W </code><td> week of month
 * <tr><td><code> d </code><td> day of month
 * <tr><td><code> D </code><td> day of year
 * <tr><td><code> F </code><td> day of week in month [Not supported yet]
 * <tr><td><code> g </code><td> modified Julian day [Not supported yet]
 * <tr><td><code> E </code><td> day of week
 * <tr><td><code> e </code><td> local day of week
 * <tr><td><code> c </code><td> stand-alone local day of week
 * <tr><td><code> a </code><td> period of day (am or pm)
 * <tr><td><code> h </code><td> 12-hour hour
 * <tr><td><code> H </code><td> 24-hour hour
 * <tr><td><code> K </code><td> hour [0-11]
 * <tr><td><code> k </code><td> hour [1-24]
 * <tr><td><code> j </code><td> special symbol [Not supported yet]
 * <tr><td><code> m </code><td> minute
 * <tr><td><code> s </code><td> second
 * <tr><td><code> S </code><td> fractional second
 * <tr><td><code> A </code><td> millisecond in day [Not supported yet]
 * <tr><td><code> z </code><td> time zone, specific non-location format
 * <tr><td><code> Z </code><td> time zone, rfc822/gmt format
 * <tr><td><code> v </code><td> time zone, generic non-location format [Not supported yet]
 * <tr><td><code> V </code><td> time zone, like z except metazone abbreviations [Not supported yet]
 * </table>
 *
 * (This list is preliminary, not all format keys might be implemented). Most
 * keys support repetitions that influence the meaning of the format. Parts of the
 * format string that should not be interpreted as format keys have to be
 * single-quoted.
 *
 * The same format patterns will be used for both parsing and output formatting.
 */
qx.Class.define("qx.util.format.DateFormat",
{
  extend : qx.core.Object,
  implement : qx.util.format.IFormat,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param format {String|null} The format to use. If null, the locale's default
   * format is used.
   * @param locale {String?} optional locale to be used. In case this is not present, the {@link #locale} property of DateFormat
   * will be following the {@link qx.locale.Manager#locale} property of qx.locale.Manager
   */
  construct : function(format, locale)
  {
    this.base(arguments);

    if (!locale)
    {
      this.__locale = qx.locale.Manager.getInstance().getLocale();
      this.__bindingId = qx.locale.Manager.getInstance().bind("locale", this, "locale");
    }
    else
    {
      this.__locale = locale;
      this.setLocale(locale);
    }

    this.__initialLocale = this.__locale;

    if (format != null)
    {
      this.__format = format.toString();
      if(this.__format in qx.util.format.DateFormat.ISO_MASKS)
      {
        if(this.__format === 'isoUtcDateTime') {
          this.__UTC = true;
        }
        this.__format = qx.util.format.DateFormat.ISO_MASKS[this.__format];
      }
    } else
    {
      this.__format = qx.locale.Date.getDateFormat("long", this.__locale) + " " + qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss", this.__locale);
    }
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /** The locale used in this DateFormat instance*/
    locale :
    {
      apply : "_applyLocale",
      nullable : true,
      check : "String"
    }
  },

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Convenience factory that returns a <code>DateFomat</code> instance that
     * uses a short date-only format. Beware that the overall layout of the
     * date/time format string is that of the locale in effect when the factory
     * function is called.
     *
     * Implemented as a quasi-singleton, so beware of side effects.
     *
     * @return {DateFormat} a DateFormat instance.
     */
    getDateInstance : function()
    {
      var DateFormat = qx.util.format.DateFormat;

      var format = qx.locale.Date.getDateFormat("short") + "";

      // Memoizing the instance, so caller doesn't have to dispose it.
      if (DateFormat._dateInstance == null || DateFormat._dateInstance.__format != format) {
        DateFormat._dateInstance = new DateFormat(format);
      }

      return DateFormat._dateInstance;
    },


    /**
     * Convenience factory that returns a <code>DateFomat</code> instance that
     * uses a long date/time format. Beware that the overall layout of the
     * date/time format string is that of the locale in effect when the factory
     * function is called.
     *
     * Implemented as a quasi-singleton, so beware of side effects.
     *
     * @return {DateFormat} a DateFormat instance.
     */
    getDateTimeInstance : function()
    {
      var DateFormat = qx.util.format.DateFormat;

      var format = qx.locale.Date.getDateFormat("long") + " " + qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss");

      // Memoizing the instance, so caller doesn't have to dispose it.
      if (DateFormat._dateTimeInstance == null || DateFormat._dateTimeInstance.__format != format) {
        DateFormat._dateTimeInstance = new DateFormat(format);
      }

      return DateFormat._dateTimeInstance;
    },


    /**
     * {Integer} The threshold until when a year should be assumed to belong to the
     * 21st century (e.g. 12 -> 2012). Years over this threshold but below 100 will be
     * assumed to belong to the 20th century (e.g. 88 -> 1988). Years over 100 will be
     * used unchanged (e.g. 1792 -> 1792).
     */
    ASSUME_YEAR_2000_THRESHOLD : 30,

    /**
     * {String} The date format used for logging.
     * @deprecated {2.1}
     */
    LOGGING_DATE_TIME__format : "yyyy-MM-dd HH:mm:ss",

    /** Special masks of patterns that are used frequently*/
    ISO_MASKS : {
      isoDate :        "yyyy-MM-dd",
      isoTime :        "HH:mm:ss",
      isoDateTime :    "yyyy-MM-dd'T'HH:mm:ss",
      isoUtcDateTime : "yyyy-MM-dd'T'HH:mm:ss'Z'"
    },

    /** {String} The am marker. */
    AM_MARKER : "am",

    /** {String} The pm marker. */
    PM_MARKER : "pm"

  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __bindingId : null,
    __locale : null,
    __initialLocale : null,
    __format : null,
    __parseFeed : null,
    __parseRules : null,
    __formatTree : null,
    __UTC : null,

    /**
     * Fills a number with leading zeros ("25" -> "0025").
     *
     * @param number {Integer} the number to fill.
     * @param minSize {Integer} the minimum size the returned string should have.
     * @return {String} the filled number as string.
     */
    __fillNumber : function(number, minSize)
    {
      var str = "" + (number < 0 ? ((-1) * number) : number);

      while (str.length < minSize) {
        str = "0" + str;
      }

      return number < 0 ? "-" + str : str;
    },


    /**
     * Returns the day in year of a date.
     *
     * @param date {Date} the date.
     * @return {Integer} the day in year.
     */
    __getDayInYear : function(date)
    {
      var helpDate = new Date(date.getTime());
      var day = helpDate.getDate();

      while (helpDate.getMonth() != 0)
      {
        // Set the date to the last day of the previous month
        helpDate.setDate(-1);
        day += helpDate.getDate() + 1;
      }

      return day;
    },


    /**
     * Returns the thursday in the same week as the date.
     *
     * @param date {Date} the date to get the thursday of.
     * @return {Date} the thursday in the same week as the date.
     */
    __thursdayOfSameWeek : function(date) {
      return new Date(date.getTime() + (3 - ((date.getDay() + 6) % 7)) * 86400000);
    },


    /**
     * Returns the week in year of a date.
     *
     * @param date {Date} the date to get the week in year of.
     * @return {Integer} the week in year.
     */
    __getWeekInYear : function(date)
    {
      // This algorithm gets the correct calendar week after ISO 8601.
      // This standard is used in almost all european countries.
      // TODO: In the US week in year is calculated different!
      // See http://www.merlyn.demon.co.uk/weekinfo.htm
      // The following algorithm comes from http://www.salesianer.de/util/kalwoch.html
      // Get the thursday of the week the date belongs to
      var thursdayDate = this.__thursdayOfSameWeek(date);

      // Get the year the thursday (and therefore the week) belongs to
      var weekYear = thursdayDate.getFullYear();

      // Get the thursday of the week january 4th belongs to
      // (which defines week 1 of a year)
      var thursdayWeek1 = this.__thursdayOfSameWeek(new Date(weekYear, 0, 4));

      // Calculate the calendar week
      return Math.floor(1.5 + (thursdayDate.getTime() - thursdayWeek1.getTime()) / 86400000 / 7);
    },

    /**
     * Returns the week in month of a date.
     *
     * @param date {Date} the date to get the week in year of.
     * @return {Integer} the week in month.
     */
    __getWeekInMonth : function(date)
    {
      var thursdayDate = this.__thursdayOfSameWeek(date);
      var thursdayWeek1 = this.__thursdayOfSameWeek(new Date(date.getFullYear(), date.getMonth(), 4));
      return Math.floor(1.5 + (thursdayDate.getTime() - thursdayWeek1.getTime()) / 86400000 / 7);
    },

    /**
     * Returns the week year of a date. (that is the year of the week where this date happens to be)
     * For a week in the middle of the summer, the year is easily obtained, but for a week
     * when New Year's Eve takes place, the year of that week is ambigous.
     * The thursday day of that week is used to determine the year.
     *
     * @param date {Date} the date to get the week in year of.
     * @return {Integer} the week year.
     */
    __getWeekYear : function(date)
    {
      var thursdayDate = this.__thursdayOfSameWeek(date);
      return thursdayDate.getFullYear();
    },

    /**
     * Returns true if the year is a leap one.
     *
     * @param year {Integer} the year to check.
     * @return {Boolean} true if it is a leap year.
     */
    __isLeapYear : function(year)
    {
      var februaryDate = new Date(year,2,1);
      februaryDate.setDate(-1);
      return februaryDate.getDate() + 1 === 29;
    },

    /**
     * Returns a json object with month and day as keys.
     *
     * @param dayOfYear {Integer} the day of year.
     * @param year {Integer} the year to check.
     * @return {Object} a json object {month: M, day: D}.
     */
    __getMonthAndDayFromDayOfYear : function(dayOfYear,year)
    {
      var month = 0;
      var day = 0;
      // if we don't know the year, we take a non-leap year'
      if(!year) {
        year = 1971;
      }
      var dayCounter = 0;
      for(var i=1; i <= 12; i++)
      {
        var tempDate = new Date(year,i,1);
        tempDate.setDate(-1);
        var days = tempDate.getDate() + 1;
        dayCounter += days;
        if(dayCounter < dayOfYear)
        {
          month++;
          day += days;
        }
        else
        {
          day = dayOfYear - (dayCounter-days);
          break;
        }
      }

      return {month: month,day: day};
    },

    /**
     * Returns the year of a date when we know the week year
     *
     * @param weekYear {Integer} the week year.
     * @param month {Integer} the month
     * @param dayOfMonth {Integer} the day in month
     * @return {Integer} the year.
     */
    __getYearFromWeekYearAndMonth : function(weekYear, month, dayOfMonth)
    {
      var year;
      switch(month){
        case 11 :
          year = weekYear - 1;
          if (weekYear != this.__getWeekYear(new Date(year,month,dayOfMonth))) {
            year = weekYear;
          }
        break;
        case 0 :
          year = weekYear + 1;
          if (weekYear != this.__getWeekYear(new Date(year,month,dayOfMonth))) {
            year = weekYear;
          }
        break;
        default :
          year = weekYear;
      }
      return year;
    },

    /**
     * Applies the new value for locale property
     * @param value {String} The new value.
     * @param old {String} The old value.
     *
     */
    _applyLocale : function(value, old)
    {
      this.__locale = value === null ? this.setLocale(this.__initialLocale) : value;
    },

    /**
     * Formats a date.
     *
     * @param date {Date} The date to format.
     * @return {String} the formatted date.
     */
    format : function(date)
    {
      // check for null dates
      if (date == null) {
        return null;
      }

      if(isNaN(date.getTime())) {
        if (qx.core.Environment.get("qx.debug")) {
          qx.log.Logger.error("Provided date is invalid");
        }
        return null;
      }

      if(this.__UTC) {
        date = new Date(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate(),date.getUTCHours(),date.getUTCMinutes(),date.getUTCSeconds(),date.getUTCMilliseconds());
      }

      var locale = this.__locale;

      var fullYear = date.getFullYear();
      var month = date.getMonth();
      var dayOfMonth = date.getDate();
      var dayOfWeek = date.getDay();
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var seconds = date.getSeconds();
      var ms = date.getMilliseconds();

      var timezoneOffset = date.getTimezoneOffset();
      var timezoneSign = timezoneOffset > 0 ? 1 : -1;
      var timezoneHours = Math.floor(Math.abs(timezoneOffset) / 60);
      var timezoneMinutes = Math.abs(timezoneOffset) % 60;

      // Create the output
      this.__initFormatTree();
      var output = "";

      for (var i=0; i<this.__formatTree.length; i++)
      {
        var currAtom = this.__formatTree[i];

        if (currAtom.type == "literal") {
          output += currAtom.text;
        }
        else
        {
          // This is a wildcard
          var wildcardChar = currAtom.character;
          var wildcardSize = currAtom.size;

          // Get its replacement
          var replacement = "?";

          switch(wildcardChar)
          {
              // TODO: F - Day of week in month (e.g.   2). Problem: What is this?
            case 'y': // Year
              if (wildcardSize == 2) {
                replacement = this.__fillNumber(fullYear % 100, 2);
              } else {
                var year = Math.abs(fullYear);
                replacement = year + "";
                if (wildcardSize > replacement.length) {
                  for (var j = replacement.length; j < wildcardSize; j++) {
                    replacement = "0" + replacement;
                  };
                }
                if(fullYear < 0) {
                  replacement = "-" + replacement;
                }
              }

              break;

            case 'Y': // Year
              replacement = this.__getWeekYear(date) + "";
              var year = replacement.replace('-','');
              if (wildcardSize > replacement.length) {
                for (var j = year.length; j < wildcardSize; j++) {
                  year = "0" + year;
                };
              }
              replacement = replacement.indexOf("-") != -1 ? "-" + year : year;

              break;

            case 'G': // Era - there is no CLDR data for ERA yet
              if (wildcardSize >= 1 && wildcardSize <= 3) {
                replacement = fullYear > 0 ? 'AD' : 'BC';
              }
              else if(wildcardSize == 4) {
                replacement = fullYear > 0 ? 'Anno Domini' : 'Before Christ';
              }
              else if(wildcardSize == 5) {
                replacement = fullYear > 0 ? 'A' : 'B';
              }

              break;

            case 'Q': // quarter
              if (wildcardSize == 1 || wildcardSize == 2) {
                replacement = this.__fillNumber(parseInt(month/4) + 1, wildcardSize);
              }
              if(wildcardSize == 3) {
                replacement = 'Q' + (parseInt(month/4) + 1);
              }

              break;

            case 'q': // quarter stand alone
              if (wildcardSize == 1 || wildcardSize == 2) {
                replacement = this.__fillNumber(parseInt(month/4) + 1, wildcardSize);
              }
              if(wildcardSize == 3) {
                replacement = 'Q' + (parseInt(month/4) + 1);
              }

              break;

            case 'D': // Day in year (e.g. 189)
              replacement = this.__fillNumber(this.__getDayInYear(date), wildcardSize);
              break;

            case 'd': // Day in month
              replacement = this.__fillNumber(dayOfMonth, wildcardSize);
              break;

            case 'w': // Week in year (e.g. 27)
              replacement = this.__fillNumber(this.__getWeekInYear(date), wildcardSize);
              break;

            case 'W': // Week in year (e.g. 27)
              replacement = this.__getWeekInMonth(date);
              break;

            case 'E': // Day in week
              if (wildcardSize >= 1 && wildcardSize <= 3) {
                replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format", true);
              } else if (wildcardSize == 4) {
                replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "format", true);
              } else if (wildcardSize == 5) {
                replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "format", true);
              }

              break;

            case 'e': // Day in week
              var startOfWeek = qx.locale.Date.getWeekStart(locale);
              // the index is 1 based
              var localeDayOfWeek = 1 + ((dayOfWeek - startOfWeek >=0) ? (dayOfWeek - startOfWeek) : 7 + (dayOfWeek-startOfWeek));
              if (wildcardSize >= 1 && wildcardSize <= 2) {
                replacement = this.__fillNumber(localeDayOfWeek, wildcardSize);
              } else if (wildcardSize == 3) {
                replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format", true);
              } else if (wildcardSize == 4) {
                replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "format", true);
              } else if (wildcardSize == 5) {
                replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "format", true);
              }

              break;

            case 'c': // Stand-alone local day in week
              var startOfWeek = qx.locale.Date.getWeekStart(locale);
              // the index is 1 based
              var localeDayOfWeek = 1 + ((dayOfWeek - startOfWeek >=0) ? (dayOfWeek - startOfWeek) : 7 + (dayOfWeek-startOfWeek));
              if (wildcardSize == 1) {
                replacement = ''+localeDayOfWeek;
              } else if (wildcardSize == 3) {
                replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "stand-alone", true);
              } else if (wildcardSize == 4) {
                replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "stand-alone", true);
              } else if (wildcardSize == 5) {
                replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "stand-alone", true);
              }

              break;

            case 'M': // Month
              if (wildcardSize == 1 || wildcardSize == 2) {
                replacement = this.__fillNumber(month + 1, wildcardSize);
              } else if (wildcardSize == 3) {
                replacement = qx.locale.Date.getMonthName("abbreviated", month, locale, "format", true);
              } else if (wildcardSize == 4) {
                replacement = qx.locale.Date.getMonthName("wide", month, locale, "format", true);
              } else if (wildcardSize == 5) {
                replacement = qx.locale.Date.getMonthName("narrow", month, locale, "format", true);

              }

              break;

            case 'L': // Stand-alone month
              if (wildcardSize == 1 || wildcardSize == 2) {
                replacement = this.__fillNumber(month + 1, wildcardSize);
              } else if (wildcardSize == 3) {
                replacement = qx.locale.Date.getMonthName("abbreviated", month, locale, "stand-alone", true);
              } else if (wildcardSize == 4) {
                replacement = qx.locale.Date.getMonthName("wide", month, locale, "stand-alone", true);
              } else if (wildcardSize == 5) {
                replacement = qx.locale.Date.getMonthName("narrow", month, locale, "stand-alone", true);
              }

              break;

            case 'a': // am/pm marker
              // NOTE: 0:00 is am, 12:00 is pm
              replacement = (hours < 12) ? qx.locale.Date.getAmMarker(locale) : qx.locale.Date.getPmMarker(locale);
              break;

            case 'H': // Hour in day (0-23)
              replacement = this.__fillNumber(hours, wildcardSize);
              break;

            case 'k': // Hour in day (1-24)
              replacement = this.__fillNumber((hours == 0) ? 24 : hours, wildcardSize);
              break;

            case 'K': // Hour in am/pm (0-11)
              replacement = this.__fillNumber(hours % 12, wildcardSize);
              break;

            case 'h': // Hour in am/pm (1-12)
              replacement = this.__fillNumber(((hours % 12) == 0) ? 12 : (hours % 12), wildcardSize);
              break;

            case 'm': // Minute in hour
              replacement = this.__fillNumber(minutes, wildcardSize);
              break;

            case 's': // Second in minute
              replacement = this.__fillNumber(seconds, wildcardSize);
              break;

            case 'S': // Fractional second
              replacement = this.__fillNumber(ms, 3);
              if (wildcardSize < replacement.length) {
                replacement = replacement.substr(0, wildcardSize);
              } else {
                while (wildcardSize > replacement.length) {
                  // if needed, fill the remaining wildcard length with trailing zeros
                  replacement += "0";
                }
              }
              break;

            case 'z': // Time zone
              if (wildcardSize >= 1 && wildcardSize <= 4)
              {
                replacement =
                "GMT" +
                ((timezoneSign > 0) ? "-" : "+") +
                this.__fillNumber(Math.abs(timezoneHours), 2) +
                ":" + this.__fillNumber(timezoneMinutes, 2);
              }

              break;

            case 'Z': // RFC 822 time zone
              if (wildcardSize >= 1 && wildcardSize <= 3)
              {
              replacement =
                ((timezoneSign > 0) ? "-" : "+") +
                this.__fillNumber(Math.abs(timezoneHours), 2) +
                this.__fillNumber(timezoneMinutes, 2);
              }
              else
              {
                replacement =
                "GMT" +
                ((timezoneSign > 0) ? "-" : "+") +
                this.__fillNumber(Math.abs(timezoneHours), 2) +
                ":" + this.__fillNumber(timezoneMinutes, 2);
              }
              break;
          }

          output += replacement;
        }
      }

      return output;
    },


    /**
     * Parses a date.
     *
     * @param dateStr {String} the date to parse.
     * @return {Date} the parsed date.
     * @throws {Error} If the format is not well formed or if the date string does not
     *       match to the format.
     */
    parse : function(dateStr)
    {
      this.__initParseFeed();

      // Apply the regex
      var hit = this.__parseFeed.regex.exec(dateStr);

      if (hit == null) {
        throw new Error("Date string '" + dateStr + "' does not match the date format: " + this.__format);
      }

      // Apply the rules
      var dateValues =
      {
        era         : 1,
        year        : 1970,
        quarter     : 1,
        month       : 0,
        day         : 1,
        dayOfYear   : 1,
        hour        : 0,
        ispm        : false,
        weekDay     : 4,
        weekYear    : 1970,
        weekOfMonth : 1,
        weekOfYear  : 1,
        min         : 0,
        sec         : 0,
        ms          : 0
      };

      var currGroup = 1;
      var applyWeekYearAfterRule = false;
      var applyDayOfYearAfterRule = false;

      for (var i=0; i<this.__parseFeed.usedRules.length; i++)
      {
        var rule = this.__parseFeed.usedRules[i];

        var value = hit[currGroup];

        if (rule.field != null) {
          dateValues[rule.field] = parseInt(value, 10);
        } else {
          rule.manipulator(dateValues, value, rule.pattern);
        }

        if(rule.pattern == "Y+")
        {
          var yearRuleApplied = false;
          for(var k=0; k<this.__parseFeed.usedRules.length; k++) {
            if(this.__parseFeed.usedRules[k].pattern == 'y+'){
              yearRuleApplied = true;
              break;
            }
          }
          if(!yearRuleApplied) {
            applyWeekYearAfterRule = true;
          }
        }

        if(rule.pattern.indexOf("D") != -1)
        {
          var dayRuleApplied = false;
          for(var k=0; k<this.__parseFeed.usedRules.length; k++) {
            if(this.__parseFeed.usedRules[k].pattern.indexOf("d") != -1){
              dayRuleApplied = true;
              break;
            }
          }
          if(!dayRuleApplied) {
            applyDayOfYearAfterRule = true;
          }
        }

        currGroup += (rule.groups == null) ? 1 : rule.groups;
      }
      if(applyWeekYearAfterRule) {
        dateValues.year = this.__getYearFromWeekYearAndMonth(dateValues.weekYear,dateValues.month,dateValues.day);
      }

      if(applyDayOfYearAfterRule)
      {
        var dayAndMonth = this.__getMonthAndDayFromDayOfYear(dateValues.dayOfYear, dateValues.year);
        dateValues.month = dayAndMonth.month;
        dateValues.day = dayAndMonth.day;
      }

      if(dateValues.era < 0 && (dateValues.year * dateValues.era < 0)) {
        dateValues.year = dateValues.year * dateValues.era;
      }

      var date = new Date(dateValues.year, dateValues.month, dateValues.day, (dateValues.ispm) ? (dateValues.hour + 12) : dateValues.hour, dateValues.min, dateValues.sec, dateValues.ms);

      if(this.__UTC) {
        date = new Date(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate(),date.getUTCHours(),date.getUTCMinutes(),date.getUTCSeconds(),date.getUTCMilliseconds());
      }

      if (dateValues.month != date.getMonth() || dateValues.year != date.getFullYear())
      {
        // TODO: check if this is also necessary for the time components
        throw new Error("Error parsing date '" + dateStr + "': the value for day or month is too large");
      }

      return date;
    },


    /**
     * Helper method for {@link #format()} and {@link #parse()}.
     * Parses the date format.
     *
     */
    __initFormatTree : function()
    {
      if (this.__formatTree != null) {
        return;
      }

      this.__formatTree = [];

      var currWildcardChar;
      var currWildcardSize = 0;
      var currLiteral = "";
      var format = this.__format;

      var state = "default";

      var i = 0;

      while (i < format.length)
      {
        var currChar = format.charAt(i);

        switch(state)
        {
          case "quoted_literal":
            // We are now inside a quoted literal
            // Check whether the current character is an escaped "'" character
            if (currChar == "'")
            {
              if (i + 1 >= format.length)
              {

                // this is the last character
                i++;

                break;
              }

              var lookAhead = format.charAt(i + 1);

              if (lookAhead == "'")
              {
                currLiteral += currChar;
                i++;
              }
              else
              {

                // quoted literal ends
                i++;

                state = "unkown";
              }
            }
            else
            {
              currLiteral += currChar;
              i++;
            }

            break;

          case "wildcard":
            // Check whether the currChar belongs to that wildcard
            if (currChar == currWildcardChar)
            {
              // It does -> Raise the size
              currWildcardSize++;

              i++;
            }
            else
            {
              // It does not -> The current wildcard is done
              this.__formatTree.push(
              {
                type      : "wildcard",
                character : currWildcardChar,
                size      : currWildcardSize
              });

              currWildcardChar = null;
              currWildcardSize = 0;
              state = "default";
            }

            break;

          default:
            // We are not (any more) in a wildcard or quoted literal -> Check what's starting here
            if ((currChar >= 'a' && currChar <= 'z') || (currChar >= 'A' && currChar <= 'Z'))
            {
              // This is a letter -> All letters are wildcards
              // Start a new wildcard
              currWildcardChar = currChar;
              state = "wildcard";
            }
            else if (currChar == "'")
            {
              if (i + 1 >= format.length)
              {
                // this is the last character
                currLiteral += currChar;
                i++;
                break;
              }

              var lookAhead = format.charAt(i + 1);

              if (lookAhead == "'")
              {
                currLiteral += currChar;
                i++;
              }

              i++;
              state = "quoted_literal";
            }
            else
            {
              state = "default";
            }

            if (state != "default")
            {
              // Add the literal
              if (currLiteral.length > 0)
              {
                this.__formatTree.push(
                {
                  type : "literal",
                  text : currLiteral
                });

                currLiteral = "";
              }
            }
            else
            {
              // This is an unquoted literal -> Add it to the current literal
              currLiteral += currChar;
              i++;
            }

            break;
        }
      }

      // Add the last wildcard or literal
      if (currWildcardChar != null)
      {
        this.__formatTree.push(
        {
          type      : "wildcard",
          character : currWildcardChar,
          size      : currWildcardSize
        });
      }
      else if (currLiteral.length > 0)
      {
        this.__formatTree.push(
        {
          type : "literal",
          text : currLiteral
        });
      }
    },


    /**
     * Initializes the parse feed.
     *
     * The parse contains everything needed for parsing: The regular expression
     * (in compiled and uncompiled form) and the used rules.
     *
     * @throws {Error} If the date format is malformed.
     */
    __initParseFeed : function()
    {
      if (this.__parseFeed != null)
      {
        // We already have the parse feed
        return;
      }

      var format = this.__format;

      // Initialize the rules
      this.__initParseRules();
      this.__initFormatTree();

      // Get the used rules and construct the regex pattern
      var usedRules = [];
      var pattern = "^";

      for (var atomIdx=0; atomIdx<this.__formatTree.length; atomIdx++)
      {
        var currAtom = this.__formatTree[atomIdx];

        if (currAtom.type == "literal") {
          pattern += qx.lang.String.escapeRegexpChars(currAtom.text);
        }
        else
        {
          // This is a wildcard
          var wildcardChar = currAtom.character;
          var wildcardSize = currAtom.size;

          // Get the rule for this wildcard
          var wildcardRule;

          for (var ruleIdx=0; ruleIdx<this.__parseRules.length; ruleIdx++)
          {
            var rule = this.__parseRules[ruleIdx];

            if ( this.__isRuleForWildcard(rule,wildcardChar,wildcardSize))
            {
              // We found the right rule for the wildcard
              wildcardRule = rule;
              break;
            }
          }

          // Check the rule
          if (wildcardRule == null)
          {
            // We have no rule for that wildcard -> Malformed date format
            var wildcardStr = "";

            for (var i=0; i<wildcardSize; i++) {
              wildcardStr += wildcardChar;
            }

            throw new Error("Malformed date format: " + format + ". Wildcard " + wildcardStr + " is not supported");
          }
          else
          {
            // Add the rule to the pattern
            usedRules.push(wildcardRule);
            pattern += wildcardRule.regex;
          }
        }
      }

      pattern += "$";

      // Create the regex
      var regex;

      try {
        regex = new RegExp(pattern);
      } catch(exc) {
        throw new Error("Malformed date format: " + format);
      }

      // Create the this.__parseFeed
      this.__parseFeed =
      {
        regex       : regex,
        "usedRules" : usedRules,
        pattern     : pattern
      };
    },

    /**
     * Checks wether the rule matches the wildcard or not.
     * @param rule {Object} the rule we try to match with the wildcard
     * @param wildcardChar {String} the character in the wildcard
     * @param wildcardSize {Integer} the number of  wildcardChar characters in the wildcard
     * @return {Boolean} if the rule matches or not
     */
    __isRuleForWildcard : function(rule, wildcardChar, wildcardSize)
    {
      if(wildcardChar==='y' && rule.pattern==='y+')
      {
        rule.regex = rule.regexFunc(wildcardSize);
        return true;
      }
      else if(wildcardChar==='Y' && rule.pattern==='Y+')
      {
        rule.regex = rule.regexFunc(wildcardSize);
        return true;
      }
      else
      {
        return wildcardChar == rule.pattern.charAt(0) && wildcardSize == rule.pattern.length;
      }
    },
    /**
     * Initializes the static parse rules.
     *
     */
    __initParseRules : function()
    {
      var DateFormat = qx.util.format.DateFormat;
      var LString = qx.lang.String;

      if (this.__parseRules != null)
      {
        // The parse rules are already initialized
        return ;
      }

      var rules = this.__parseRules = [];

      var amMarker = qx.locale.Date.getAmMarker(this.__locale).toString() || DateFormat.AM_MARKER;
      var pmMarker = qx.locale.Date.getPmMarker(this.__locale).toString() || DateFormat.PM_MARKER;
      var locale = this.__locale;

      var yearManipulator = function(dateValues, value)
      {
        value = parseInt(value, 10);

        if(value > 0)
        {
          if (value < DateFormat.ASSUME_YEAR_2000_THRESHOLD) {
            value += 2000;
          } else if (value < 100) {
            value += 1900;
          }
        }

        dateValues.year = value;
      };

      var weekYearManipulator = function(dateValues, value)
      {
        value = parseInt(value, 10);

        if(value > 0)
        {
          if (value < DateFormat.ASSUME_YEAR_2000_THRESHOLD) {
            value += 2000;
          } else if (value < 100) {
            value += 1900;
          }
        }

        dateValues.weekYear = value;
      };

      var monthManipulator = function(dateValues, value) {
        dateValues.month = parseInt(value, 10) - 1;
      };

      var localWeekDayManipulator = function(dateValues, value) {
        var startOfWeek = qx.locale.Date.getWeekStart(locale);
        var dayOfWeek =  (parseInt(value,10) - 1 + startOfWeek) <= 6 ? parseInt(value,10) - 1 + startOfWeek : (parseInt(value,10) - 1 + startOfWeek) -7;
        dateValues.weekDay = dayOfWeek;
      }

      var ampmManipulator = function(dateValues, value) {
        var pmMarker = qx.locale.Date.getPmMarker(locale).toString() || DateFormat.PM_MARKER;
        dateValues.ispm = (value == pmMarker);
      };

      var noZeroHourManipulator = function(dateValues, value) {
        dateValues.hour = parseInt(value, 10) % 24;
      };

      var noZeroAmPmHourManipulator = function(dateValues, value) {
        dateValues.hour = parseInt(value, 10) % 12;
      };

      var ignoreManipulator = function(dateValues, value) {
        return;
      };

      var narrowEraNames = ['A', 'B'];
      var narrowEraNameManipulator = function(dateValues, value) {
        dateValues.era = value == 'A' ? 1 : -1;
      }

      var abbrevEraNames = ['AD', 'BC'];
      var abbrevEraNameManipulator = function(dateValues, value) {
        dateValues.era = value == 'AD' ? 1 : -1;
      }

      var fullEraNames = ['Anno Domini', 'Before Christ'];
      var fullEraNameManipulator = function(dateValues, value) {
        dateValues.era = value == 'Anno Domini' ? 1 : -1;
      }

      var abbrevQuarterNames = ['Q1','Q2','Q3','Q4'];
      var abbrevQuarterManipulator = function(dateValues, value) {
        dateValues.quarter = abbrevQuarterNames.indexOf(value);
      }

      var fullQuarterNames = ['1st quarter','2nd quarter','3rd quarter','4th quarter'];
      var fullQuarterManipulator = function(dateValues, value) {
        dateValues.quarter = fullQuarterNames.indexOf(value);
      }

      var cache = {};

      var dateNamesManipulator = function(pattern){
        var monthPatternLetters = ['L','M'];
        var dayPatternLetters = ['c', 'e', 'E'];
        var firstLetterInPattern = pattern.charAt(0);
        var isMonth = monthPatternLetters.indexOf(firstLetterInPattern)>=0;

        var getContext = function() {
          var letters = isMonth ? monthPatternLetters : dayPatternLetters;
          var context = firstLetterInPattern === letters[0] ? "stand-alone" : "format" ;
          var patternLength = pattern.length;
          var lengthName = 'abbreviated';
          switch(patternLength)
          {
            case 4:
              lengthName = 'wide';
              break;
            case 5:
              lengthName = 'narrow';
              break;
            default:
              lengthName = 'abbreviated';
          }
          return [context, lengthName];
        }

        if(!cache[pattern])
        {
          cache[pattern] = {};
          var context = getContext();
          var func = isMonth ? qx.locale.Date.getMonthNames : qx.locale.Date.getDayNames;
          var names = func.call(qx.locale.Date, context[1], locale, context[0], true);
          for(var i=0, l=names.length; i<l; i++)
          {
            names[i] = LString.escapeRegexpChars(names[i].toString());
          }
          cache[pattern].data = names;
          cache[pattern].func = function(dateValues, value)
          {
            value = LString.escapeRegexpChars(value);
            dateValues[isMonth ? 'month' : 'weekDay'] = names.indexOf(value);
          }
        }

        return cache[pattern];
      }

      // Unsupported: F (Day of week in month)

      rules.push(
      {
        pattern     : "y+",
        regexFunc       : function(yNumber)
          {
            var regex = "(-*";
            for(var i=0;i<yNumber;i++)
            {
              regex += "\\d";
              if(i===yNumber-1 && i!==1) {
                regex += "+?";
              }
            }
            regex += ")";
            return regex;
          },
        manipulator : yearManipulator
      });

      rules.push(
      {
        pattern     : "Y+",
        regexFunc       : function(yNumber)
          {
            var regex = "(-*";
            for(var i=0;i<yNumber;i++)
            {
              regex += "\\d";
              if(i===yNumber-1) {
                regex += "+?";
              }
            }
            regex += ")";
            return regex;
          },
        manipulator : weekYearManipulator
      });

      rules.push(
      {
        pattern     : "G",
        regex       : "(" + abbrevEraNames.join("|") + ")",
        manipulator : abbrevEraNameManipulator
      });

      rules.push(
      {
        pattern     : "GG",
        regex       : "(" + abbrevEraNames.join("|") + ")",
        manipulator : abbrevEraNameManipulator
      });

      rules.push(
      {
        pattern     : "GGG",
        regex       : "(" + abbrevEraNames.join("|") + ")",
        manipulator : abbrevEraNameManipulator
      });

      rules.push(
      {
        pattern     : "GGGG",
        regex       : "(" + fullEraNames.join("|") + ")",
        manipulator : fullEraNameManipulator
      });

      rules.push(
      {
        pattern     : "GGGGG",
        regex       : "(" + narrowEraNames.join("|") + ")",
        manipulator : narrowEraNameManipulator
      });

      rules.push(
      {
        pattern     : "Q",
        regex       : "(\\d\\d*?)",
        field : "quarter"
      });

      rules.push(
      {
        pattern     : "QQ",
        regex       : "(\\d\\d?)",
        field : "quarter"
      });

      rules.push(
      {
        pattern     : "QQQ",
        regex       : "(" + abbrevQuarterNames.join("|") + ")",
        manipulator : abbrevQuarterManipulator
      });

      rules.push(
      {
        pattern     : "QQQQ",
        regex       : "(" + fullQuarterNames.join("|") + ")",
        manipulator : fullQuarterManipulator
      });

      rules.push(
      {
        pattern     : "q",
        regex       : "(\\d\\d*?)",
        field : "quarter"
      });

      rules.push(
      {
        pattern     : "qq",
        regex       : "(\\d\\d?)",
        field : "quarter"
      });

      rules.push(
      {
        pattern     : "qqq",
        regex       : "(" + abbrevQuarterNames.join("|") + ")",
        manipulator : abbrevQuarterManipulator
      });

      rules.push(
      {
        pattern     : "qqqq",
        regex       : "(" + fullQuarterNames.join("|") + ")",
        manipulator : fullQuarterManipulator
      });

      rules.push(
      {
        pattern     : "M",
        regex       : "(\\d\\d*?)",
        manipulator : monthManipulator
      });

      rules.push(
      {
        pattern     : "MM",
        regex       : "(\\d\\d?)",
        manipulator : monthManipulator
      });

      rules.push(
      {
        pattern     : "MMM",
        regex       : "(" + dateNamesManipulator("MMM").data.join("|") + ")",
        manipulator : dateNamesManipulator("MMM").func
      });

      rules.push(
      {
        pattern     : "MMMM",
        regex       : "(" + dateNamesManipulator("MMMM").data.join("|") + ")",
        manipulator : dateNamesManipulator("MMMM").func
      });

      rules.push(
      {
        pattern     : "MMMMM",
        regex       : "(" + dateNamesManipulator("MMMMM").data.join("|") + ")",
        manipulator : dateNamesManipulator("MMMMM").func
      });

      rules.push(
      {
        pattern     : "L",
        regex       : "(\\d\\d*?)",
        manipulator : monthManipulator
      });

      rules.push(
      {
        pattern     : "LL",
        regex       : "(\\d\\d?)",
        manipulator : monthManipulator
      });

      rules.push(
      {
        pattern     : "LLL",
        regex       : "(" + dateNamesManipulator("LLL").data.join("|") + ")",
        manipulator : dateNamesManipulator("LLL").func
      });

      rules.push(
      {
        pattern     : "LLLL",
        regex       : "(" + dateNamesManipulator("LLLL").data.join("|") + ")",
        manipulator : dateNamesManipulator("LLLL").func
      });

      rules.push(
      {
        pattern     : "LLLLL",
        regex       : "(" + dateNamesManipulator("LLLLL").data.join("|") + ")",
        manipulator : dateNamesManipulator("LLLLL").func
      });

      rules.push(
      {
        pattern : "dd",
        regex   : "(\\d\\d?)",
        field   : "day"
      });

      rules.push(
      {
        pattern : "d",
        regex   : "(\\d\\d*?)",
        field   : "day"
      });

      rules.push(
      {
        pattern : "D",
        regex   : "(\\d?)",
        field   : "dayOfYear"
      });

      rules.push(
      {
        pattern : "DD",
        regex   : "(\\d\\d?)",
        field   : "dayOfYear"
      });

      rules.push(
      {
        pattern : "DDD",
        regex   : "(\\d\\d\\d?)",
        field   : "dayOfYear"
      });

      rules.push(
      {
        pattern     : "E",
        regex       : "(" + dateNamesManipulator("E").data.join("|") + ")",
        manipulator : dateNamesManipulator("E").func
      });

      rules.push(
      {
        pattern     : "EE",
        regex       : "(" + dateNamesManipulator("EE").data.join("|") + ")",
        manipulator : dateNamesManipulator("EE").func
      });

      rules.push(
      {
        pattern     : "EEE",
        regex       : "(" + dateNamesManipulator("EEE").data.join("|") + ")",
        manipulator : dateNamesManipulator("EEE").func
      });

      rules.push(
      {
        pattern     : "EEEE",
        regex       : "(" + dateNamesManipulator("EEEE").data.join("|") + ")",
        manipulator : dateNamesManipulator("EEEE").func
      });

      rules.push(
      {
        pattern     : "EEEEE",
        regex       : "(" + dateNamesManipulator("EEEEE").data.join("|") + ")",
        manipulator : dateNamesManipulator("EEEEE").func
      });

      rules.push(
      {
        pattern     : "e",
        regex       : "(\\d?)",
        manipulator : localWeekDayManipulator
      });

      rules.push(
      {
        pattern     : "ee",
        regex       : "(\\d\\d?)",
        manipulator : localWeekDayManipulator
      });

      rules.push(
      {
        pattern     : "eee",
        regex       : "(" + dateNamesManipulator("eee").data.join("|") + ")",
        manipulator : dateNamesManipulator("eee").func
      });

      rules.push(
      {
        pattern     : "eeee",
        regex       : "(" + dateNamesManipulator("eeee").data.join("|") + ")",
        manipulator : dateNamesManipulator("eeee").func
      });

      rules.push(
      {
        pattern     : "eeeee",
        regex       : "(" + dateNamesManipulator("eeeee").data.join("|") + ")",
        manipulator : dateNamesManipulator("eeeee").func
      });

      rules.push(
      {
        pattern     : "c",
        regex       : "\\d?",
        manipulator : localWeekDayManipulator
      });

      rules.push(
      {
        pattern     : "ccc",
        regex       : "(" + dateNamesManipulator("ccc").data.join("|") + ")",
        manipulator : dateNamesManipulator("ccc").func
      });

      rules.push(
      {
        pattern     : "cccc",
        regex       : "(" + dateNamesManipulator("cccc").data.join("|") + ")",
        manipulator : dateNamesManipulator("cccc").func
      });

      rules.push(
      {
        pattern     : "ccccc",
        regex       : "(" + dateNamesManipulator("ccccc").data.join("|") + ")",
        manipulator : dateNamesManipulator("ccccc").func
      });

      rules.push(
      {
        pattern     : "a",
        regex       : "(" + amMarker + "|" + pmMarker + ")",
        manipulator : ampmManipulator
      });

      rules.push(
      {
        pattern : "W",
        regex   : "(\\d?)",
        field   : "weekOfMonth"
      });

      rules.push(
      {
        pattern : "w",
        regex   : "(\\d?)",
        field   : "weekOfYear"
      });

      rules.push(
      {
        pattern : "ww",
        regex   : "(\\d\\d?)",
        field   : "weekOfYear"
      });

      rules.push(
      {
        pattern : "HH",
        regex   : "(\\d\\d?)",
        field   : "hour"
      });

      rules.push(
      {
        pattern : "H",
        regex   : "(\\d\\d?)",
        field   : "hour"
      });

      rules.push(
      {
        pattern     : "kk",
        regex       : "(\\d\\d?)",
        manipulator : noZeroHourManipulator
      });

      rules.push(
      {
        pattern     : "k",
        regex       : "(\\d\\d?)",
        manipulator : noZeroHourManipulator
      });

      rules.push(
      {
        pattern : "KK",
        regex   : "(\\d\\d?)",
        field   : "hour"
      });

      rules.push(
      {
        pattern : "K",
        regex   : "(\\d\\d?)",
        field   : "hour"
      });

      rules.push(
      {
        pattern     : "hh",
        regex       : "(\\d\\d?)",
        manipulator : noZeroAmPmHourManipulator
      });

      rules.push(
      {
        pattern     : "h",
        regex       : "(\\d\\d?)",
        manipulator : noZeroAmPmHourManipulator
      });

      rules.push(
      {
        pattern : "mm",
        regex   : "(\\d\\d?)",
        field   : "min"
      });

      rules.push(
      {
        pattern : "m",
        regex   : "(\\d\\d?)",
        field   : "min"
      });

      rules.push(
      {
        pattern : "ss",
        regex   : "(\\d\\d?)",
        field   : "sec"
      });

      rules.push(
      {
        pattern : "s",
        regex   : "(\\d\\d?)",
        field   : "sec"
      });

      rules.push(
      {
        pattern : "SSS",
        regex   : "(\\d\\d?\\d?)",
        field   : "ms"
      });

      rules.push(
      {
        pattern : "SS",
        regex   : "(\\d\\d?\\d?)",
        field   : "ms"
      });

      rules.push(
      {
        pattern : "S",
        regex   : "(\\d\\d?\\d?)",
        field   : "ms"
      });

      rules.push(
      {
        pattern     : "Z",
        regex       : "([\\+\\-]\\d\\d\\d\\d)",
        manipulator : ignoreManipulator
      });

      rules.push(
      {
        pattern     : "z",
        regex       : "(GMT[\\+\\-]\\d\\d:\\d\\d)",
        manipulator : ignoreManipulator
      });
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this.__bindingId != null) {
      qx.locale.Manager.getInstance().removeBinding(this.__bindingId);
    }
    this.__formatTree = this.__parseFeed = this.__parseRules = null;
  }
});

// @deprecated {2.1}
if (qx.core.Environment.get("qx.debug")) {
  qx.log.Logger.deprecatedConstantWarning(
    qx.util.format.DateFormat,
    "LOGGING_DATE_TIME__format",
    "The constant 'LOGGING_DATE_TIME__format' will be removed (hasn't been used anyway!)"
  );
}
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

   ======================================================================

     This class uses documentation of the native String methods from the MDC
     documentation of Mozilla.

     License:
       CC Attribution-Sharealike License:
       http://creativecommons.org/licenses/by-sa/2.5/

************************************************************************ */

/**
 * This class emulates the built-in JavaScript String class. It can be used as
 * base class for classes, which need to derive from String.
 *
 * Instances of this class can be used in any place a JavaScript string can.
 */
qx.Class.define("qx.type.BaseString",
{
  extend : Object,

  /**
   * @param txt {String?""} Initialize with this string
   */
  construct : function(txt)
  {
    var txt = txt || "";

    // no base call needed

    this.__txt = txt;
    this.length = txt.length;
  },

  members :
  {
    $$isString : true,
    length : 0,
    __txt : null,


    /**
     * Returns a string representing the specified object.
     *
     * The valueOf method of String returns the primitive value of a String
     * object as a string data type.
     * This method is usually called internally by JavaScript and not
     * explicitly in code.
     *
     * @return {String} A new string containing the string value.
     */
    toString : function() {
      return this.__txt;
    },


    /**
     *  Returns the specified character from a string.
     *
     * Characters in a string are indexed from left to right. The index of the
     * first character is 0, and the index of the last character in a string
     * called stringName is stringName.length - 1. If the index you supply is
     * out of range, JavaScript returns an empty string.
     *
     * @signature function(index)
     * @param index {Integer} An integer between 0 and 1 less than the length
     *   of the string.
     * @return {String} The character.
     */
    charAt : null,


    /**
     * Returns the primitive value of a String object.
     *
     * The valueOf method of String returns the primitive value of a String
     * object as a string data type.
     * This method is usually called internally by JavaScript and not
     * explicitly in code.
     *
     * @signature function()
     * @return {String} A new string containing the primitive value.
     */
    valueOf : null,


    /**
     * Returns a number indicating the Unicode value of the character at the given index.
     *
     * @signature function(index)
     * @param index {Integer} An integer greater than 0 and less than the length
     *   of the string; if it is not a number, it defaults to 0.
     * @return {Integer} The number.
     */
    charCodeAt : null,


    /**
     * Combines the text of two or more strings and returns a new string.
     * Changes to the text in one string do not affect the other string.
     *
     * @signature function(stringN)
     * @param stringN {String} One or more strings to be combined.
     * @return {String} The combined string.
     */
    concat : null,


    /**
     * Returns the index within the calling String object of the first
     * occurrence of the specified value, starting the search at fromIndex,
     * returns -1 if the value is not found.
     *
     * @signature function(index, offset)
     * @param index {String} A string representing the value to search for.
     * @param offset {Integer?0} The location within the calling string to start
     *   the search from. It can be any integer between 0 and the length of the
     *   string. The default value is 0.
     * @return {Integer} The index or -1.
     */
    indexOf : null,


    /**
     * Returns the index within the calling String object of the last occurrence
     * of the specified value, or -1 if not found. The calling string is
     * searched backward, starting at fromIndex.
     *
     * @signature function(index, offset)
     * @param index {String} A string representing the value to search for.
     * @param offset {Integer?0} The location within the calling string to start
     *   the search from, indexed from left to right. It can be any integer
     *   between 0 and the length of the string. The default value is the length
     *    of the string.
     * @return {Integer} The index or -1.
     */
    lastIndexOf : null,

    /**
     * Used to retrieve the matches when matching a string against a regular
     * expression.
     *
     * If the regular expression does not include the g flag, returns the same
     * result as regexp.exec(string). If the regular expression includes the g
     * flag, the method returns an Array containing all matches.
     *
     * @signature function(regexp)
     * @param regexp {Object} A regular expression object. If a non-RegExp object
     *  obj is passed, it is implicitly converted to a RegExp by using
     *   new RegExp(obj).
     * @return {Object} The matching RegExp object or an array containing all
     *   matches.
     */
    match : null,

    /**
     * Finds a match between a regular expression and a string, and replaces the
     * matched substring with a new substring.
     *
     * @signature function(regexp, aFunction)
     * @param regexp {Object} A RegExp object. The match is replaced by the
     *   return value of parameter #2. Or a String that is to be replaced by
     *   newSubStr.
     * @param aFunction {Function} A function to be invoked to create the new
     *   substring (to put in place of the substring received from parameter
     *   #1).
     * @return {String} The new substring.
     */
    replace : null,


    /**
     * Executes the search for a match between a regular expression and this
     * String object.
     *
     * If successful, search returns the index of the regular expression inside
     * the string. Otherwise, it returns -1.
     *
     * @signature function(regexp)
     * @param regexp {Object} A regular expression object. If a non-RegExp object
     *  obj is passed, it is implicitly converted to a RegExp by using
     *   new RegExp(obj).
     * @return {Object} The matching RegExp object or -1.
     *   matches.
     */
    search : null,

    /**
     * Extracts a section of a string and returns a new string.
     *
     * Slice extracts the text from one string and returns a new string. Changes
     * to the text in one string do not affect the other string.
     * As a negative index, endSlice indicates an offset from the end of the
     * string.
     *
     * @signature function(beginslice, endSlice)
     * @param beginslice {Integer} The zero-based index at which to begin
     *   extraction.
     * @param endSlice {Integer?null} The zero-based index at which to end
     *   extraction. If omitted, slice extracts to the end of the string.
     * @return {String} The extracted string.
     */
    slice : null,

    /**
     * Splits a String object into an array of strings by separating the string
     * into substrings.
     *
     * When found, separator is removed from the string and the substrings are
     * returned in an array. If separator is omitted, the array contains one
     * element consisting of the entire string.
     *
     * If separator is a regular expression that contains capturing parentheses,
     * then each time separator is matched the results (including any undefined
     * results) of the capturing parentheses are spliced into the output array.
     * However, not all browsers support this capability.
     *
     * Note: When the string is empty, split returns an array containing one
     *
     * @signature function(separator, limit)
     * @param separator {String?null} Specifies the character to use for
     *   separating the string. The separator is treated as a string or a regular
     *   expression. If separator is omitted, the array returned contains one
     *   element consisting of the entire string.
     * @param limit {Integer?null} Integer specifying a limit on the number of
     *   splits to be found.
     * @return {Array} The Array containing substrings.
     */
    split : null,

   /**
    * Returns the characters in a string beginning at the specified location
    * through the specified number of characters.
    *
    * Start is a character index. The index of the first character is 0, and the
    * index of the last character is 1 less than the length of the string. substr
    *  begins extracting characters at start and collects length characters
    * (unless it reaches the end of the string first, in which case it will
    * return fewer).
    * If start is positive and is greater than or equal to the length of the
    * string, substr returns an empty string.
    *
    * @signature function(start, length)
    * @param start {Integer} Location at which to begin extracting characters
    *   (an integer between 0 and one less than the length of the string).
    * @param length {Integer?null} The number of characters to extract.
    * @return {String} The substring.
    */
    substr : null,

    /**
     * Returns a subset of a String object.
     *
     * substring extracts characters from indexA up to but not including indexB.
     * In particular:
     * If indexA equals indexB, substring returns an empty string.
     * If indexB is omitted, substring extracts characters to the end of the
     * string.
     * If either argument is less than 0 or is NaN, it is treated as if it were
     * 0.
     * If either argument is greater than stringName.length, it is treated as if
     * it were stringName.length.
     * If indexA is larger than indexB, then the effect of substring is as if
     * the two arguments were swapped; for example, str.substring(1, 0) == str.substring(0, 1).
     *
     * @signature function(indexA, indexB)
     * @param indexA {Integer} An integer between 0 and one less than the
     *   length of the string.
     * @param indexB {Integer?null} (optional) An integer between 0 and the
     *   length of the string.
     * @return {String} The subset.
     */
    substring : null,

    /**
     * Returns the calling string value converted to lowercase.
     * The toLowerCase method returns the value of the string converted to
     * lowercase. toLowerCase does not affect the value of the string itself.
     *
     * @signature function()
     * @return {String} The new string.
     */
    toLowerCase : null,

    /**
     * Returns the calling string value converted to uppercase.
     * The toUpperCase method returns the value of the string converted to
     * uppercase. toUpperCase does not affect the value of the string itself.
     *
     * @signature function()
     * @return {String} The new string.
     */
    toUpperCase : null,


    /**
     * Return unique hash code of object
     *
     * @return {Integer} unique hash code of the object
     */
    toHashCode : function() {
      return qx.core.ObjectRegistry.toHashCode(this);
    },


   /**
    * The characters within a string are converted to lower case while
    * respecting the current locale.
    *
    * The toLowerCase method returns the value of the string converted to
    * lowercase. toLowerCase does not affect the value of the string itself.
    *
    * @signature function()
    * @return {String} The new string.
    */
    toLocaleLowerCase : null,

   /**
    * The characters within a string are converted to upper case while
    * respecting the current locale.
    * The toUpperCase method returns the value of the string converted to
    * uppercase. toUpperCase does not affect the value of the string itself.
    *
    * @signature function()
    * @return {String} The new string.
    */
    toLocaleUpperCase : null,

    /**
     * Call the same method of the super class.
     *
     * @param args {arguments} the arguments variable of the calling method
     * @param varags {var} variable number of arguments passed to the overwritten function
     * @return {var} the return value of the method of the base class.
     */
    base : function(args, varags) {
      return qx.core.Object.prototype.base.apply(this, arguments);
    }


  },

  /*
   *****************************************************************************
      DEFER
   *****************************************************************************
   */

   defer : function(statics, members)
   {
     // add asserts into each debug build
     if (qx.core.Environment.get("qx.debug")) {
       qx.Class.include(statics, qx.core.MAssert);
     }

     var mappedFunctions = [
       'charAt',
       'charCodeAt',
       'concat',
       'indexOf',
       'lastIndexOf',
       'match',
       'replace',
       'search',
       'slice',
       'split',
       'substr',
       'substring',
       'toLowerCase',
       'toUpperCase',
       'toLocaleLowerCase',
       'toLocaleUpperCase'
     ];

     // feature/bug detection:
     // Some older Firefox version (<2) break if valueOf is overridden
     members.valueOf = members.toString;
     if (new statics("").valueOf() == null) {
       delete members.valueOf;
     }

     for (var i=0, l=mappedFunctions.length; i<l; i++) {
       members[mappedFunctions[i]] = String.prototype[mappedFunctions[i]];
     }
   }

});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This class contains the translation of a message and all information
 * to translate it again into a different language.
 */
qx.Class.define("qx.locale.LocalizedString",
{
  extend : qx.type.BaseString,

  /**
   * @param translation {String} The translated message
   * @param messageId {String} The messageId to translate
   * @param args {Array} list of arguments passed used as values for format strings
   */
  construct : function(translation, messageId, args)
  {
    this.base(arguments, translation);

    this.__messageId = messageId;
    this.__args = args;
  },

  members :
  {

    __messageId : null,
    __args : null,

    /**
     * Get a translation of the string using the current locale.
     *
     * @return {LocalizedString} This string translated using the current
     *    locale.
     */
    translate : function() {
      return qx.locale.Manager.getInstance().translate(this.__messageId, this.__args);
    }
  }
})/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/*
#require(qx.event.dispatch.Direct)
#require(qx.locale.LocalizedString)
#cldr
*/

/**
 * The qx.locale.Manager provides static translation methods (like tr()) and
 * general locale information.
 */

qx.Class.define("qx.locale.Manager",
{
  type : "singleton",
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__translations = qx.$$translations || {};
    this.__locales      = qx.$$locales || {};

    var locale = qx.core.Environment.get("locale");
    var variant = qx.core.Environment.get("locale.variant");
    if (variant !== "") {
      locale += "_" + variant;
    }

    this.__clientLocale = locale;

    this.setLocale(locale || this.__defaultLocale);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Translate a message
     *
     * @param messageId {String} message id (may contain format strings)
     * @param varargs {Object} variable number of arguments applied to the format string
     * @return {String | LocalizedString} The translated message or localized string
     * @see qx.lang.String.format
     */
    tr : function(messageId, varargs)
    {
      var args = qx.lang.Array.fromArguments(arguments);
      args.splice(0, 1);

      return qx.locale.Manager.getInstance().translate(messageId, args);
    },


    /**
     * Translate a plural message
     *
     * Depending on the third argument the plural or the singular form is chosen.
     *
     * @param singularMessageId {String} message id of the singular form (may contain format strings)
     * @param pluralMessageId {String} message id of the plural form (may contain format strings)
     * @param count {Integer} singular form if equals 1, otherwise plural
     * @param varargs {Object} variable number of arguments applied to the format string
     * @return {String | LocalizedString} The translated message or localized string
     * @see qx.lang.String.format
     */
    trn : function(singularMessageId, pluralMessageId, count, varargs)
    {
      var args = qx.lang.Array.fromArguments(arguments);
      args.splice(0, 3);

      // assumes "Two forms, singular used for one only" (seems to be the most common form)
      // (http://www.gnu.org/software/gettext/manual/html_node/gettext_150.html#Plural-forms)
      // closely related with bug #745
      if (count != 1) {
        return qx.locale.Manager.getInstance().translate(pluralMessageId, args);
      } else {
        return qx.locale.Manager.getInstance().translate(singularMessageId, args);
      }
    },


    /**
     * Translate a message with translation hint
     *
     * @param hint {String} hint for the translator of the message. Will be included in the .po file.
     * @param messageId {String} message id (may contain format strings)
     * @param varargs {Object} variable number of arguments applied to the format string
     * @return {String | LocalizedString} The translated message or localized string
     * @see qx.lang.String.format
     */
    trc : function(hint, messageId, varargs)
    {
      var args = qx.lang.Array.fromArguments(arguments);
      args.splice(0, 2);

      return qx.locale.Manager.getInstance().translate(messageId, args);
    },


    /**
     * Mark the message for translation but return the original message.
     *
     * @param messageId {String} the message ID
     * @return {String} messageId
     */
    marktr : function(messageId) {
      return messageId;
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** current locale. locale is an language code like de, de_AT, en, en_GB, fr, ... */
    locale :
    {
      check : "String",
      nullable : true,
      apply : "_applyLocale",
      event : "changeLocale"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __defaultLocale : "C",
    __locale : null,
    __language : null,
    __translations : null,
    __locales : null,
    __clientLocale : null,

    /**
     * Get the language code of the current locale
     *
     * This is the first part of a locale definition. The language for "de_DE" would be "de"
     *
     * @return {String} language code
     */
    getLanguage : function() {
      return this.__language;
    },


    /**
     * Get the territory code of the current locale
     *
     * This is the second part of a locale definition. The territory for "de_DE" would be "DE"
     *
     * @return {String} territory code
     */
    getTerritory : function() {
      return this.getLocale().split("_")[1] || "";
    },


    /**
     * Return the available application locales
     *
     * This corresponds to the LOCALES setting in config.json. Without argument,
     * it only returns the currently loaded locales, with an argument of true
     * all locales that went into the build. This is particularly interesting if
     * locales were generated as dedicated I18N parts, and have to be loaded
     * explicitly before being available.
     *
     * @param includeNonloaded {Boolean?null} include locales not yet loaded
     * @return {String[]} array of available locales
     */
    getAvailableLocales : function(includeNonloaded)
    {
      var locales = [];

      for (var locale in this.__locales)
      {
        if (locale != this.__defaultLocale) {
          if (this.__locales[locale] === null && !includeNonloaded) {
            continue;  // skip not yet loaded locales
          }
          locales.push(locale);
        }
      }

      return locales;
    },


    /**
     * Extract the language part from a locale.
     *
     * @param locale {String} locale to be used
     * @return {String} language
     */
    __extractLanguage : function(locale)
    {
      var language;
      if (locale == null) {
        return null;
      }
      var pos = locale.indexOf("_");

      if (pos == -1) {
        language = locale;
      } else {
        language = locale.substring(0, pos);
      }

      return language;
    },


    // property apply
    _applyLocale : function(value, old)
    {
      if (qx.core.Environment.get("qx.debug")) {
        if (!(value in this.__locales || value == this.__clientLocale)) {
          qx.log.Logger.warn("Locale: " + value+" not available.");
        }
      }

      this.__locale = value;
      this.__language = this.__extractLanguage(value);
    },


    /**
     * Add a translation to the translation manager.
     *
     * If <code>languageCode</code> already exists, its map will be updated with
     * <code>translationMap</code> (new keys will be added, existing keys will be
     * overwritten).
     *
     * @param languageCode {String} language code of the translation like <i>de, de_AT, en, en_GB, fr, ...</i>
     * @param translationMap {Map} mapping of message identifiers to message strings in the target
     *                             language, e.g. <i>{"greeting_short" : "Hello"}</i>. Plural forms
     *                             are separate keys.
     */
    addTranslation : function(languageCode, translationMap)
    {
      var catalog = this.__translations;
      if (catalog[languageCode])
      {
        for (var key in translationMap) {
          catalog[languageCode][key] = translationMap[key];
        }
      }
      else
      {
        catalog[languageCode] = translationMap;
      }
    },


    /**
     * Add a localization to the localization manager.
     *
     * If <code>localeCode</code> already exists, its map will be updated with
     * <code>localeMap</code> (new keys will be added, existing keys will be overwritten).
     *
     * @param localeCode {String} locale code of the translation like <i>de, de_AT, en, en_GB, fr, ...</i>
     * @param localeMap {Map} mapping of locale keys to the target locale values, e.g.
     *                        <i>{"cldr_date_format_short" : "M/d/yy"}</i>.
     */
    addLocale : function(localeCode, localeMap)
    {
      var catalog = this.__locales;
      if (catalog[localeCode])
      {
        for (var key in localeMap) {
          catalog[localeCode][key] = localeMap[key];
        }
      }
      else
      {
        catalog[localeCode] = localeMap;
      }
    },


    /**
     * Translate a message using the current locale and apply format string to the arguments.
     *
     * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
     * default locale (e.g. C). Localizes the arguments if possible and splices
     * them into the message. If qx.dynlocale is on, returns a {@link
     * LocalizedString}.
     *
     * @param messageId {String} message id (may contain format strings)
     * @param args {Object[]} array of objects, which are inserted into the format string
     * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
     * @return {String | LocalizedString} translated message or localized string
     */
    translate : function(messageId, args, locale)
    {
      var catalog = this.__translations;
      return this.__lookupAndExpand(catalog, messageId, args, locale);
    },

    /**
     * Provide localisation (CLDR) data.
     *
     * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
     * default locale (e.g. C). Localizes the arguments if possible and splices
     * them into the message. If qx.dynlocale is on, returns a {@link
     * LocalizedString}.
     *
     * @param messageId {String} message id (may contain format strings)
     * @param args {Object[]} array of objects, which are inserted into the format string
     * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
     * @return {String | LocalizedString} translated message or localized string
     */
    localize : function(messageId, args, locale)
    {
      var catalog = this.__locales;
      return this.__lookupAndExpand(catalog, messageId, args, locale);
    },


    /**
     * Look up an I18N key in a catalog and expand format strings.
     *
     * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
     * default locale (e.g. C). Localizes the arguments if possible and splices
     * them into the message. If qx.dynlocale is on, returns a {@link
     * LocalizedString}.
     *
     * @param catalog {Map} map of I18N keys and their values
     * @param messageId {String} message id (may contain format strings)
     * @param args {Object[]} array of objects, which are inserted into the format string
     * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
     * @return {String | LocalizedString} translated message or localized string
     */
    __lookupAndExpand : function(catalog, messageId, args, locale)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertObject(catalog);
        this.assertString(messageId);
        this.assertArray(args);
      }
      var txt;

      if (!catalog) {
        return messageId;
      }

      if (locale) {
        var language = this.__extractLanguage(locale);
      }
      else
      {
        locale = this.__locale;
        language = this.__language;
      }

      // e.g. DE_at
      if (!txt && catalog[locale]) {
        txt = catalog[locale][messageId];
      }

      // e.g. DE
      if (!txt && catalog[language]) {
        txt = catalog[language][messageId];
      }

      // C
      if (!txt && catalog[this.__defaultLocale]) {
        txt = catalog[this.__defaultLocale][messageId];
      }

      if (!txt) {
        txt = messageId;
      }

      if (args.length > 0)
      {
        var translatedArgs = [];
        for ( var i = 0; i < args.length; i++)
        {
          var arg = args[i];
          if (arg && arg.translate) {
            translatedArgs[i] = arg.translate();
          } else {
            translatedArgs[i] = arg;
          }
        }
        txt = qx.lang.String.format(txt, translatedArgs);
      }

      if (qx.core.Environment.get("qx.dynlocale")) {
        txt = new qx.locale.LocalizedString(txt, messageId, args);
      }

      return txt;
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__translations = this.__locales = null;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class comes with all relevant information regarding
 * the client's selected locale.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Locale",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * The name of the system locale e.g. "de" when the full locale is "de_AT"
     * @return {String} The current locale
     * @internal
     */
    getLocale : function() {
      var locale = qx.bom.client.Locale.__getNavigatorLocale();

      var index = locale.indexOf("-");
      if (index != -1) {
        locale = locale.substr(0, index);
      }

      return locale;
    },


    /**
     * The name of the variant for the system locale e.g. "at" when the
     * full locale is "de_AT"
     *
     * @return {String} The locales variant.
     * @internal
     */
    getVariant : function() {
      var locale = qx.bom.client.Locale.__getNavigatorLocale();
      var variant = "";

      var index = locale.indexOf("-");

      if (index != -1) {
        variant = locale.substr(index + 1);
      }

      return variant;
    },


    /**
     * Internal helper for accessing the navigators language.
     *
     * @return {String} The language set by the navigator.
     */
    __getNavigatorLocale : function()
    {
      var locale = (navigator.userLanguage || navigator.language || "");

      // Android Bug: Android does not return the system language from the
      // navigator language. Try to parse the language from the userAgent.
      // See http://code.google.com/p/android/issues/detail?id=4641
      if (qx.bom.client.OperatingSystem.getName() == "android")
      {
        var match = /(\w{2})-(\w{2})/i.exec(navigator.userAgent);
        if (match) {
          locale = match[0];
        }
      }

      return locale.toLowerCase();
    }
  },

  defer : function(statics) {
    qx.core.Environment.add("locale", statics.getLocale);
    qx.core.Environment.add("locale.variant", statics.getVariant);
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/*
#cldr
*/

/**
 * Static class that provides localized date information (like names of week
 * days, AM/PM markers, start of week, etc.).
 */
qx.Class.define("qx.locale.Date",
{
  statics :
  {
    /**
     * Reference to the locale manager.
     *
     * @internal
     */
    __mgr : qx.locale.Manager.getInstance(),


    /**
     * Get AM marker for time definitions
     *
     * @param locale {String} optional locale to be used
     * @return {String} translated AM marker.
     */
    getAmMarker : function(locale) {
      return this.__mgr.localize("cldr_am", [], locale);
    },


    /**
     * Get PM marker for time definitions
     *
     * @param locale {String} optional locale to be used
     * @return {String} translated PM marker.
     */
    getPmMarker : function(locale) {
      return this.__mgr.localize("cldr_pm", [], locale);
    },


    /**
     * Return localized names of day names
     *
     * @param length {String} format of the day names.
     *       Possible values: "abbreviated", "narrow", "wide"
     * @param locale {String} optional locale to be used
     * @param context {String} (default: "format") intended context.
     *       Possible values: "format", "stand-alone"
     * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
     * in order to find a localized name for the day
     * @return {String[]} array of localized day names starting with sunday.
     */
    getDayNames : function(length, locale, context, withFallback)
    {
      var context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      var days = [ "sun", "mon", "tue", "wed", "thu", "fri", "sat" ];

      var names = [];

      for (var i=0; i<days.length; i++)
      {
        var key = "cldr_day_" + context + "_" + length + "_" + days[i];
        names.push(withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale));
      }

      return names;
    },


    /**
     * Return localized name of a week day name
     *
     * @param length {String} format of the day name.
     *       Possible values: "abbreviated", "narrow", "wide"
     * @param day {Integer} day number. 0=sunday, 1=monday, ...
     * @param locale {String} optional locale to be used
     * @param context {String} (default: "format") intended context.
     *       Possible values: "format", "stand-alone"
     * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
     * in order to find a localized name for the day
     * @return {String} localized day name
     */
    getDayName : function(length, day, locale, context, withFallback)
    {
      var context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug"))
      {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInteger(day);
        qx.core.Assert.assertInRange(day, 0, 6);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      var days = [ "sun", "mon", "tue", "wed", "thu", "fri", "sat" ];

      var key = "cldr_day_" + context + "_" + length + "_" + days[day];
      return withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale);
    },


    /**
     * Return localized names of month names
     *
     * @param length {String} format of the month names.
     *       Possible values: "abbreviated", "narrow", "wide"
     * @param locale {String} optional locale to be used
     * @param context {String} (default: "format") intended context.
     *       Possible values: "format", "stand-alone"
     * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
     * in order to find a localized name for the month
     * @return {String[]} array of localized month names starting with january.
     */
    getMonthNames : function(length, locale, context, withFallback)
    {
      var context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      var names = [];

      for (var i=0; i<12; i++)
      {
        var key = "cldr_month_" + context + "_" + length + "_" + (i + 1);
        names.push(withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale));
      }

      return names;
    },


    /**
     * Return localized name of a month
     *
     * @param length {String} format of the month names.
     *       Possible values: "abbreviated", "narrow", "wide"
     * @param month {Integer} index of the month. 0=january, 1=february, ...
     * @param locale {String} optional locale to be used
     * @param context {String} (default: "format") intended context.
     *       Possible values: "format", "stand-alone"
     * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
     * in order to find a localized name for the month
     * @return {String} localized month name
     */
    getMonthName : function(length, month, locale, context, withFallback)
    {
      var context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      var key = "cldr_month_" + context + "_" + length + "_" + (month + 1);
      return withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale);
    },


    /**
     * Return localized date format string to be used with {@link qx.util.format.DateFormat}.
     *
     * @param size {String} format of the date format.
     *      Possible values: "short", "medium", "long", "full"
     * @param locale {String} optional locale to be used
     * @return {String} localized date format string
     */
    getDateFormat : function(size, locale)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(size, ["short", "medium", "long", "full"]);
      }

      var key = "cldr_date_format_" + size;
      return this.__mgr.localize(key, [], locale)
    },


    /**
     * Try to localize a date/time format string. For format string possibillities see
     * <a href="http://cldr.unicode.org/translation/date-time">Date/Time Symbol reference</a>
     * at CLDR - Unicode Common Locale Data Repository.
     *
     * If no localization is available take the fallback format string.
     *
     * @param canonical {String} format string containing only field information, and in a canonical order.
     *       Examples are "yyyyMMMM" for year + full month, or "MMMd" for abbreviated month + day.
     * @param fallback {String} fallback format string if no localized version is found
     * @param locale {String} optional locale to be used
     * @return {String} best matching format string
     */
    getDateTimeFormat : function(canonical, fallback, locale)
    {
      var key = "cldr_date_time_format_" + canonical;
      var localizedFormat = this.__mgr.localize(key, [], locale);

      if (localizedFormat == key) {
        localizedFormat = fallback;
      }

      return localizedFormat;
    },


    /**
     * Return localized time format string to be used with {@link qx.util.format.DateFormat}.
     *
     * @param size {String} format of the time pattern.
     *      Possible values: "short", "medium", "long", "full"
     * @param locale {String} optional locale to be used
     * @return {String} localized time format string
     */
    getTimeFormat : function(size, locale)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(size, ["short", "medium", "long", "full"]);
      }

      var key = "cldr_time_format_" + size;
      var localizedFormat = this.__mgr.localize(key, [], locale);

      if (localizedFormat != key) {
        return localizedFormat;
      }

      switch(size)
      {
        case "short":
        case "medium":
          return qx.locale.Date.getDateTimeFormat("HHmm", "HH:mm");

        case "long":
          return qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss");

        case "full":
          return qx.locale.Date.getDateTimeFormat("HHmmsszz", "HH:mm:ss zz");

        default:
          throw new Error("This case should never happen.");
      }
    },


    /**
     * Return the day the week starts with
     *
     * Reference: Common Locale Data Repository (cldr) supplementalData.xml
     *
     * @param locale {String} optional locale to be used
     * @return {Integer} index of the first day of the week. 0=sunday, 1=monday, ...
     */
    getWeekStart : function(locale)
    {
      var weekStart =
      {
        // default is monday
        "MV" : 5, // friday
        "AE" : 6, // saturday
        "AF" : 6,
        "BH" : 6,
        "DJ" : 6,
        "DZ" : 6,
        "EG" : 6,
        "ER" : 6,
        "ET" : 6,
        "IQ" : 6,
        "IR" : 6,
        "JO" : 6,
        "KE" : 6,
        "KW" : 6,
        "LB" : 6,
        "LY" : 6,
        "MA" : 6,
        "OM" : 6,
        "QA" : 6,
        "SA" : 6,
        "SD" : 6,
        "SO" : 6,
        "TN" : 6,
        "YE" : 6,
        "AS" : 0, // sunday
        "AU" : 0,
        "AZ" : 0,
        "BW" : 0,
        "CA" : 0,
        "CN" : 0,
        "FO" : 0,
        "GE" : 0,
        "GL" : 0,
        "GU" : 0,
        "HK" : 0,
        "IE" : 0,
        "IL" : 0,
        "IS" : 0,
        "JM" : 0,
        "JP" : 0,
        "KG" : 0,
        "KR" : 0,
        "LA" : 0,
        "MH" : 0,
        "MN" : 0,
        "MO" : 0,
        "MP" : 0,
        "MT" : 0,
        "NZ" : 0,
        "PH" : 0,
        "PK" : 0,
        "SG" : 0,
        "TH" : 0,
        "TT" : 0,
        "TW" : 0,
        "UM" : 0,
        "US" : 0,
        "UZ" : 0,
        "VI" : 0,
        "ZA" : 0,
        "ZW" : 0,
        "MW" : 0,
        "NG" : 0,
        "TJ" : 0
      };

      var territory = qx.locale.Date._getTerritory(locale);

      // default is monday
      return weekStart[territory] != null ? weekStart[territory] : 1;
    },


    /**
     * Return the day the weekend starts with
     *
     * Reference: Common Locale Data Repository (cldr) supplementalData.xml
     *
     * @param locale {String} optional locale to be used
     * @return {Integer} index of the first day of the weekend. 0=sunday, 1=monday, ...
     */
    getWeekendStart : function(locale)
    {
      var weekendStart =
      {
        // default is saturday
        "EG" : 5, // friday
        "IL" : 5,
        "SY" : 5,
        "IN" : 0, // sunday
        "AE" : 4, // thursday
        "BH" : 4,
        "DZ" : 4,
        "IQ" : 4,
        "JO" : 4,
        "KW" : 4,
        "LB" : 4,
        "LY" : 4,
        "MA" : 4,
        "OM" : 4,
        "QA" : 4,
        "SA" : 4,
        "SD" : 4,
        "TN" : 4,
        "YE" : 4
      };

      var territory = qx.locale.Date._getTerritory(locale);

      // default is saturday
      return weekendStart[territory] != null ? weekendStart[territory] : 6;
    },


    /**
     * Return the day the weekend ends with
     *
     * Reference: Common Locale Data Repository (cldr) supplementalData.xml
     *
     * @param locale {String} optional locale to be used
     * @return {Integer} index of the last day of the weekend. 0=sunday, 1=monday, ...
     */
    getWeekendEnd : function(locale)
    {
      var weekendEnd =
      {
        // default is sunday
        "AE" : 5, // friday
        "BH" : 5,
        "DZ" : 5,
        "IQ" : 5,
        "JO" : 5,
        "KW" : 5,
        "LB" : 5,
        "LY" : 5,
        "MA" : 5,
        "OM" : 5,
        "QA" : 5,
        "SA" : 5,
        "SD" : 5,
        "TN" : 5,
        "YE" : 5,
        "AF" : 5,
        "IR" : 5,
        "EG" : 6, // saturday
        "IL" : 6,
        "SY" : 6
      };

      var territory = qx.locale.Date._getTerritory(locale);

      // default is sunday
      return weekendEnd[territory] != null ? weekendEnd[territory] : 0;
    },


    /**
     * Returns whether a certain day of week belongs to the week end.
     *
     * @param day {Integer} index of the day. 0=sunday, 1=monday, ...
     * @param locale {String} optional locale to be used
     * @return {Boolean} whether the given day is a weekend day
     */
    isWeekend : function(day, locale)
    {
      var weekendStart = qx.locale.Date.getWeekendStart(locale);
      var weekendEnd = qx.locale.Date.getWeekendEnd(locale);

      if (weekendEnd > weekendStart) {
        return ((day >= weekendStart) && (day <= weekendEnd));
      } else {
        return ((day >= weekendStart) || (day <= weekendEnd));
      }
    },


    /**
     * Extract the territory part from a locale
     *
     * @param locale {String} the locale
     * @return {String} territory
     */
    _getTerritory : function(locale)
    {
      if (locale) {
        var territory = locale.split("_")[1] || locale;
      } else {
        territory = this.__mgr.getTerritory() || this.__mgr.getLanguage();
      }

      return territory.toUpperCase();
    },

    /**
     * Provide localisation (CLDR) data with fallback between "format" and "stand-alone" contexts.
     * It is used in {@link #getDayName} and {@link #getMonthName} methods.
     *
     * @param context {String} intended context.
     *       Possible values: "format", "stand-alone".
     * @param fallbackContext {String} the context used in case no localisation is found for the key.
     * @param key {String} message id (may contain format strings)
     * @param locale {String} the locale
     * @return {String} localized name for the key
     *
     */
    __localizeWithFallback : function(context, fallbackContext, key, locale)
    {
      var localizedString = this.__mgr.localize(key, [], locale);
      if(localizedString == key)
      {
        var newKey = key.replace('_' + context + '_', '_' + fallbackContext + '_');
        return this.__mgr.localize(newKey, [], locale);
      }
      else
      {
        return localizedString;
      }
    }
  }
});
