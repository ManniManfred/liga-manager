SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';


-- -----------------------------------------------------
-- Table `lm_team`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `lm_team` ;

CREATE  TABLE IF NOT EXISTS `lm_team` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(255) NOT NULL ,
  `icon` VARCHAR(45) NULL ,
  `homepage` VARCHAR(45) NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB
AUTO_INCREMENT = 3;


-- -----------------------------------------------------
-- Table `lm_saison`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `lm_saison` ;

CREATE  TABLE IF NOT EXISTS `lm_saison` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(255) NOT NULL ,
  `isDefault` TINYINT(1) NULL DEFAULT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lm_saison_team`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `lm_saison_team` ;

CREATE  TABLE IF NOT EXISTS `lm_saison_team` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `id_team` INT(11) NOT NULL ,
  `id_saison` INT(11) NOT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_saison_team_mannschaft` (`id_team` ASC) ,
  INDEX `fk_saison_team_saison` (`id_saison` ASC) ,
  UNIQUE INDEX `idx_saison_team_unique` (`id_team` ASC, `id_saison` ASC) ,
  CONSTRAINT `fk_lm_saison_mannschaft_lm_mannschaft1`
    FOREIGN KEY (`id_team` )
    REFERENCES `lm_team` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_lm_saison_mannschaft_lm_saison1`
    FOREIGN KEY (`id_saison` )
    REFERENCES `lm_saison` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lm_match`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `lm_match` ;

CREATE  TABLE IF NOT EXISTS `lm_match` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `date` DATETIME NULL DEFAULT NULL ,
  `description` TEXT NULL DEFAULT NULL ,
  `goal1` INT(11) NULL DEFAULT NULL ,
  `goal2` INT(11) NULL DEFAULT NULL ,
  `id_saison_team1` INT NOT NULL ,
  `id_saison_team2` INT NOT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_lm_spiel_lm_saison_mannschaft1` (`id_saison_team1` ASC) ,
  INDEX `fk_lm_spiel_lm_saison_mannschaft2` (`id_saison_team2` ASC) ,
  CONSTRAINT `fk_lm_spiel_lm_saison_mannschaft1`
    FOREIGN KEY (`id_saison_team1` )
    REFERENCES `lm_saison_team` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_lm_spiel_lm_saison_mannschaft2`
    FOREIGN KEY (`id_saison_team2` )
    REFERENCES `lm_saison_team` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lm_player`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `lm_player` ;

CREATE  TABLE IF NOT EXISTS `lm_player` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `firstname` VARCHAR(255) NULL DEFAULT NULL ,
  `lastname` VARCHAR(255) NULL ,
  `id_team` INT(11) NOT NULL ,
  `hoeherALiga` TINYINT(1)  NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_lm_spieler_lm_mannschaft1` (`id_team` ASC) ,
  CONSTRAINT `fk_lm_spieler_lm_mannschaft1`
    FOREIGN KEY (`id_team` )
    REFERENCES `lm_team` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 3;


-- -----------------------------------------------------
-- Table `lm_saison_player`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `lm_saison_player` ;

