-- Saisonwechsel, schreibt alle Spiele und Tore rüber
update jos_fussball_spieler, jos_fussball_spieler_saison
set jos_fussball_spieler.anzahlSpiele = jos_fussball_spieler.anzahlSpiele + jos_fussball_spieler_saison.spiele,
jos_fussball_spieler.anzahlTore = jos_fussball_spieler.anzahlTore + jos_fussball_spieler_saison.tore
where jos_fussball_spieler.id = jos_fussball_spieler_saison.id

-- und löscht alle Spiele und Zuordnungen
delete from jos_fussball_spieler_spiel
delete from jos_fussball_spiel


