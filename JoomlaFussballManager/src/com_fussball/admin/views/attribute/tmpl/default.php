<?php
  defined('_JEXEC') or die('Restricted access');
?>



<form action="index.php" method="post" name="adminForm">
<div id="editcell">
  <table class="adminlist">
  <thead>
    <tr>
    <tr>
      <th width="5">
        <?php echo JText::_( 'NUM' ); ?>
      </th>
      <th width="20">
        <input type="checkbox" name="toggle" value="" onclick="checkAll(<?php echo count( $this->items ); ?>);" />
      </th>
      <th width="80" class="title">
        <?php echo JHTML::_('grid.sort',   'Attribute Type', 'attrType', @$lists['order_Dir'], @$this->lists['order'] ); ?>
      </th>
      <th  class="title">
        <?php echo JHTML::_('grid.sort',   'Attribute Name', 'name', @$lists['order_Dir'], @$this->lists['order'] ); ?>
      </th>
      <th  class="title">
        <?php echo JHTML::_('grid.sort',   'Anzuzeigender Name', 'displayName', @$lists['order_Dir'], @$this->lists['order'] ); ?>
      </th>
    </tr>

  </thead>
<?php
  $k = 0;
  for ($i = 0, $n = count($this->items );
  $i < $n;
  $i++) {
    $row = &$this->items[$i];
     
    $checked = JHTML::_('grid.id', $i, $row->id );
    $link = JRoute::_('index.php?option=com_fussball&controller=attribut&task=edit&cid[]='. $row->id );
     
  ?>
    <tr class="<?php echo "row$k"; ?>">
      <td>
        <?php echo $row->id; ?>
      </td>
      <td>
        <?php echo $checked; ?>
      </td>
      <td>
        <a href="<?php echo $link; ?>"><?php echo $row->attrType; ?></a>
      </td>
      <td>
        <a href="<?php echo $link; ?>"><?php echo $row->name; ?></a>
      </td>
      <td>
        <a href="<?php echo $link; ?>"><?php echo $row->displayName; ?></a>
      </td>
    </tr>
  <?php
    $k = 1 - $k;
  }
?>
  </table>
</div>

<input type="hidden" name="option" value="com_fussball" />
<input type="hidden" name="task" value="" />
<input type="hidden" name="boxchecked" value="0" />
<input type="hidden" name="controller" value="attribut" />
</form>
