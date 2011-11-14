-- Version :0.05
--
-- This script is generated automatically and should not be modified
-- Changes should only be made through DbDesigner
--

CREATE TABLE `#__fussball_spiel` (
    id INTEGER AUTO_INCREMENT NOT NULL,
    idSaison INTEGER NOT NULL,
    idSpiel_typ INTEGER NOT NULL,
    idMannschaft2 INTEGER NOT NULL,
    idMannschaft1 INTEGER NOT NULL,
    datum DATETIME NULL,
    spielbeschreibung TEXT NULL,
    tore1 INTEGER NULL,
    tore2 INTEGER NULL,
    PRIMARY KEY(id),
    INDEX spiel_FKIndex1(idMannschaft2),
    INDEX spiel_FKIndex2(idMannschaft1),
    INDEX spiel_FKIndex3(idSpiel_typ),
    INDEX spiel_FKIndex4(idSaison)
    ) ENGINE=INNODB;
    
CREATE TABLE `#__fussball_spieler` (
    id INTEGER AUTO_INCREMENT NOT NULL,
    idMannschaft INTEGER NOT NULL,
    kontaktID INTEGER NULL,
    anzahlSpiele INTEGER NULL,
    valid BOOL NULL,
    name VARCHAR(255) NULL,
    anzahlTore INTEGER NULL,
    PRIMARY KEY(id),
    INDEX spieler_FKIndex1(idMannschaft)
    ) ENGINE=INNODB;
    
CREATE TABLE `#__fussball_mannschaft` (
    id INTEGER AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    isDefault BOOL NULL,
    PRIMARY KEY(id)
    ) ENGINE=INNODB;
    
CREATE TABLE `#__fussball_spieler_spiel` (
    id INTEGER AUTO_INCREMENT NOT NULL,
    idSpieler INTEGER NOT NULL,
    idSpiel INTEGER NOT NULL,
    hasRoteKarte BOOL NULL,
    hasGelbeKarte BOOL NULL,
    hasGelbRoteKarte BOOL NULL,
    anzahlTore INTEGER NULL,
    PRIMARY KEY(id),
    INDEX spieler_spiel_FKIndex1(idSpiel),
    INDEX spieler_spiel_FKIndex2(idSpieler)
    ) ENGINE=INNODB;
    
CREATE TABLE `#__fussball_spiel_typ` (
    id INTEGER AUTO_INCREMENT NOT NULL,
    Name VARCHAR(255) NULL,
    Beschreibung TEXT NULL,
    PRIMARY KEY(id)
    ) ENGINE=INNODB;
    
CREATE TABLE `#__fussball_infos` (
    id INTEGER AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NULL,
    value TEXT NULL,
    PRIMARY KEY(id),
    INDEX infos_name_index(name)
    ) ENGINE=INNODB;
    
CREATE TABLE `#__fussball_Attribute` (
    id INTEGER AUTO_INCREMENT NOT NULL,
    attrType VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    displayName VARCHAR(255) NULL,
    PRIMARY KEY(id),
    INDEX Attribute_FKIndex1(attrType)
    ) ENGINE=INNODB;
    
CREATE TABLE `#__fussball_AttributeValue` (
    id INTEGER AUTO_INCREMENT NOT NULL,
    idAttribute INTEGER NOT NULL,
    idSpieler INTEGER NOT NULL,
    boolValue BOOL NULL,
    intValue INTEGER NULL,
    textValue TEXT NULL,
    doubleValue DOUBLE NULL,
    dateValue DATE NULL,
    PRIMARY KEY(id),
    INDEX AttributeValue_FKIndex1(idAttribute),
    INDEX AttributeValue_FKIndex2(idSpieler)
    ) ENGINE=INNODB;
    
CREATE TABLE `#__fussball_AttributeType` (
    name VARCHAR(20) NOT NULL,
    beschreibung VARCHAR(255) NULL,
    PRIMARY KEY(name)
    ) ENGINE=INNODB;
    
CREATE TABLE `#__fussball_saison` (
    id INTEGER AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    isDefault BOOL NULL,
    PRIMARY KEY(id)
    ) ENGINE=INNODB;
    


INSERT INTO `#__fussball_spieler` (`id`, `name`, `idMannschaft`, `anzahlSpiele`) VALUES(1, 'Manfred Rosskamp', 1, 121),(2, 'Norbert Rosskamp', 1, 289);
INSERT INTO `#__fussball_mannschaft` (`id`, `name`, `isDefault`) VALUES(1, 'Holthausen', true),(2, 'Timpen', false);

INSERT INTO #__fussball_spiel_typ VALUES (1, 'Meisterschaft', 'Spiel der Meisterschaft');INSERT INTO #__fussball_spiel_typ VALUES (2, 'Freundschaft', 'Freundschaftsspiel');



INSERT INTO `#__fussball_AttributeType` (`name`, `beschreibung`) VALUES ('int', 'Vorzeichenbehaftete Ganzzahl'), ('text', 'Text'), ('double', 'Flie\223kommazahl'),  ('date', 'Datum');

