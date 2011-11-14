<?php
  defined('_JEXEC') or die('Restricted access');
?>

<h1><?php echo $this->spiel->nameMannschaft1 . ' vs ' . $this->spiel->nameMannschaft2 . ' ' . $this->spiel->tore1 . ' : ' . $this->spiel->tore2; ?></h1>

<p><b>Datum: </b><?php echo $this->spiel->datum; ?></p>

<?php
  $image_tag_tpl = '<img width="15" src="'. $this->baseurl . '/components/com_fussball/assets/images/%karte%.png"/>';
   
  $img_gelb = str_replace('%karte%', 'gelb', $image_tag_tpl);
  $img_gelbrot = str_replace('%karte%', 'gelbrot', $image_tag_tpl);
  $img_rot = str_replace('%karte%', 'rot', $image_tag_tpl);
   
   
  if (isset($this->spiel->mannschaft1) && count($this->spiel->mannschaft1) > 0) {
    echo "<p><b>Spieler der Mannschaft 1: </b>";
    for($i = 0; $i < count($this->spiel->mannschaft1); $i++) {
       
      echo getSpielerString($this->spiel->mannschaft1[$i], $img_gelb, $img_gelbrot, $img_rot);
      if ($i < count($this->spiel->mannschaft1) - 1) {
        echo ', ';
      }
    }
  }
   
   
  if (isset($this->spiel->mannschaft2) && (count($this->spiel->mannschaft2) > 0)) {
    echo "<p><b>Spieler der Mannschaft 2: </b>";
    for($i = 0; $i < count($this->spiel->mannschaft2); $i++) {
       
      echo getSpielerString($this->spiel->mannschaft2[$i], $img_gelb, $img_gelbrot, $img_rot);
      if ($i < count($this->spiel->mannschaft2) - 1) {
        echo ', ';
      }
    }
  }
   
  function getSpielerString($spieler, $img_gelb, $img_gelbrot, $img_rot) {
    $result = $spieler->name;
     
    // Wenn irgendwas besonderes war
    if ($spieler->tore != 0 || $spieler->gelb || $spieler->gelbrot || $spieler->rot) {
      $result .= ' (';
       
       
      if ($spieler->gelb) {
        $result .= $img_gelb;
      }
       
       
      if ($spieler->gelbrot) {
        $result .= $img_gelbrot;
      }
       
      if ($spieler->rot) {
        $result .= $img_rot;
      }
       
      if ($spieler->tore != 0) {
        $result .= 'Tore: <b>' . $spieler->tore . '</b>';
      }
      $result .= ')';
    }
    return $result;
  }
?>
</p>
<h2>Spielbeschreibung</h2>
<div id="beschreibung">
<?php
  if (isset($this->spiel->beschreibung) && $this->spiel->beschreibung != null) {
    echo $this->spiel->beschreibung;
  } else {
    echo JText::_("Es wurde leider keine Spielbeschreibung eingetragen");
  }
?>
</div>
<br>
<br>

