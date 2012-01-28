<?php

require_once "server/lib/JSON.phps";
require_once "config.php";
require_once "db.php";

class class_Core extends ServiceIntrospection {

    function method_GetDesign($params, $error) {
        if (count($params) != 0) {
            $error->SetError(JsonRpcError_ParameterMismatch, "Expected 0 parameter; got " . count($params));
            return $error;
        }

        $db = CreateDbConnection();

        $entries = $db->queryFetchAll("SELECT * from `" . $_ENV["table_prefix"] . "settings` S where S.key like 'design.%'");
        $designPrefixLength = strlen('design.');

        $design = array();
        for ($i = 0; $i < count($entries); $i++) {
            $key = $entries[$i]['key'];
            $key = substr($key, $designPrefixLength);
            $value = $entries[$i]['value'];
            $design[$key] = $value;
        }
        return $design;
    }

    function method_SetDesign($params, $error) {
        if (count($params) != 1) {
            $error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
            return $error;
        }

        $db = CreateDbConnection();

        $design = $params[0];

        foreach ($design as $key => $value) {
            $key = 'design.' . $db->escape_string($key);
            $value = "'" . $db->escape_string($value) . "'";

            $sql = "INSERT INTO `" . $_ENV["table_prefix"] . "settings` (`key`, `value`) VALUES ('$key', $value)"
                    . " ON DUPLICATE KEY UPDATE `value`=$value;";
            $db->query($sql);
        }
    }

    /**
     * Echo the (one and only) parameter.
     *
     * @param params
     *   An array containing the parameters to this method
     *
     * @param error
     *   An object of class JsonRpcError.
     *
     * @return
     *   Success: The object containing the result of the method;
     *   Failure: null
     */
    function method_IsCorrectlyLoggedIn($params, $error) {
        if (count($params) != 0) {
            $error->SetError(JsonRpcError_ParameterMismatch, "Expected 0 parameter; got " . count($params));
            return $error;
        }

        if (isset($_SESSION["user"])) {
            // TODO: what about changes on the user during a session?
            return true;
        }
        return false;
    }

    function method_GetUserRights($params, $error) {
        if (count($params) != 0) {
            $error->SetError(JsonRpcError_ParameterMismatch, "Expected 0 parameter; got " . count($params));
            return $error;
        }

        if (isset($_SESSION["user"])) {
            // changes during session are not considered! User has to logout and login
            $group = $_SESSION["user"]["rights"];
            return $group;
        }
        return null;
    }

    function method_Login($params, $error) {
        if (count($params) != 2) {
            $error->SetError(JsonRpcError_ParameterMismatch, "Expected 2 parameter; got " . count($params));
            return $error;
        }

        $db = CreateDbConnection();
        $username = $params[0];
        $password = $params[1];

        $passHash = hash(PASSWORD_HASH_ALGO, $password);


        $query = sprintf("select * from `" . $_ENV["table_prefix"] . "users` where username='%s' and password='%s'", $db->escape_string($username), $db->escape_string($passHash));


        $resultArr = $db->queryFetchAll($query);

        $result = array("result" => false, "message" => "Benutzer Passwort Kombination ist falsch.");

        if (count($resultArr) == 1) {
            $_SESSION["user"] = $resultArr[0];
            $result["result"] = true;
            $result["message"] = "ok";
        }

        return $result;
    }

    function method_Logout($params, $error) {
        if (count($params) != 0) {
            $error->SetError(JsonRpcError_ParameterMismatch, "Expected 0 parameter; got " . count($params));
            return $error;
        }

        unset($_SESSION["user"]);
    }

