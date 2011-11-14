DELIMITER $$

DROP PROCEDURE IF EXISTS `hsv`.`updateAttributeValue`$$
CREATE PROCEDURE `hsv`.`updateAttributeValue` ()
BEGIN


declare l_loop_end INT default 0; 

declare attrId INT;
declare attrName varchar(255);
declare attributeType varchar(20);
declare attrSQLType varchar(20);

DECLARE cur CURSOR FOR SELECT id, name, attrType FROM hsv.jos_fussball_Attribute;
declare continue handler for sqlstate '02000' set l_loop_end = 1;

open cur;
  
repeat
fetch cur into attrId, attrName, attributeType;

if not l_loop_end then

        if attributeType = 'img' then
                set attrSQLType = 'text';
        else
                set attrSQLType = attributeType;
        end if;
        
	
	if exists(select * from jos_fussball_AttributeValue where idAttribute = attrId and idSpieler = NEW.id) then
		set @updateattrtext = 
			CONCAT('update jos_fussball_AttributeValue ',
				' where idAttribute = attrId and idSpieler = NEW.id',
				' SET ', attrSQLType, 'Value = NEW.', attrName);
		prepare updateattr from @updatetext;
		execute updateattr;
--	else
		
	end if; 

end if; 

until l_loop_end end repeat; 

close cur; 

END$$

DELIMITER ;
