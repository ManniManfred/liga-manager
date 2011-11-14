<?php
   
  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
   
  jimport('joomla.application.component.view' );
   
   
  class FussballViewSpiel extends JView {
    /**
     * display method of Hello view
     * @return void
     **/
    function display($tpl = null) {
      $spiel = & $this->get('Data');
      $isNew = ($spiel->id < 1);
       
      $text = $isNew ? JText::_('New' ) : JText::_('Edit' );
      JToolBarHelper::title(JText::_('Spiel' ).': <small>[ ' . $text.' ]</small>' );
      JToolBarHelper::save();
      if ($isNew) {
        JToolBarHelper::cancel();
      } else {
        // for existing items the button is renamed `close`
        JToolBarHelper::cancel('cancel', 'Close' );
      }
       
      if ($spiel->idMannschaft1 == 0) {
        // setze Standard Mannschaft
        $spiel->idMannschaft1 = $this->getStandardMannschaftID();
      }
       
      if ($spiel->idMannschaft2 == 0) {
        // setze Standard Mannschaft
        $spiel->idMannschaft2 = $this->getStandardMannschaftID();
      }
       
      // Load the JEditor object
      $editor = & JFactory::getEditor();
       
      $this->assignRef('spiel', $spiel);
      $this->assignRef('mannschaft1', $this->__getMannschaftSelect($spiel->idMannschaft1, 1));
      $this->assignRef('mannschaft2', $this->__getMannschaftSelect($spiel->idMannschaft2, 2));
      $this->assignRef('editor', $editor);
      $this->assignRef('jsSpielerDaten', $this->__getJSSpielerDaten($spiel->id));
      $this->assignRef('spieltyp', $this->__getSpieltypSelect($spiel->idSpiel_typ));
       
       
      parent::display($tpl);
    }
     
     
    function __getMannschaftSelect($active = null, $nummer) {
      $db = & JFactory::getDBO();
       
      $query = 'SELECT id AS value, name AS text FROM #__fussball_mannschaft' ;
       
      $db->setQuery($query );
      $mannschaften = $db->loadObjectList();
       
      $mannschaft = JHTML::_('select.genericlist', $mannschaften, 'idMannschaft' . $nummer, 'class="inputbox"', 'value', 'text', $active );
      return $mannschaft;
    }
     
    function __getSpieltypSelect($active = null) {
      $db = & JFactory::getDBO();
       
      $query = 'SELECT id AS value, name AS text FROM #__fussball_spiel_typ' ;
       
      $db->setQuery($query );
      $typen = $db->loadObjectList();
       
      $typen = JHTML::_('select.genericlist', $typen, 'idSpiel_typ', 'class="inputbox"', 'value', 'text', $active );
      return $typen;
    }
     
    function getStandardMannschaftID() {
      $db = & JFactory::getDBO();
       
      $query = 'Select id FROM #__fussball_mannschaft WHERE isDefault = true';
       
      $db->setQuery($query);
      $mannschaft = $db->loadResult();
       
      return $mannschaft;
       
    }
     
    function __getJSSpielerDaten($spielId) {
      $result = "var spielerDaten = new Array();\n";
      //$result = "var obj;\n";
       
      $db = & JFactory::getDBO();
       
      $query = 'SELECT M.id as mannschaft, S.id as idSpieler, S.name as spielername, K.anzahlTore as tore, K.hasRoteKarte as rot, K.hasGelbeKarte as gelb, K.hasGelbRoteKarte as gelbrot FROM #__fussball_mannschaft as M LEFT JOIN #__fussball_spieler as S on S.idMannschaft = M.id LEFT JOIN #__fussball_spieler_spiel as K on S.id = K.idSpieler AND K.idSpiel = ' . $spielId;
       
       
      $db->setQuery($query );
       
       
      $jsSpieler = $db->loadObjectList();
      $mannschaft = '';
       
      for ($i = 0; $i < count($jsSpieler); $i++) {
        if ($mannschaft != $jsSpieler[$i]->mannschaft) {
          $mannschaft = $jsSpieler[$i]->mannschaft;
          $result .= 'spielerDaten[' . $jsSpieler[$i]->mannschaft . '] = new Array();' . "\n";
          $spielerCount = 0;
        }
        if ($jsSpieler[$i]->spielername != '') {
          $result .= 'obj = new Object();' . "\n";
          $result .= 'obj.name = "' . $jsSpieler[$i]->spielername . '";' . "\n";
          $result .= 'obj.id = "' . $jsSpieler[$i]->idSpieler . '";' . "\n";
           
          if ($jsSpieler[$i]->tore != null) {
            $result .= 'obj.dabei = true;' . "\n";
            $result .= 'obj.tore = ' . $jsSpieler[$i]->tore . ";\n";
            $result .= 'obj.gelb = ' . $jsSpieler[$i]->gelb . ";\n";
            $result .= 'obj.gelbrot =' . $jsSpieler[$i]->gelbrot . ";\n";
            $result .= 'obj.rot = ' . $jsSpieler[$i]->rot . ";\n";
          } else {
            $result .= 'obj.dabei = false;' . "\n";
            $result .= 'obj.tore = 0;' . "\n";
            $result .= 'obj.gelb = false;' . "\n";
            $result .= 'obj.gelbrot = false;' . "\n";
            $result .= 'obj.rot = false;' . "\n";
          }
          $result .= 'spielerDaten[' . $jsSpieler[$i]->mannschaft . '][' . $spielerCount . '] = obj;' . "\n";
          $spielerCount++;
        }
      }
       
      return $result;
    }
     
  }
   
?>