    function getFilter($db, $tableName, $filterMap) {
        $filter = '';
        if ($tableName == "match") {

            if (isset($filterMap->matchesOfUser) && $filterMap->matchesOfUser == true) {

                $team_id = $_SESSION["user"]["id_team"];
                //print_r($_SESSION["user"]);

                if ($team_id != null) {

                    // get id saison team
                    $queryResult = $db->queryFetchAll("select ST.id from `" . $_ENV["table_prefix"] . "saison_team` ST"
                            . " left join `" . $_ENV["table_prefix"] . "saison` S on ST.id_saison = S.id"
                            . " where S.isDefault and ST.id_team = $team_id");

                    $id_saison_team = $queryResult[0]["id"];

                    $filter = " where id_saison_team1 = $id_saison_team or id_saison_team2 = $id_saison_team";
                } else {
                    $filter = " where false";
                }
            } else {

                $filter = " where id_saison_team1 in (select id from `" . $_ENV["table_prefix"]
                        . "saison_team` where id_saison = " . $filterMap->saison_id . ")";

                if (isset($filterMap->team_id)) {
                    $team_id = (int) $filterMap->team_id;
                    $filter .= " and (id_saison_team1 = " . $team_id
                            . " or id_saison_team2 = " . $team_id . ")";
                }
            }
        } else if ($tableName == "play_table") {
            $filter = " where id_saison = " . ((int) $filterMap->saison_id);
        } else if ($tableName == "player_match") {
            $filter = " where id_match = " . ((int) $filterMap->match_id);
        }
        return $filter;
    }

    //
    // crud actions for entities
    //
	
	function getSelectStatement($db, $params, $onlyCount) {

        $tableName = $db->escape_string($params[0], $db);
        $tableNameWithPrefix = $_ENV["table_prefix"] . $tableName;

        $sqlQuery;

        if ($onlyCount) {
            $sqlQuery = "select count(*) from `$tableNameWithPrefix`";
            if (isset($params[1])) {
                $sqlQuery .= $this->getFilter($db, $tableName, $params[1]);
            }
        } else {
            if ($tableName == "users") {
                // change password to a dummy value
                $sqlQuery = "SELECT id, username, 'dummy' as `password`, firstname, lastname, email, id_team, rights FROM `$tableNameWithPrefix`";
            } else if ($tableName == "play_table") {
                $sqlQuery = "select @rownum:=@rownum+1 as rank, t.*,"
                        . " (t.wins * 3 + t.stand_off) as points,"
                        . " (t.shoot - t.got) as goals_diff, "
                        . " concat(shoot, ':', got) as goals"
                        . " from `$tableNameWithPrefix` t, (SELECT @rownum:=0) r";
            } else if ($tableName == "player_match") {
                $sqlQuery = "select PM.*, SP.id_saison_team from `$tableNameWithPrefix` PM"
                        . " left join `" . $_ENV["table_prefix"] . "saison_player` SP on SP.id = PM.id_saison_player";
            } else {
                $sqlQuery = "select * from `$tableNameWithPrefix`";
            }

            // set filter
            if (isset($params[5])) {
                $sqlQuery .= $this->getFilter($db, $tableName, $params[5]);
            }

            // set order
            if ($tableName == "play_table") {
                $sqlQuery .= " order by points desc, goals_diff desc, t.shoot desc";
            } else {
                if (isset($params[1]) && isset($params[2])) {

                    $sortField = $params[1];
                    $sortOrder = $params[2];

                    $sqlQuery .= " order by $sortField $sortOrder";
                }
            }

            // set limit
            if (isset($params[3]) && isset($params[4])) {
                $firstIndex = $params[3];
                $maxRows = $params[4] - $firstIndex;

                $sqlQuery .= " limit $firstIndex, $maxRows";
            }
        }
        //	echo $sqlQuery;
        return $sqlQuery;
    }

    function method_GetEntitiesCount($params, $error) {
        $db = CreateDbConnection();
        $sqlQuery = $this->getSelectStatement($db, $params, true);

        $result = $db->queryFetchAll($sqlQuery);
        return $result == null ? 0 : $result[0]["count(*)"];
    }

