/**
* Beautify PHP: A tool to beautify php source code
*
* Home: http://www.bierkandt.org/beautify/
*
* Copyright 2002-2003, Jens Bierkandt, jens@bierkandt.org
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
*/

Readme for version 0.5.0

* What it is:
This program tries to reformat and beautify PHP source code files automatically. 
The program is Open Source and distributed under the terms of GNU GPL. 
It is written in PHP and has a web frontend.
KEEP ALWAYS A BACKUP OF YOUR PHP FILES!
You can get unexpected output from Beautify PHP.

* What you need:
To execute this program, you need a PHP installation. Maybe you have some 
webspace at a provider where you can execute PHP-Skripts. Then just copy
the beautify PHP scripts in a directory, execute the file 
beautify_php.php in your web browser and stop reading here.

PHP comes for different plattforms like Linux and Windows.
You can download it from http://www.php.net . Follow the README there.
Now you can execute the program on the console (Linux) or the MS-DOS-Box 
(Windows). 

The Beautifier also comes with a web frontend. To use this, you 
first need to install a Webserver (e.g. Apache (http://www.apache.org)
or the Microsoft Internet Information Server) and then PHP. Be sure
to set an appropriate temp directory for file uploads in php.ini where
the webserver has access to.

* Using Beautify PHP with the web-frontend:
After you have downloaded the Beautify PHP files, put them in a 
directory where the webserver has access to and where you can execute the 
scripts by entering the following URL in a webbrowser
http://www.*Yourhost*.com/*directory_to_your_beautify_php_files*/beautify_php.php
Follow the instructions on the screen. After you've hit the 
"Start processing" button, check the output and save it with the browsers
Save option. In Internet Explorer (Windows), select then the
file type = ".txt" and hit "Save".

* Using Beautify PHP on the console:
To execute Beautify PHP, you need a working PHP installation. Just enter
php beautify_php <options> on the console (Linux) or the MS-DOS-Box 
(Windows). 

Example:
php beautify_php -f PEAR.php -o TEST.php -l -u -i 4

You can convert several files at once.
Options:
-f <file> input file  - default: stdin
-o <file> output file - default: stdout
-v <int>  verify (0:off -1: on) - default: 1
-i <int>  spaces to indent - default:4
-l        indent long comments
-b <int>  braces-style (0: PEAR - 1:C) - default:0
-w        word wrap  - Use it for printing only!
-m <int>  max chars per line - default: 40 (for word wrap)
-d        delete empty lines
-u        find functions and list at the beginning

* Options you can put in your source code:
- // NO_BEAUTIFY 
	Turn off beautifying until // BEAUTIFY

- // BEAUTIFY
	Turn on beautifying

