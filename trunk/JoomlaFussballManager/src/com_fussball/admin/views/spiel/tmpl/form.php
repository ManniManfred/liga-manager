<?php
  defined('_JEXEC') or die('Restricted access');
?>

<script language="javascript" type="text/javascript">

  <?php echo $this->jsSpielerDaten; ?>



  function init() {
    document.adminForm.idMannschaft1.onchange = onMannschaft1Changed;
    document.adminForm.idMannschaft2.onchange = onMannschaft2Changed;
    initTables();
  }

  function initTables() {
    var m1id = <?php echo $this->spiel->idMannschaft1; ?>;
    var m2id = <?php echo $this->spiel->idMannschaft2; ?>;

    if (spielerDaten[m1id]) {
      showMannschaftInTable(m1id, document.getElementById("spielerM1"));
    }

    if (spielerDaten[m2id]) {
      showMannschaftInTable(m2id, document.getElementById("spielerM2"));
    }
  }

  function onMannschaft1Changed() {
    showMannschaftInTable(document.adminForm.idMannschaft1.value, document.getElementById("spielerM1"));
  }

  function onMannschaft2Changed() {
    showMannschaftInTable(document.adminForm.idMannschaft2.value, document.getElementById("spielerM2"));
  }


  function showMannschaftInTable(mannschaft, table) {
    // clear table
    while(table.hasChildNodes()){
      table.removeChild(table.lastChild);
    }

    // fill table
    for (var i = 0, l = spielerDaten[mannschaft].length; i < l; i++) {
      table.appendChild(createNewSpielerRow(spielerDaten[mannschaft][i], "ma" + mannschaft + "sp" + i));
    }
  }

  function createNewSpielerRow(spieler, formid) {
    var row = document.createElement("tr");

    var colDabei = document.createElement("td");
    colDabei.appendChild(createCheckbox(formid + "_dabei", spieler.dabei));
    colDabei.appendChild(createHiddenfield(formid + "_id", spieler.id));
    row.appendChild(colDabei);

    var colName = document.createElement("td");
    colName.appendChild(document.createTextNode(spieler.name));
    row.appendChild(colName);

    var colGelb = document.createElement("td");
    colGelb.appendChild(createTextfield(formid + "_tore", spieler.tore));
    row.appendChild(colGelb);

    var colGelb = document.createElement("td");
    colGelb.appendChild(createCheckbox(formid + "_gelb", spieler.gelb));
    row.appendChild(colGelb);

    var colGelbRot = document.createElement("td");
    colGelbRot.appendChild(createCheckbox(formid + "_gelbrot", spieler.gelbrot));
    row.appendChild(colGelbRot);

    var colRot = document.createElement("td");
    colRot.appendChild(createCheckbox(formid + "_rot", spieler.rot));
    row.appendChild(colRot);

    return row;
  }

  function createCheckbox(id, value) {
    var check = document.createElement("input");
    check.setAttribute("type", "checkbox");
    if (value) {
      check.setAttribute("checked", value);
    }
    check.setAttribute("id", id);
    check.setAttribute("name", id);
    return check;
  }

  function createTextfield(id, value) {
    textfield = document.createElement("input");
    textfield.setAttribute("type", "text");
    textfield.setAttribute("value", value);
    textfield.setAttribute("id", id);
    textfield.setAttribute("name", id);
    textfield.setAttribute("size", 3);
    textfield.style.textAlign = 'right';
    return textfield;
  }


  function createHiddenfield(id, value) {
    textfield = document.createElement("input");
    textfield.setAttribute("type", "hidden");
    textfield.setAttribute("value", value);
    textfield.setAttribute("id", id);
    textfield.setAttribute("name", id);
    return textfield;
  }


  function submitbutton(pressbutton) {
    var form = document.adminForm;
    if (pressbutton == 'cancel') {
      submitform( pressbutton );
      return;
    }

    // do field validation
    if (form.idMannschaft1.value == form.idMannschaft2.value) {
      alert("Eine Mannschaft kann nicht gegen sich selbst spielen. "
        + "Bitte ändern Sie eine der Mannschaften.");
      return;
    }

    var spielbeschreibung = <?php echo $this->editor->getContent( 'spielbeschreibung' ); ?>



    <?php echo $this->editor->save( 'spielbeschreibung' ); ?>

    submitform( pressbutton );
  }


  window.onload = init;

  //window.setTimeout("init()", 2000);


</script>

<form action="index.php" method="post" name="adminForm" id="adminForm">
<div>
  <fieldset class="adminform">
  <legend><?php echo JText::_( 'Details' ); ?></legend>
  <table class="admintable">
    <tr>
      <td width="110" class="key">
        <label for="name">
          <?php echo JText::_( 'Datum' ); ?>:
        </label>
      </td>
      <td>
        <?php echo JHTML::_('calendar', $this->spiel->datum, 'datum', 'datum', '%Y-%m-%d %H:%M:%S', array('class'=>'inputbox', 'size'=>'25',  'maxlength'=>'19')); ?>
      </td>
    </tr>
    <tr>
      <td width="110" class="key">
        <label for="name">
          <?php echo JText::_( 'Spieltyp' ); ?>:
        </label>
      </td>
      <td>
        <?php echo $this->spieltyp ?>
      </td>
    </tr>
  </table>

<p></p>
<table border=1>
  <tr>
    <td><?php echo $this->mannschaft1; ?></td>
    <td><strong>vs.</strong></td>
    <td><?php echo $this->mannschaft2; ?></td>
    <td width=20></td>
    <td>
      <input style="text-align:right" class="inputbox" type="text" name="tore1" id="name" size="3" value="<?php echo $this->spiel->tore1; ?>" />
      <strong>:</strong><input class="inputbox" type="text" name="tore2" id="name" size="3" value="<?php echo $this->spiel->tore2; ?>" />
    </td>
  </tr>
  <tr valign="top">
    <td >
      <table>
        <thead>
          <tr>
            <th>Dabei</th>
            <th>Spielername</th>
            <th>Tore</th>
            <th>Gelbe</th>
            <th>GelbRote</th>
            <th>Rote</th>
          <tr>
        <thead>
        <tbody id="spielerM1">
        </tbody>
      </table>
    </td>
    <td>
    </td>
    <td>
      <table>
        <thead>
          <tr>
            <th>Dabei</th>
            <th>Spielername</th>
            <th>Tore</th>
            <th>Gelbe</th>
            <th>GelbRote</th>
            <th>Rote</th>
          <tr>
        <thead>
        <tbody id="spielerM2">
        </tbody>
      </table>
    </td>
  </tr>
</table>

<span style="width:20px;"> </span>
<p>
Spielbericht
</p>
<?php
  echo $this->editor->display('spielbeschreibung', $this->spiel->spielbeschreibung, '600', '400', '70', '15');
?>

  </fieldset>
</div>
<div class="clr"></div>
<div class="clr"></div>

<!--
<input type="hidden" name="spielerListe1" value="" />
<input type="hidden" name="spielerListe2" value="" />
-->
<input type="hidden" name="option" value="com_fussball" />
<input type="hidden" name="id" value="<?php echo $this->spiel->id; ?>" />
<input type="hidden" name="task" value="" />
<input type="hidden" name="controller" value="spiel" />
</form>
