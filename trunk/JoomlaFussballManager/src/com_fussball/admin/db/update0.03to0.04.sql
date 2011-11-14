
ALTER TABLE `#__fussball_Attribute` ADD displayName VARCHAR(255);
ALTER TABLE `jos_fussball_Attribute` change name name VARCHAR(255) NOT NULL;

ALTER TABLE `#__fussball_spieler` add anzahlTore integer;
