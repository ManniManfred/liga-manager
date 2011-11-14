<?php
  defined('_JEXEC') or die('Restricted access');
?>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>

<script language="javascript" type="text/javascript">
//<![CDATA[
        function submitbutton(pressbutton) {
                var form = document.adminForm;
                if (pressbutton == 'cancel') {
                        submitform( pressbutton );
                        return;
                }
                // do field validation
                if (form.name.value == "") {
                        alert( "<?php echo JText::_( 'Spieler must have a name', true ); // blalas lxkcvjpaosidfqwelr laskdfj asdpofj joijqwer aklsdfj
                        ?>" );
                } else {
                        submitform( pressbutton );
                }
        }
//]]>
</script>

  <title></title>
</head>

<body>
  <form action="index.php" method="post" name="adminForm" id="adminForm">
    <div>
      <fieldset class="adminform">
        <legend><?php echo JText::_( 'Details' ); ?></legend>

        <table class="admintable">
          <tr>
            <td width="110" class="key"><label for=
            "name"><?php echo JText::_( 'Name' ); ?>:</label></td>

            <td><input class="inputbox" type="text" name="name" id="name" size=
            "60" value="<?php echo $this->spieler->name; ?>" /></td>
          </tr>

          <tr>
            <td width="110" class="key"><label for=
            "title"><?php echo JText::_( 'Mannschaft' ); ?>:</label></td>

            <td><?php echo $this->mannschaft; ?></td>
          </tr>

          <tr>
            <td width="110" class="key"><label for=
            "anzahlSpiele"><?php echo JText::_( 'Anzahl Spiele' ); ?>:</label></td>

            <td><input class="inputbox" type="text" name="anzahlSpiele" id=
            "anzahlSpiele" size="60" value=
            "<?php echo $this->spieler->anzahlSpiele; ?>" /></td>
          </tr>
        </table>
      </fieldset>
    </div>

    <div class="clr"></div>

    <div class="clr"></div><input type="hidden" name="option" value=
    "com_fussball" /> <input type="hidden" name="id" value=
    "<?php echo $this->spieler->id; ?>" /> <input type="hidden" name="task"
    value="" /> <input type="hidden" name="controller" value="spieler" />
  </form>
</body>
</html>