CREATE  TABLE IF NOT EXISTS `lm_saison_player` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `id_saison_team` INT NOT NULL ,
  `id_player` INT(11) NOT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_lm_saison_spieler_lm_saison_mannschaft1` (`id_saison_team` ASC) ,
  INDEX `fk_lm_saison_spieler_lm_spieler1` (`id_player` ASC) ,
  CONSTRAINT `fk_lm_saison_spieler_lm_saison_mannschaft1`
    FOREIGN KEY (`id_saison_team` )
    REFERENCES `lm_saison_team` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_lm_saison_spieler_lm_spieler1`
    FOREIGN KEY (`id_player` )
    REFERENCES `lm_player` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lm_player_match`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `lm_player_match` ;

CREATE  TABLE IF NOT EXISTS `lm_player_match` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `id_match` INT(11) NOT NULL ,
  `id_saison_player` INT NOT NULL ,
  `hasRedCard` TINYINT(1)  NULL DEFAULT NULL ,
  `hasYellowCard` TINYINT(1)  NULL DEFAULT NULL ,
  `hasYellowRedCard` TINYINT(1)  NULL DEFAULT NULL ,
  `goals` INT(11) NULL DEFAULT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `idx_match` (`id_match` ASC) ,
  INDEX `idx_saison_player` (`id_saison_player` ASC) ,
  CONSTRAINT `fk_match_in_player_match`
    FOREIGN KEY (`id_match` )
    REFERENCES `lm_match` (`id` ),
  CONSTRAINT `fk_saison_player_in_player_match`
    FOREIGN KEY (`id_saison_player` )
    REFERENCES `lm_saison_player` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lm_users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `lm_users` ;

CREATE  TABLE IF NOT EXISTS `lm_users` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `username` VARCHAR(45) NOT NULL ,
  `password` VARCHAR(45) NOT NULL ,
  `firstname` VARCHAR(255) NOT NULL ,
  `lastname` VARCHAR(255) NOT NULL ,
  `email` VARCHAR(255) NOT NULL ,
  `id_team` INT(11) NULL ,
  `rights` ENUM('USER','TEAM_ADMIN','LIGA_AMIN','ADMIN') NOT NULL DEFAULT 'USER' COMMENT 'Berechtigung für den Benutzer:\nUSER: Darf nichts\nTEAM_ADMIN: Spiele für Team eintragen; Weitere Team-Admins benennen\nLIGA_ADMIN: Mannschaften anlegen,.. bekommt EMail\'s bei Liga-Ereignissen\nADMIN: Alles' ,
  PRIMARY KEY (`id`) ,
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) ,
  INDEX `fk_lm_user_lm_mannschaft1` (`id_team` ASC) ,
  CONSTRAINT `fk_lm_user_lm_mannschaft1`
    FOREIGN KEY (`id_team` )
    REFERENCES `lm_team` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lm_guestbook`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `lm_guestbook` ;

CREATE  TABLE IF NOT EXISTS `lm_guestbook` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(255) NULL ,
  `email` VARCHAR(255) NULL ,
  `message` TEXT NULL ,
  `date` DATETIME NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lm_document`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `lm_document` ;

CREATE  TABLE IF NOT EXISTS `lm_document` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(255) NOT NULL ,
  `filename` VARCHAR(255) NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `lm_settings`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `lm_settings` ;

CREATE  TABLE IF NOT EXISTS `lm_settings` (
  `key` VARCHAR(50) NOT NULL ,
  `value` VARCHAR(255) NULL ,
  PRIMARY KEY (`key`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Placeholder table for view `lm_play_table`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lm_play_table` (`id_saison` INT, `id` INT, `name` INT, `icon` INT, `homepage` INT, `match_count` INT, `shoot` INT, `got` INT, `wins` INT, `stand_off` INT);

-- -----------------------------------------------------
-- View `lm_play_table`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `lm_play_table` ;
DROP TABLE IF EXISTS `lm_play_table`;
CREATE  OR REPLACE VIEW `lm_play_table` AS
select st.id_saison, t.*, 
    (IFNULL((select count(*) from `lm_match` 
        where (id_saison_team1 = st.id and goal1 is not null) 
            or (id_saison_team2 = st.id and goal1 is not null)), 0)) as match_count,
    
    (IFNULL((select sum(IFNULL(goal1,0)) from `lm_match` where id_saison_team1 = st.id), 0)
    + IFNULL((select sum(IFNULL(goal2,0)) from `lm_match` where id_saison_team2 = st.id), 0)) as shoot,
    
    (IFNULL((select sum(IFNULL(goal2,0)) from `lm_match` where id_saison_team1 = st.id) ,0)
    + IFNULL((select sum(IFNULL(goal1,0)) from `lm_match` where id_saison_team2 = st.id), 0)) as got,
    
    IFNULL((select count(*) from `lm_match` 
        where (id_saison_team1 = st.id and goal1 > goal2) 
        or (id_saison_team2 = st.id and goal2 > goal1)), 0) as wins,
    
    IFNULL((select count(*) from `lm_match` where (id_saison_team1 = st.id or id_saison_team2 = st.id) and goal1 = goal2),0) as stand_off
from `lm_saison_team` st
left join `lm_team` t on t.id = st.id_team;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `lm_users`
-- -----------------------------------------------------
START TRANSACTION;
INSERT INTO `lm_users` (`id`, `username`, `password`, `firstname`, `lastname`, `email`, `id_team`, `rights`) VALUES (0, 'Admin', '6c7ca345f63f835cb353ff15bd6c5e052ec08e7a', 'Admin', 'Admin', '', NULL, 'ADMIN');

COMMIT;
