 

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `#__fussball_Attribute`;
DROP TABLE IF EXISTS `#__fussball_AttributeValue`;
DROP TABLE IF EXISTS `#__fussball_AttributeType`;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE `#__fussball_Attribute` (
    id INTEGER AUTO_INCREMENT NOT NULL,
    attrType VARCHAR(20) NOT NULL,
    name VARCHAR(255) NULL,
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
    imgValue TEXT NULL,
    PRIMARY KEY(id),
    INDEX AttributeValue_FKIndex1(idAttribute),
    INDEX AttributeValue_FKIndex2(idSpieler)
    ) ENGINE=INNODB;
    
CREATE TABLE `#__fussball_AttributeType` (
    name VARCHAR(20) NOT NULL,
    beschreibung VARCHAR(255) NULL,
    PRIMARY KEY(name)
    ) ENGINE=INNODB;
    



INSERT INTO `#__fussball_AttributeType` (`name`, `beschreibung`) VALUES ('int', 'Vorzeichenbehaftete Ganzzahl'), ('text', 'Text'), ('double', 'Flie\223kommazahl'), ('img', 'Image'), ('date', 'Datum');

-- update version info
UPDATE #__fussball_infos SET value = '0.03' WHERE name = 'db_version';

ALTER TABLE #__fussball_AttributeValue ADD CONSTRAINT Attr_Value FOREIGN KEY (idAttribute) REFERENCES #__fussball_Attribute(id) ON DELETE RESTRICT;
ALTER TABLE #__fussball_AttributeValue ADD CONSTRAINT Spieler_AttrValue FOREIGN KEY (idSpieler) REFERENCES #__fussball_spieler(id) ON DELETE RESTRICT;
ALTER TABLE #__fussball_Attribute ADD CONSTRAINT type FOREIGN KEY (attrType) REFERENCES #__fussball_AttributeType(name) ON DELETE RESTRICT;



-- add spieler_saison - view

DROP VIEW IF EXISTS jos_fussball_spieler_saison;


CREATE VIEW jos_fussball_spieler_saison AS 
        SELECT s.id, s.idMannschaft, name, 
                count(ss.idspieler) as spiele, 
                sum(anzahlTore) as tore, 
                sum(hasGelbeKarte) as gelb, 
                sum(hasGelbRoteKarte) as gelbrot, 
                sum(hasRoteKarte) as rot
        FROM jos_fussball_spieler as s 
                left join jos_fussball_spieler_spiel as ss on s.id = ss.idspieler
        GROUP BY s.id;

