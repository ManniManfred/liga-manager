<?php
  defined('_JEXEC') or die('Restricted access');
?>


<?php if ($this->params->get( 'show_page_title', 1 )) : ?>

    <h1 class="componentheading">
                <?php echo $this->params->get('page_title'); ?>
        </h1>

<?php endif; ?>


<?php if ($this->params->get('showintrotext')) : ?>
        <div class="description no_space floattext">
                <?php echo $this->params->get('introtext'); ?>
        </div>
<?php endif; ?>

<form action="<?php echo JRoute::_('index.php') ?>" method="post" name="adminForm">
<table>
  <tr>
    <td>Spieltyp: </td>
    <td><?php echo $this->spieltypSelect; ?></td>
  </tr>
</table>
</form>

<script language="Javascript">
<!--
  function init() {
    document.adminForm.onchange = onTypChanged;
  }

  function onTypChanged() {
    document.adminForm.submit();
  }

  init();
//-->
</script>

<div id="eventlist">
  <table class="adminlist" width="100%">
  <thead>
    <tr>
      <th  class="sectiontableheader" width=150>Datum
      </th>
      <th class="sectiontableheader">Spieltyp
      </th>
      <th class="sectiontableheader">Mannschaft1
      </th>
      <th class="sectiontableheader">Mannschaft2
      </th>
      <th class="sectiontableheader">Beschreibung
      </th>
      <th class="sectiontableheader">Tore1
      </th>
      <th class="sectiontableheader">Tore2
      </th>
    </tr>
  </thead>
<?php
   
  $count = 0;
  foreach ($this->rows as $row) {
    $link = JRoute::_('index.php?option=com_fussball&view=spiel&cid[]='. $row->id . '&Itemid=' . $this->Itemid );
  ?>
      <tr class="sectiontableentry<?php echo (($count % 2) + 1); ?>">
        <td>
          <a href="<?php echo $link; ?>"><?php echo $row->datum; ?></a>
        </td>
        <td>
          <a href="<?php echo $link; ?>"><?php echo $row->typ; ?></a>
        </td>
        <td>
          <a href="<?php echo $link; ?>"><?php echo $row->nameMannschaft1; ?></a>
        </td>
        <td>
          <a href="<?php echo $link; ?>"><?php echo $row->nameMannschaft2; ?></a>
        </td>
        <td>
          <a href="<?php echo $link; ?>"><?php echo substr(strip_tags($row->spielBeschreibung), 0, 40) . ' ...'; ?></a>
        </td>
        <td>
          <a href="<?php echo $link; ?>"><?php echo $row->tore1; ?></a>
        </td>
        <td>
          <a href="<?php echo $link; ?>"><?php echo $row->tore2; ?></a>
        </td>
      </tr>
  <?php
    $count++;
  }
?>
  </table>
</div>