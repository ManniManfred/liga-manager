<?php
  defined('_JEXEC') or die('Restricted access');
?>
<h1>Mannschaften</h1>
<ul>
<?php
   
  // Auslesen der Datensaetze im Array
  foreach ($this->rows as $row) {
  ?>
  <li><?php echo $row->name; ?>
  </li>
  <?php
  }
?>
</ul>
