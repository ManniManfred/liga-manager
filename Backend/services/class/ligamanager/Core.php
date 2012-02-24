<?php

require_once "server/lib/JSON.phps";
require_once "config.php";
require_once "main.php";


class class_Core extends ServiceIntrospection {

	
	function method_SendContactRequest($params, $error) {
        if (count($params) != 1) {
            $error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
            return $error;
        }
		
        $db = GetDbConnection();
		
		// send mail to admins
		$admins = $db->queryFetchAll("select * from `" . $_ENV["table_prefix"] . "users`"
				. " where rights='ADMIN' and email is not null");

		if ($admins != null && count($admins) > 0) {
			$requst = $params[0];
			for ($i = 0; $i < count($admins); $i++) {
				$subject = "Kontaktanfrage";
				$body = "Es wurde folgende Kontaktanfrage gestellt: "
					. print_r($requst, true);
				sendMyMail($admins[$i]["email"], $subject, $body);
			}
		}
	}
	
	
	// ****************************************************
	// Settins
	// ****************************************************
	
	
    function method_GetSettings($params, $error) {
        if (count($params) != 0) {
            $error->SetError(JsonRpcError_ParameterMismatch, "Expected 0 parameter; got " . count($params));
            return $error;
        }

        $db = GetDbConnection();

        $entries = $db->queryFetchAll("SELECT * from `" . $_ENV["table_prefix"] . "settings` S");
       
        $settings = array();
        for ($i = 0; $i < count($entries); $i++) {
            $key = $entries[$i]['key'];
            $value = $entries[$i]['value'];
			
			if ($key == "mail_sendMails" || $key == "mail_guestbook") {
				$settings[$key] = (bool)$value;
			} else {
				$settings[$key] = $value;
			}
        }
        return $settings;
    }
	
    function method_SetSettings($params, $error) {
		checkRights(array("ADMIN"));
		
        if (count($params) != 1) {
            $error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
            return $error;
        }

        $db = GetDbConnection();

        $settings = $params[0];

        foreach ($settings as $key => $value) {
            $key = $db->escape_string($key);
            $value = "'" . $db->escape_string($value) . "'";

            $sql = "INSERT INTO `" . $_ENV["table_prefix"] . "settings` (`key`, `value`) VALUES ('$key', $value)"
                    . " ON DUPLICATE KEY UPDATE `value`=$value;";
            $db->query($sql);
        }
    }
	
	
    function method_GetDesign($params, $error) {
		
        if (count($params) != 0) {
            $error->SetError(JsonRpcError_ParameterMismatch, "Expected 0 parameter; got " . count($params));
            return $error;
        }

        $db = GetDbConnection();

        $entries = $db->queryFetchAll("SELECT * from `" . $_ENV["table_prefix"] . "settings` S where S.key like 'design_%'");
        $designPrefixLength = strlen('design_');

        $design = array();
        for ($i = 0; $i < count($entries); $i++) {
            $key = $entries[$i]['key'];
            $key = substr($key, $designPrefixLength);
            $value = $entries[$i]['value'];
            $design[$key] = $value;
        }
        return $design;
    }

	
	
	
	
	
	
	

	
	function method_GetSelf() {
		$result = getUserSelf();
		return $result;
	}
	
	

    function method_Login($params, $error) {
        if (count($params) != 2) {
            $error->SetError(JsonRpcError_ParameterMismatch, "Expected 2 parameter; got " . count($params));
            return $error;
        }

        $db = GetDbConnection();
        $username = $params[0];
        $password = $params[1];

        $passHash = hash(PASSWORD_HASH_ALGO, $password);


        $query = sprintf("select * from `" . $_ENV["table_prefix"] 
					. "users` where username='%s' and password='%s'", 
				$db->escape_string($username), $db->escape_string($passHash));


        $resultArr = $db->queryFetchAll($query);

        $result = array("result" => false, "message" => "Benutzer Passwort Kombination ist falsch.");

        if (count($resultArr) == 1) {
            $_SESSION["user_id"] = $resultArr[0]["id"];
            $result["result"] = true;
            $result["message"] = "ok";
			$result["user"] = $this->method_GetSelf();
        }

        return $result;
    }

