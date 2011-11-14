<?php
/**
* Php Beautify: A tool to beautify php source code
*
* Copyright 2002, Jens Bierkandt, jens@bierkandt.org
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; either version 2 of the License, or
* (at your option) any later version.
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
* You should have received a copy of the GNU General Public License
* along with this program; if not, write to the Free Software
* Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*
* @package php_beautify
* @author Jens Bierkandt <jens@bierkandt.org>
*/

/**
* Require PhpBeautify Class
*/
require_once("beautify_php.class.inc");

 if (isset($_POST)) {
    // First check some variables
    if (isset($_POST['indent_width'])) {
        $indent_width = $_POST['indent_width'];
        $indent_width = preg_replace("/\D/", "", $indent_width);
        if ($indent_width == "") {
            $indent_width = 4;
        }
    } else {
        $indent_width = 4;
    }

    if (!isset($_POST['max'])) {
        $max_line = 0;
    } else {
        $max = $_POST['max'];
    }
	if (!isset($_POST['indent_mode'])) {
        $indent_mode = "s";
    } else {
        $indent_mode = $_POST['indent_mode'];
    }
     
    if (isset($_POST['find_functions'])) {
        $find_functions = TRUE;
    }

    if (isset($_POST['del_line'])) {
        $del_line = $_POST['del_line'];
        $del_line = preg_replace("/[^0-1]/", "", $del_line);
        if ($del_line == "") $del_line = 0;
    } else {
        $del_line = 0;
    }
     
    if (isset($_POST['max_line']) && isset($_POST['max'])) {
         
        $max_line = $_POST['max_line'];
        $max_line = preg_replace("/\D/", "", $max_line);
        if ($max_line == "") {
            $max_line = 0;
        }
         
    } else {
        $max_line = 0;
    }
     
    if (isset($_POST['highlight'])) {
        $highlight = $_POST['highlight'];
        $highlight = preg_replace("/[^0-1]/", "", $highlight);
        if ($highlight == "") {
            $highlight = 0;
        }
    } else {
        $highlight = 0;
    }
     
    if (isset($_POST['braces'])) {
        $braces = $_POST['braces'];
        $braces = preg_replace("/[^0-1]/", "", $braces);
        if ($braces == "") {
            $braces = 0;
        }
    } else {
        $braces = 0;
    }
     
    if (!isset($HTTP_POST_FILES['file']['tmp_name'])) {
        enterdata();
        return;
    }

    $file = $HTTP_POST_FILES['file']['tmp_name'];
    // In PHP 4.1.0 or later, $_FILES should be used instead of $HTTP_POST_FILES.
    if (is_uploaded_file($HTTP_POST_FILES['file']['tmp_name'])) {
    $file=$HTTP_POST_FILES['file']['tmp_name'];

	$settings=compact("indent_width","max_line","max","del_line","highlight","braces","file","find_functions", "indent_mode");
$beauty=& new phpBeautify($settings);
$beauty->toHTML();
if (PEAR::isError($beauty)) {
	echo $beauty->getMessage()."\n";
	}

	} else {
        echo "Error: no filename or file too large. Filename: " . $HTTP_POST_FILES['file']['name'];
		enterdata();
		exit();
    }
}
else {
enterdata();
exit();
}
/**
* Send to the browser a Form with instruction to
* beautify a php file.
*/
function enterdata() {
?>
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0//EN">
    <html>
    <head>
    <title>Beautify PHP source code</title>
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
    <style type="text/css">
<!-- 
 td, th, p {
   font-family: arial,verdana,helvetica,sans-serif;
   font-size: 9pt;
}
-->
</style>
    </head>
    <body>
    <table bgcolor="#669966" cellspacing="2" cellpadding="4" width="90%" align="center">
    <tr>
    <td bgcolor="#66cc33">
    <h1>Beautify PHP</h1>
    <h4>version
    <?php
echo phpBeautify::getVersion();
    ?>
    </h4>
    </td></tr>
    <tr valign="top">
    <td>
    <h4>What is <i>Beautify PHP?</i></h4>
    <p>This program tries to reformat and beautify PHP source code files automatically.
    The program is Open Source and distributed under the terms of GNU GPL.
    WARNING! It can produce unexpected output.
    Always save your work and preview the formatted code before using it.
    </p>
    </td></tr><tr><td>
    <table align="left">
    <form enctype="multipart/form-data" action="
    <?php
        echo "http://".getenv('SERVER_NAME').getenv('SCRIPT_NAME');
    ?>
    " method="POST">
    <tr><td bgcolor="#66cc33" colspan="2">
    <input type="hidden" name="MAX_FILE_SIZE" value="50000">
    PHP-File to reformat:
    </td></tr><tr><td colspan="2">
    <input name="file" type="file" size="50">
    </td></tr>
    <tr><td bgcolor="#66cc33" colspan="2">Select settings of braces:</td></tr>
    <tr><td>
    <input type="radio" checked name="braces" value='<?php echo BEAUT_BRACES_PEAR;?>'>Braces <a href="http://pear.php.net/manual/en/standards.php" target="_blank">PEAR</a>-style
    </td><td><input type="radio" name="braces" value='<?php echo BEAUT_BRACES_C;?>'>Braces C-style
    </td></tr>
    <tr><td bgcolor="#66cc33" colspan="2">Select highlight mode:</td></tr>
    <tr><td><input type="radio" name="highlight" value=1>Highlight code
    </td><td><input type="radio" checked name="highlight" value=0>Plain text</td></tr>
    <tr><td bgcolor="#66cc33" colspan="2">Indentation:</td></tr>
    <tr><td>
    <input type="radio" name="indent_mode" checked value="s">&nbsp;Use Spaces&nbsp;<input type="text" name="indent_width" value=4 size=3 maxlength=2>
	</td></tr>
	<tr><td>
	<input type="radio" name="indent_mode" value="t">&nbsp;Use tabs
    </td></tr>
    <tr><td bgcolor="#66cc33" colspan="2">More options:</td></tr>
    <tr><td>
    <input type="checkbox" name="max" value="on">&nbsp;Max chars per line&nbsp;
    <input type="text" name="max_line" value=40 size="3" maxlength="3">
    Code will not work anymore!!! Use it for printing only
    </td></tr>
    <tr><td>
    <input type="checkbox" name="del_line" value="1">&nbsp;Delete empty lines&nbsp;
    </td></tr>
    <tr><td>
    <input type="checkbox" name="find_functions" value="1">&nbsp;List the functions as an overview at beginning of the document&nbsp;
    </td></tr>
	<tr><td bgcolor="#66cc33" colspan="2">&nbsp;</td></tr>
    <tr><td>
    <input type="submit" value="Start processing">
    </td></tr>
    </form>
    </table>
    </tr></td><tr><td>
    &copy; Copyright 2002-2003 Jens Bierkandt; more information, bug- and wishlist on: <a href="http://www.bierkandt.org/beautify">http://www.bierkandt.org/beautify</a >.
	Please help this project and <a href="http://www.bierkandt.org/beautify/donate.php">donate</a>.
    </td></tr>
    </table>
    </body>
    </html>
    <?php
        return;
    }
?>
