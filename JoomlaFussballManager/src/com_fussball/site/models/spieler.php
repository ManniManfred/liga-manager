<?php
   
  // Check to ensure this file is included in Joomla!
  defined('_JEXEC') or die();
  jimport('joomla.application.component.model');
   
   
  class FussballModelSpieler extends JModel {
     
    var $_data;
    var $_id;
     
     
    /**
     * Constructor that retrieves the ID from the request
     *
     * @access  public
     * @return  void
     */
    function __construct() {
      parent::__construct();
       
      $array = JRequest::getVar('cid', 0, '', 'array');
      $this->setId((int)$array[0]);
       
    }
     
    /**
     * Method to set the hello identifier
     *
     * @access  public
     * @param  int Hello identifier
     * @return  void
     */
    function setId($id) {
      // Set id and wipe data
      $this->_id = $id;
      $this->_data = null;
    }
     
    /**
     * Returns the query
     * @return string The query to be used to retrieve the rows from the database
     */
    function _buildQuery($spieler_id) {
      $select = 'SELECT S.*, A.*';
	  $from = ' FROM #__fussball_spieler as S'
		. ' LEFT JOIN #__fussball_spieler_saison as A ON A.id = S.id';
	  $where = ' WHERE S.id=' . $spieler_id;
	  
      $attrs = $this->__getAttributes();
       
      for ($i = 0; $i < count($attrs); $i++) {
		$fieldName = $attrs[$i]->attrType . 'Value';
		$attrName = $attrs[$i]->name;
		$fieldId = $attrs[$i]->id;
		
		$select .= ", V$i.$fieldName AS $attrName";
		$from .= " LEFT JOIN (SELECT idSpieler, $fieldName "
			. " from #__fussball_AttributeValue WHERE idAttribute = $fieldId) V$i"
			. " ON V$i.idSpieler = S.id";
	  } 
	  
      $query = $select . $from . $where . ';';
	  
	  return $query;
    }
      
     
     
     
    function &getData() {
      //echo $this->_id;
      return $this->getSpielerDetails($this->_id);
    }
     
    /**
     */
    function getSpielerDetails($spieler_id) {
      $result = null;
       
      // Lets load the data if it doesn't already exist
      if (empty($this->_data )) {
        $query = $this->_buildQuery($spieler_id);
		
		
        $db = & JFactory::getDBO();
		$db->setQuery("set SQL_BIG_SELECTS=1;");
        $db->query(); 
		
        $list = $this->_getList($query);
        if (count($list) == 1) {
          $this->_data = $list[0];
        }
      }
       
      return $this->_data;
    }
     
     
    function __getAttributes() {
      $db = & JFactory::getDBO();
       
      $query = 'SELECT * FROM #__fussball_Attribute';
       
      $db->setQuery($query);
      $result = $db->loadObjectList();
       
      return $result;
    }
     
     
    /**
     * Method to store the user data
     *
     * @access      public
     * @return      boolean True on success
     * @since       1.5
     */
    function store($data) {
       
      $spieler_id = $data["id"];
       
      $db = & JFactory::getDBO();
       
      $success = true;
      $meldung = 'Alles hat geklappt.';
      //$db = new JDatabase(array(CLIENT_MULTI_RESULTS));
       
       
      // do update on .._details
      /*
       $query = "UPDATE #__fussball_spieler_details where id = '$spieler_id'"
       . " SET
       $db->setQuery(
       */
       
      $attrs = $this->__getAttributes();
       
       
      $db->BeginTrans();
       
      for ($i = 0; $i < count($attrs); $i++) {
        $error = print_r($data, true);
        $new_value = $data[$attrs[$i]->name];
         
        $sqlType = $attrs[$i]->attrType;
        if ($sqlType == 'img') $sqlType = 'text';
         
        if ($sqlType == 'text' or $sqlType == 'date') {
          // test if $new_value contains '
          if (!(strpos($new_value, "'") === FALSE)) {
            $success = false;
            $meldung = 'Der neue Wert darf kein einfaches Hochkommata enthalten.';
            break;
          } else {
            $new_value = "'" . $new_value . "'";
          }
        } else {
          if ($sqlType == 'int') {
            $new_value = (int) $new_value;
          }
          else if ($sqlType == 'double') {
            $new_value = (double) $new_value;
          }
          else if ($sqlType == 'bool') {
            $new_value = (boolean) $new_value;
          }
        }
         
        $query = "select * from #__fussball_AttributeValue" . " where idAttribute = " . $attrs[$i]->id . " and idSpieler = " . $spieler_id;
        $db->setQuery($query);
        $db->query();
         
        $attrValExists = $db->getNumRows() > 0;
         
        if ($attrValExists) {
           
          $query = "update #__fussball_AttributeValue" . " SET " . $sqlType . "Value = ". $new_value . " where idAttribute = " . $attrs[$i]->id . " and idSpieler = " . $spieler_id;
        } else {
          $query = "INSERT INTO #__fussball_AttributeValue (idAttribute, idSpieler, " . $sqlType . "Value)" . " VALUES(" . $attrs[$i]->id . ", " . $spieler_id . ", " . $new_value . ");";
           
        }
         
        $db->Execute($query);
        if ($db->getErrorNum() > 0) {
          $this->setError($db->getErrorMsg());
          $db->RollbackTrans();
           
          return false;
        }
        //$this->setError("query = " . $query );
        //return false;
         
      }       
       
      if ($db->getErrorNum() > 0 || !$success) {
        if ($success) {
          $this->setError($db->getErrorMsg());
        } else {
          $this->setError($meldung);
        }
        $db->RollbackTrans();
         
        return false;
      }
       
      $db->CommitTrans();
       
       
      return true;
    }
     
  }
   
   
