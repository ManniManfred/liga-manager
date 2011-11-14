DELIMITER $$

DROP PROCEDURE IF EXISTS `CreateSpielerDetails`$$
CREATE PROCEDURE `CreateSpielerDetails` ()
BEGIN

declare l_loop_end INT default 0; 

declare attrId INT;
declare attrName varchar(255);
declare attributeType varchar(20);
declare attrSQLType varchar(20);

DECLARE cur CURSOR FOR SELECT id, name, attrType FROM hsv.jos_fussball_Attribute;
declare continue handler for sqlstate '02000' set l_loop_end = 1;


-- Tabelle anlegen
DROP TABLE IF EXISTS jos_fussball_spieler_details;
CREATE TABLE jos_fussball_spieler_details SELECT id FROM jos_fussball_spieler;

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
	set @addcoltext = CONCAT('ALTER TABLE jos_fussball_spieler_details ADD ', attrName, ' ', attrSQLType);
	prepare addcol from @addcoltext;
	execute addcol;

	
	-- Werte für diese Spalte hinzufügen
	set @updatetext = 
		CONCAT('UPDATE jos_fussball_spieler_details AS D LEFT JOIN jos_fussball_AttributeValue as V ON D.id = V.idSpieler',
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

