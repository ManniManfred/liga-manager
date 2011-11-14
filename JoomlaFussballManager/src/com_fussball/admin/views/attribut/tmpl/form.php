<?php
  defined('_JEXEC') or die('Restricted access');
?>

<script language="javascript" type="text/javascript">
  function submitbutton(pressbutton) {
    var form = document.adminForm;
    if (pressbutton == 'cancel') {
      submitform( pressbutton );
      return;
    }
    // do field validation
    if (form.name.value == "") {
      alert( "<?php echo JText::_( 'Attribut benoetigt einen Namen.', true ); ?>" );
    } else {
      submitform( pressbutton );
    }
  }
</script>

<form action="index.php" method="post" name="adminForm" id="adminForm">
<div>
  <fieldset class="adminform">
  <legend><?php echo JText::_( 'Details' ); ?></legend> 
  <table class="admintable">
    <tr>
      <td width="110" class="key">
        <label for="attrType">
          <?php echo JText::_( 'Attribute Type' ); ?>:
        </label>
      </td>
      <td>
        <?php echo $this->typeSelect; ?>
      </td>
    </tr>
    <tr>
      <td width="110" class="key">
        <label for="name">
          <?php echo JText::_( 'Name' ); ?>:
        </label>
      </td>
      <td>
        <input class="inputbox" type="text" name="name" id="name" size="60" value="<?php echo $this->attribut->name; ?>" />
      </td>
    </tr>
    <tr>
      <td width="110" class="key">
        <label for="displayName">
          <?php echo JText::_( 'Angezeigter Name' ); ?>:
        </label>
      </td>
      <td>
        <input class="inputbox" type="text" name="displayName" id="displayName" size="80" value="<?php echo $this->attribut->displayName; ?>" />
      </td>
    </tr>
  </table>
  </fieldset>
</div>
<div class="clr"></div>
<div class="clr"></div>

<input type="hidden" name="option" value="com_fussball" />
<input type="hidden" name="id" value="<?php echo $this->attribut->id; ?>" />
<input type="hidden" name="task" value="" />
<input type="hidden" name="controller" value="attribut" />
</form>
