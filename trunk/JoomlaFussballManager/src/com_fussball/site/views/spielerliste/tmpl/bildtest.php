<?php
  defined('_JEXEC') or die('Restricted access');
?>

<script language="javascript" type="text/javascript">

        function tableOrdering( order, dir, view ) {
                var form = document.adminForm;

                form.order.value         = order;
                form.order_Dir.value     = dir;
                document.adminForm.submit( view );
        }
</script>

<form action="<?php echo JRoute::_('index.php') ?>" method="post" name="adminForm">
  <input type="hidden" name="order">
  <input type="hidden" name="order_Dir">
</form>

<?php if ($this->params->get( 'show_page_title', 1 )) : ?>

    <h1 class="componentheading">
                <?php echo $this->params->get('page_title'); ?>
        </h1>

<?php endif; ?>


<?php if ($this->params->get('showintrotext')) : ?>
        <div class="description no_space floattext">
                <?php echo $this->params->get('introtext'); ?>
        </div>
<?php endif;

if (!isset($this->rows)) {
  echo "<p>Es sind keine Spieler in der Standard Mannschaft vorhanden.</p>";
  return;
}


$image_tag_tpl = '<img width="15" src="'. $this->baseurl . '/components/com_fussball/assets/images/%karte%.png"/>';

$img_gelb = str_replace('%karte%', 'gelb', $image_tag_tpl);
$img_gelbrot = str_replace('%karte%', 'gelbrot', $image_tag_tpl);
$img_rot = str_replace('%karte%', 'rot', $image_tag_tpl);

?>
<div id="eventlist">
<table width="100%">
  <thead>
  <tr>
    <th class="sectiontableheader">Bild</th>
    <th class="sectiontableheader"><?php echo JHTML::_('grid.sort','Name', 'name', $this->lists['order_Dir'], $this->lists['order'] ); ?></th>
    <th class="sectiontableheader"><?php echo JHTML::_('grid.sort','Spiele', 'spiele', $this->lists['order_Dir'], $this->lists['order'] ); ?></th>
    <th class="sectiontableheader"><?php echo JHTML::_('grid.sort','Tore', 'tore', $this->lists['order_Dir'], $this->lists['order'] ); ?></th>
    <th class="sectiontableheader"><?php echo JHTML::_('grid.sort',$img_gelb, 'gelb', $this->lists['order_Dir'], $this->lists['order'] ); ?></th>
    <th class="sectiontableheader"><?php echo JHTML::_('grid.sort',$img_gelbrot, 'gelbrot', $this->lists['order_Dir'], $this->lists['order'] ); ?></th>
    <th class="sectiontableheader"><?php echo JHTML::_('grid.sort',$img_rot, 'rot', $this->lists['order_Dir'], $this->lists['order'] ); ?></th>
  </tr>
  </thead>
  <tbody>
<?php
   
  // Auslesen der Datensaetze im Array
  $count = 0;
  foreach ($this->rows as $row) {
    $link = JRoute::_('index.php?option=com_fussball&view=spieler&cid[]='. $row->id . '&Itemid=' . $this->Itemid );
     
    $img = '<img src="/images/spieler/' . str_replace(' ', '_', $row->name) . '.jpg">';
  ?>
    <tr class="sectiontableentry<?php echo ($count % 2 ) + 1; ?>">
      <td><?php echo $img; ?></td>
      <td><a href="<?php echo $link; ?>"><?php echo $row->name; ?></a></td>
      <td><?php echo $row->spiele; ?></td>
      <td><?php echo $row->tore; ?></td>
      <td><?php echo $row->gelb; ?></td>
      <td><?php echo $row->gelbrot; ?></td>
      <td><?php echo $row->rot; ?></td>
    </tr>
  <?php
    $count++;
  }
?>
  </tbody>
</table>
</div>

