

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE `#__fussball_saison` (
    id INTEGER AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    isDefault BOOL NULL,
    PRIMARY KEY(id)
    ) ENGINE=INNODB;

ALTER TABLE `#__fussball_spiel` ADD COLUMN idSaison INTEGER NOT NULL;
ALTER TABLE `#__fussball_spiel` ADD INDEX spiel_FKIndex4(idSaison);



INSERT INTO `#__fussball_saison` (`id`, `name`, `isDefault`) VALUES (1, '2008', true);

UPDATE #__fussball_spiel SET idSaison = 1;



ALTER TABLE #__fussball_spiel ADD CONSTRAINT Rel_10 FOREIGN KEY (idSaison) REFERENCES #__fussball_saison(id) ON DELETE RESTRICT;


-- update version info
UPDATE #__fussball_infos SET value = '0.05' WHERE name = 'db_version';






SET FOREIGN_KEY_CHECKS=1;


-- add spieler_saison - view

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