    function method_GetEntities($params, $error) {
        //sleep(1);
        $db = CreateDbConnection();

        $tableName = $db->escape_string($params[0], $db);
        $tableNameWithPrefix = $_ENV["table_prefix"] . $tableName;

        //echo "tablsd=" . $tableNameWithPrefix;

        $sqlQuery = $this->getSelectStatement($db, $params, false);

        return $db->queryFetchAll($sqlQuery, $tableNameWithPrefix);
    }

	/**
	 *
	 * @param MySQL $db
	 * @param string $player_name
	 * @param string $saison_team_id
	 * @return int The saison player id
	 */
	function createNewPlayer($db, $player_name, $saison_team_id) {
		$playerProps = array();
		
		// set team id
		$getTeamIdSql = 'select id_team from `' . $_ENV["table_prefix"] . 'saison_team`'
				. ' where id = ' . ((int)$saison_team_id);
		$teamIdResult = $db->queryFetchAll($getTeamIdSql);
		$playerProps['id_team'] = $teamIdResult[0]['id_team'];
		
		// set first and last name
		$name_parts = explode(' ', $player_name);
		if (count($name_parts > 1)) {
			$playerProps["firstname"] = trim($name_parts[0]);
			$playerProps["lastname"] = trim($name_parts[1]);
		} else {
			$playerProps["firstname"] = trim($player_name);
			$playerProps["lastname"] = "";
		}
		
		// insert the new player
		$db->insert($_ENV["table_prefix"] . 'player', $playerProps);
		$player_id = $db->getLastId();
		
		// insert saison player
		$saisonPlayerProps = array();
		$saisonPlayerProps['id_saison_team'] = $saison_team_id;
		$saisonPlayerProps['id_player'] = $player_id;
		
		// insert the new saison player
		$db->insert($_ENV["table_prefix"] . 'saison_player', $saisonPlayerProps);
		$saison_player_id = $db->getLastId();
		
		return $saison_player_id;
	}
	
    function method_UpdateEntities($params, $error) {

        if (count($params) != 2) {
            $error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
            return $error;
        }


        // TODO: check for rights!!!

        $db = CreateDbConnection();

        $tableName = $db->escape_string($params[0]);
        $tableNameWithPrefix = $_ENV["table_prefix"] . $tableName;


        $updates = (array) $params[1];
        if (isset($updates["toAdd"])) {

            if ($tableName == "player_match") {
                $toAdd = $updates["toAdd"];
                for ($i = 0; $i < count($toAdd); $i++) {
					if (is_string($toAdd[$i]->id_saison_player)) {
						// create a new player with that name
						$toAdd[$i]->id_saison_player = $this->createNewPlayer($db, $toAdd[$i]->id_saison_player, 
								$toAdd[$i]->id_saison_team);
					}
                    unset($toAdd[$i]->id_saison_team);
                }
            }

            if ($tableName == "users") {
                // hash password
                $toAdd = $updates["toAdd"];
                for ($i = 0; $i < count($toAdd); $i++) {
                    $toAdd[$i]->password = hash(PASSWORD_HASH_ALGO, $toAdd[$i]->password);
                }
            }
            $db->addEntities($tableNameWithPrefix, $updates["toAdd"]);
        }

        if (isset($updates["toUpdate"])) {

            if ($tableName == "player_match") {
                $toUpdate = $updates["toUpdate"];
                for ($i = 0; $i < count($toUpdate); $i++) {
                    unset($toUpdate[$i]->id_saison_team);
                }
            }

            if ($tableName == "users") {
                // hash password
                $toUpdate = $updates["toUpdate"];
                for ($i = 0; $i < count($toUpdate); $i++) {
                    $password = $toUpdate[$i]->password;
                    if ($password != "dummy") {
                        $toUpdate[$i]->password = hash(PASSWORD_HASH_ALGO, $password);
                    } else {
                        unset($toUpdate[$i]->password);
                    }
                }
            }
            $db->updateEntities($tableNameWithPrefix, $updates["toUpdate"]);
        }
        if (isset($updates["toDelete"])) {
            $db->deleteEntities($tableNameWithPrefix, $updates["toDelete"]);
        }
    }

}

?>