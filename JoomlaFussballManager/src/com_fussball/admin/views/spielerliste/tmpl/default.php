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
      <th  class="title">
        <?php echo JHTML::_('grid.sort',   'Spieler', 'name', @$lists['order_Dir'], @$this->lists['order'] ); ?>
      </th>
                        <th  class="title" width=150>
                                <?php echo JHTML::_('grid.sort',   'Mannschaft', 'nameMannschaft', @$lists['order_Dir'], @$this->lists['order'] ); ?>
                        </th>
                        <th width=100>
                          <?php echo JHTML::_('grid.sort',   'Anzahl Spiele', 'anzahlSpiele', @$lists['order_Dir'], @$this->lists['order'] ); ?>
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
    $link = JRoute::_('index.php?option=com_fussball&controller=spieler&task=edit&cid[]='. $row->id );
    $mannschaftslink = JRoute::_('index.php?option=com_fussball&controller=mannschaft&task=edit&cid[]='. $row->idMannschaft );
  ?>
    <tr class="<?php echo "row$k"; ?>">
      <td>
        <?php echo $row->id; ?>
      </td>
      <td>
        <?php echo $checked; ?>
      </td>
      <td>
        <a href="<?php echo $link; ?>"><?php echo $row->name; ?></a>
      </td>
                        <td>
                                <a href="<?php echo $mannschaftslink; ?>"><?php echo $row->nameMannschaft; ?></a>
                        </td>
                        <td>
                                <?php echo $row->anzahlSpiele; ?>
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
<input type="hidden" name="controller" value="spieler" />
</form>
