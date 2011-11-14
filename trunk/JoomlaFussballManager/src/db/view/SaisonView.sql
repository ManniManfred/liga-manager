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
        */