-- add version
INSERT INTO #__fussball_infos VALUES (1, 'db_version', '0.05');
        
ALTER TABLE #__fussball_spieler ADD CONSTRAINT Rel_mannschaft FOREIGN KEY (idMannschaft) REFERENCES #__fussball_mannschaft(id);
ALTER TABLE #__fussball_spiel ADD CONSTRAINT Rel_M1 FOREIGN KEY (idMannschaft2) REFERENCES #__fussball_mannschaft(id);
ALTER TABLE #__fussball_spiel ADD CONSTRAINT Rel_M2 FOREIGN KEY (idMannschaft1) REFERENCES #__fussball_mannschaft(id);
ALTER TABLE #__fussball_spieler_spiel ADD CONSTRAINT Rel_06 FOREIGN KEY (idSpiel) REFERENCES #__fussball_spiel(id);
ALTER TABLE #__fussball_spieler_spiel ADD CONSTRAINT Rel_07 FOREIGN KEY (idSpieler) REFERENCES #__fussball_spieler(id);
ALTER TABLE #__fussball_spiel ADD CONSTRAINT Rel_SpielTyp FOREIGN KEY (idSpiel_typ) REFERENCES #__fussball_spiel_typ(id);
ALTER TABLE #__fussball_AttributeValue ADD CONSTRAINT Attr_Value FOREIGN KEY (idAttribute) REFERENCES #__fussball_Attribute(id) ON DELETE RESTRICT;
ALTER TABLE #__fussball_AttributeValue ADD CONSTRAINT Spieler_AttrValue FOREIGN KEY (idSpieler) REFERENCES #__fussball_spieler(id) ON DELETE RESTRICT;
ALTER TABLE #__fussball_Attribute ADD CONSTRAINT type FOREIGN KEY (attrType) REFERENCES #__fussball_AttributeType(name) ON DELETE RESTRICT;
ALTER TABLE #__fussball_spiel ADD CONSTRAINT Rel_10 FOREIGN KEY (idSaison) REFERENCES #__fussball_saison(id) ON DELETE RESTRICT;
-- End of generated script
    






-- Add stored procedure from CreateSpielerDetails.sql
DELIMITER $$

DROP PROCEDURE IF EXISTS `CreateSpielerDetails`$$
CREATE PROCEDURE `CreateSpielerDetails` ()
BEGIN

declare l_loop_end INT default 0; 

declare attrId INT;
declare attrName varchar(255);
declare attributeType varchar(20);
declare attrSQLType varchar(20);

DECLARE cur CURSOR FOR SELECT id, name, attrType FROM #__fussball_Attribute;
declare continue handler for sqlstate '02000' set l_loop_end = 1;


-- Tabelle anlegen
DROP TABLE IF EXISTS #__fussball_spieler_details;
CREATE TABLE #__fussball_spieler_details SELECT id FROM #__fussball_spieler;

open cur;
  
repeat
fetch cur into attrId, attrName, attributeType;

if not l_loop_end then

        if attributeType = 'img' then
                set attrSQLType = 'text';
        else
                set attrSQLType = attributeType;
        end if;
        
        -- Spalte hinzufügen
        set @addcoltext = CONCAT('ALTER TABLE #__fussball_spieler_details ADD ', attrName, ' ', attrSQLType);
        prepare addcol from @addcoltext;
        execute addcol;

        
        -- Werte für diese Spalte hinzufügen
        set @updatetext = 
                CONCAT('UPDATE #__fussball_spieler_details AS D LEFT JOIN #__fussball_AttributeValue as V ON D.id = V.idSpieler',
                ' SET D.`', attrName, '` = V.', attrSQLType, 'Value',
                ' WHERE idAttribute = ', attrId);
        prepare updateval from @updatetext;
        execute updateval; 

end if; 

until l_loop_end end repeat; 

close cur; 

-- select 'success';

END$$

DELIMITER ;

-- Add stored procedure from .svn
-- Add view from SaisonView.sql
DROP VIEW IF EXISTS jos_fussball_spieler_saison;


CREATE VIEW jos_fussball_spieler_saison AS
        SELECT s.id, s.idMannschaft, s.name,
                count(ss.idspieler) as spiele,
                sum(ss.anzahlTore) as tore,
                sum(hasGelbeKarte) as gelb,
                sum(hasGelbRoteKarte) as gelbrot,
                sum(hasRoteKarte) as rot
        FROM jos_fussball_spieler as s
                left join jos_fussball_spieler_spiel as ss on s.id = ss.idspieler
        GROUP BY s.id;



/*
        SELECT s.id, s.idMannschaft, s.name,
                count(ss.idspieler) as spiele,
                sum(ss.anzahlTore) as tore,
                sum(hasGelbeKarte) as gelb,
                sum(hasGelbRoteKarte) as gelbrot,
                sum(hasRoteKarte) as rot
        FROM jos_fussball_spieler as s
                left join jos_fussball_spieler_spiel as ss on s.id = ss.idspieler
                left join jos_fussball_spiel as sp on sp.id = ss.idSpiel
        where sp.idSaison = 1
        GROUP BY s.id)
        */-- Add view from .svn
