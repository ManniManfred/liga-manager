<?php
  defined('_JEXEC') or die('Restricted access');
   
?>


<h1>Ihre Spielerdaten bearbeiten</h1>

<?php
   
   
   
  if (isset($this->error)) {
    echo $this->error;
  } else {
     
     
    $infos = (array) $this->infos;
    $attrs = $this->attributes;
     
    //print_r($this->bla);
     
     
  ?>

<form action="index.php" method="POST">
<table>

<tr>
  <th>Name</th>
  <td><?php echo $infos['name'] ?></td>
</tr>

  <?php
     
    //print_r($infos);
    //print_r($attrs);
    //print_r($this->params->get('infos'));
     
    $bild_dir = '/images/spieler/';
     
    for ($i = 0; $i < count($attrs); $i++) {
      $attrName = $attrs[$i]->name;
      if ($attrs[$i]->attrType == 'img') {
        $img = '<img width="80" alt="Spielerfoto" src="' . $bild_dir . $infos[$attrName] . '">';
        $eingabe = $img;
      }
      else if ($attrs[$i]->attrType == 'date') {
        $eingabe = JHTML::_('calendar', $infos[$attrName], $attrName, $attrName, '%Y-%m-%d', array('class' => 'inputbox', 'size' => '25', 'maxlength' => '19'));
        $eingabe .= '( Format: JJJJ-MM-TT Bsp.: 1985-02-28 )';
      } else {
        $eingabe = '<input type="text" name="' . $attrName . '" value="' . $infos[$attrName] . '">';
      }
       
       
      if ($attrs[$i]->displayName == '') {
        $displayName = $attrs[$i]->name;
      } else {
        $displayName = $attrs[$i]->displayName;
      }
    ?>
<tr>
  <th><?php echo $displayName; ?></th>
  <td>
    <?php echo $eingabe ?>
  </td>
</tr>

    <?php
    }
     
  ?>

</table>

<input type="submit" value="Speichern">


<input type="hidden" name="id" value="<?php echo $infos['id'];?>" />
<input type="hidden" name="option" value="com_fussball" />
<input type="hidden" name="controller" value="editspieler" />
<input type="hidden" name="task" value="save" />
<?php echo JHTML::_( 'form.token' ); ?>

</form>

  <?php
     
  }
?>