    function method_Logout($params, $error) {
        if (count($params) != 0) {
            $error->SetError(JsonRpcError_ParameterMismatch, "Expected 0 parameter; got " . count($params));
            return $error;
        }

        unset($_SESSION["user_id"]);
    }

    function getFilter($db, $tableName, $filterMap) {
        $filter = '';
        if ($tableName == "match") {

            if (isset($filterMap->matchesOfUser) && $filterMap->matchesOfUser == true) {

				$user = $this->method_GetSelf();
				
                $team_id = $user["id_team"];
                //print_r($_SESSION["user"]);
				//echo $user["rights"];
				
                if ($team_id != null) {

                    // get id saison team
                    $queryResult = $db->queryFetchAll("select ST.id from `" . $_ENV["table_prefix"] . "saison_team` ST"
                            . " left join `" . $_ENV["table_prefix"] . "saison` S on ST.id_saison = S.id"
                            . " where S.isDefault and ST.id_team = $team_id");

                    $id_saison_team = $queryResult[0]["id"];

                    $filter = " where id_saison_team1 = $id_saison_team or id_saison_team2 = $id_saison_team";
                } else if ($user["rights"] == "ADMIN" || $user["rights"] == "LIGA_ADMIN"){
					// filter only for saison
					$filter = " where id_saison_team1 in"
						. " (select ST.id from `" . $_ENV["table_prefix"] . "saison_team` ST"
						. " left join `" . $_ENV["table_prefix"] . "saison` S on S.id = ST.id_saison"
						. " where S.isDefault)";
				} else{
                    $filter = " where false";
                }
            } else {

				$filter = " where id_saison_team1 in (select ST.id from `" . $_ENV["table_prefix"]
					. "saison_team` ST";
				
				if ($filterMap->saison_id == "current") {
					$filter .= " left join `" . $_ENV["table_prefix"] . "saison` S on ST.id_saison = S.id"
							. " where S.isDefault";
				} else {
					$filter .= " where ST.id_saison = " . $filterMap->saison_id;
				}
				$filter .= ")";
				
                if (isset($filterMap->team_id)) {
                    $team_id = (int) $filterMap->team_id;
                    $filter .= " and (id_saison_team1 = " . $team_id
                            . " or id_saison_team2 = " . $team_id . ")";
                }
            }
        } else if ($tableName == "play_table" || $tableName == "scorer" || $tableName == "locks") {
			if ($filterMap->saison_id == "current") {
				$filter = " where id_saison in (select id from `" . $_ENV["table_prefix"] . "saison` where isDefault)";
			} else {
				$filter = " where id_saison = " . ((int) $filterMap->saison_id);
			}
			
			if ($tableName == "scorer") {
				$filter .= " and goals > 0";
			}
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
        $db = GetDbConnection();
		
        $tableName = $db->escape_string($params[0], $db);
		checkTableRight($tableName, false);
		
        $sqlQuery = $this->getSelectStatement($db, $params, true);

        $result = $db->queryFetchAll($sqlQuery);
        return $result == null ? 0 : $result[0]["count(*)"];
    }

    function method_GetEntities($params, $error) {
        //sleep(1);
        $db = GetDbConnection();

        $tableName = $db->escape_string($params[0], $db);
        $tableNameWithPrefix = $_ENV["table_prefix"] . $tableName;

		checkTableRight($tableName, false);
		
        $sqlQuery = $this->getSelectStatement($db, $params, false);

        return $db->queryFetchAll($sqlQuery, $tableNameWithPrefix);
    }

	
	
    function method_UpdateEntities($params, $error) {

        if (count($params) != 2) {
            $error->SetError(JsonRpcError_ParameterMismatch, "Expected 1 parameter; got " . count($params));
            return $error;
        }

		UpdateEntities($params[0], $params[1]);
    }

}

?>