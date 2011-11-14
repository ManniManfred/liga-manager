<?php
  defined('_JEXEC') or die('Restricted access');
  $infos = (array) $this->infos;
  $attrs = $this->attributes;
   
  $img = '<img src="/images/spieler/' . str_replace(' ', '_', $infos['name']) . '.jpg">';
?>

<h1><?php echo $infos['name'] ?></h1>

<?php echo $img; ?>

<h2>Allgemeine Angaben</h2>
<table>


<?php
  //print_r($infos);
  //print_r($attrs);
  //print_r($this->params->get('infos'));
   
  for ($i = 0; $i < count($attrs); $i++) {
    if ($attrs[$i]->displayName == '') {
      $displayName = $attrs[$i]->name;
    } else {
      $displayName = $attrs[$i]->displayName;
    }
  ?>
<tr>
  <th><?php echo $displayName; ?></th>
  <td><?php echo $infos[$attrs[$i]->name]; ?></td>
</tr>

  <?php
     
  }
   
?>
</table>


<h2>Saison</h2>

<table>

<tr>
  <th>Anzahl Spiele Gesamt</th>
  <td><?php echo ($infos["spiele"] + $infos["anzahlSpiele"]); ?></td>
</tr>
<tr>
  <th>Anzahl Tore Gesamt</th>
  <td><?php echo ($infos["tore"] + $infos["anzahlTore"]); ?></td>
</tr>
<tr>
  <th>Gelbe Karten</th>
  <td><?php echo $infos["gelb"]; ?></td>
</tr>
<tr>
  <th>Gelbrote Karten</th>
  <td><?php echo $infos["gelbrot"]; ?></td>
</tr>
<tr>
  <th>Rote Karten</th>
  <td><?php echo $infos["rot"]; ?></td>
</tr>
</table>