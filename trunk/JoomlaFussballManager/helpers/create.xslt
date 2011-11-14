<transform xmlns="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <output encoding="iso-8859-1" method="text" omit-xml-declaration="yes"
  indent="no" />
  <strip-space elements="DBMODEL" />
  <param name="target" />
  <variable name="table_prev">#__fussball_</variable>
  <template match="DBMODEL/METADATA">
    <text>-- Version :</text>
    <value-of select="/DBMODEL/SETTINGS/GLOBALSETTINGS/@VersionStr" />
    <text>
--
-- This script is generated automatically and should not be modified
-- Changes should only be made through DbDesigner
--
</text>
    <apply-templates select="SETTINGS"/>
    <choose>
      <when test="$target = 'drop'">
        <text>SET FOREIGN_KEY_CHECKS=0;</text>
        <apply-templates select="TABLES" mode="drop" />
        <text>SET FOREIGN_KEY_CHECKS=1;
        </text>
      </when>
      <when test="$target = 'create'">

        <apply-templates select="TABLES" mode="create" />
        <apply-templates select="TABLES" mode="insert" />

        <text>-- add version
</text>
        <text>INSERT INTO #__fussball_infos VALUES (1, 'db_version', '</text>
        <value-of select="/DBMODEL/SETTINGS/GLOBALSETTINGS/@VersionStr" />
        <text>');
        </text>
        <apply-templates select="RELATIONS" mode="relations" />

        <!--<apply-templates select="TABLES" mode="tablecomments" />
        <apply-templates select="TABLES" mode="columncomments" />-->
      </when>
      <otherwise>
        <apply-templates select="TABLES" mode="drop" />
        <apply-templates select="TABLES" mode="create" />
        <apply-templates select="TABLES" mode="insert" />
        <apply-templates select="RELATIONS" mode="relations" />
        <text></text>
        <apply-templates select="TABLES" mode="tablecomments" />
        <apply-templates select="TABLES" mode="columncomments" />
      </otherwise>
    </choose>
    <text>-- End of generated script
    </text>
  </template>


  <template match="SETTINGS">
  </template>

  <template match="TABLE" mode="drop">
    <text>DROP TABLE IF EXISTS `</text>
    <value-of select="$table_prev" />
    <value-of select="@Tablename" />
    <text>`;</text>
  </template>

  <template match="TABLE" mode="create">
    <variable name="table_name" select="@Tablename" />
    <text>CREATE TABLE `</text>
    <value-of select="$table_prev" />
    <value-of select="$table_name" />
    <text>` (</text>
    <for-each select="COLUMNS/COLUMN">
      <call-template name="column_definition" />
      <text>,</text>
    </for-each>
    <text>
    </text>
    <for-each select="INDICES/INDEX">
      <if test="@IndexKind = 0">
        <text>PRIMARY KEY(</text>
        <call-template name="column_set" />
        <text>)</text>
      </if>
      <if test="@IndexKind = 1">
        <text>INDEX </text>
        <value-of select="@IndexName" />
        <text>(</text>
        <call-template name="column_set" />
        <text>)</text>
      </if>
      <!--
      <if test="@IndexKind = 2">
        <text>CREATE UNIQUE INDEX</text>
        <value-of select="@IndexName" />
        <text>ON</text>
        <value-of select="$table_name" />
        <text>(</text>
        <call-template name="column_set" />
        <text>);</text>
      </if>-->
      <if test="position() != last()">
        <text>,</text>
      </if>
      <if test="@IndexKind &gt; 1">
        <message terminate="yes">index type not supported yet</message>
      </if>
      <text>
    </text>
    </for-each>
    <text>) ENGINE=INNODB;
    </text>
  </template>


  <template match="TABLE" mode="insert">
    <if test="string-length(@StandardInserts) &gt; 4">
      <text></text>
      <call-template name="process_inserts">
        <with-param name="string" select="@StandardInserts" />
      </call-template>
    </if>
  </template>
  <template match="RELATION" mode="relations">
    <variable name="dest_id" select="@DestTable" />
    <variable name="src_id" select="@SrcTable" />
    <text>ALTER TABLE </text>
    <value-of select="$table_prev" />
    <value-of select="//TABLE[@ID = $dest_id]/@Tablename" />
    <text> ADD CONSTRAINT </text>
    <value-of select="@RelationName" />
    <text> FOREIGN KEY (</text>
    <call-template name="src_ids">
      <with-param name="string" select="@FKFields" />
    </call-template>
    <text>) REFERENCES </text>
    <value-of select="$table_prev" />
    <value-of select="//TABLE[@ID = $src_id]/@Tablename" />
    <text>(</text>
    <call-template name="target_ids">
      <with-param name="string" select="@FKFields" />
    </call-template>
    <text>)</text>
    <if test="contains(@RefDef,'OnDelete=1')">
      <text> ON DELETE CASCADE</text>
    </if>
    <if test="contains(@RefDef,'OnDelete=3')">
      <text> ON DELETE RESTRICT</text>
    </if>
    <text>;</text>
  </template>


  <template match="COLUMN" mode="columncomments">
    <if test="string-length(@Comments) &gt; 0">
      <text>comment on column</text>
      <value-of select="../../@Tablename" />
      <text>.</text>
      <value-of select="@ColName" />
      <text>is '</text>
      <call-template name="remove_quote">
        <with-param name="string" select="@Comments" />
      </call-template>
      <text>';</text>
    </if>
  </template>


  <template match="TABLE" mode="tablecomments">
    <if test="string-length(@Comments) &gt; 0">
      <text>comment on table</text>
      <value-of select="@Tablename" />
      <text>is '</text>
      <call-template name="remove_newline">
        <with-param name="string" select="@Comments" />
      </call-template>
      <text>';</text>
    </if>
  </template>


  <template name="column_definition">
    <variable name="type_id" select="@idDatatype" />
    <text>
    </text>
    <value-of select="@ColName" />
    <text> </text>
    <if test="//DATATYPE[@ID=$type_id]/@PhysicalMapping=0">
      <value-of select="//DATATYPE[@ID=$type_id]/@TypeName" />
    </if>
    <if test="//DATATYPE[@ID=$type_id]/@PhysicalMapping=1">
      <value-of select="//DATATYPE[@ID=$type_id]/@PhysicalTypeName" />
    </if>
    <if test="string-length(@DatatypeParams) &gt; 0">
      <value-of select="@DatatypeParams" />
    </if>

    <if test="@AutoInc=1">
      <text> AUTO_INCREMENT</text>
    </if>

    <if test="string-length(@DefaultValue) &gt; 0">
      <text>DEFAULT</text>
      <call-template name="remove_quote">
        <!-- the concat with the space is a workaround, because remove_quote
     will remove a single quote at the beginning of the string
-->
        <with-param name="string" select="concat(' ',@DefaultValue)" />
      </call-template>
      <!--<value-of select="translate(@DefaultValue,'\a','.')"/> -->
    </if>
    <text> </text>
    <if test="@NotNull = 0">
      <text>NULL</text>
    </if>
    <if test="@NotNull = 1">
      <text>NOT NULL</text>
    </if>
  </template>



  <template name="column_set">
    <for-each select="INDEXCOLUMNS/INDEXCOLUMN">
      <variable name="column_id" select="@idColumn" />
      <value-of select="//COLUMN[@ID=$column_id]/@ColName" />
      <if test="position() != last()">
        <text>,</text>
      </if>
    </for-each>
  </template>
  <template name="src_ids">
    <param name="string" />
    <variable name="current" select="substring-before($string,'\n')" />
    <if test="string-length($current) &gt; 0">
      <value-of select="substring-after($current,'=')" />
    </if>
    <variable name="next" select="substring-after($string,'\n')" />
    <if test="string-length($next) &gt; 0">
      <text>,</text>
      <call-template name="src_ids">
        <with-param name="string" select="$next" />
      </call-template>
    </if>
  </template>


  <template name="target_ids">
    <param name="string" />
    <variable name="current" select="substring-before($string,'\n')" />
    <if test="string-length($current) &gt; 0">
      <value-of select="substring-before($current,'=')" />
    </if>
    <variable name="next" select="substring-after($string,'\n')" />
    <if test="string-length($next) &gt; 0">
      <text>,</text>
      <call-template name="target_ids">
        <with-param name="string" select="$next" />
      </call-template>
    </if>
  </template>


  <template name="process_inserts">
    <param name="string" />

    <variable name="temp" select="translate($string,'','*++*')" />
    <variable name="current" select="substring-before($temp,';')" />
    <variable name="next" select="substring-after($temp,';')" />
    <if test="string-length($current) &gt; 0">
      <call-template name="remove_newline">
        <with-param name="string" select="$current" />
      </call-template>
      <text>;</text>
    </if>
    <if test="string-length($next) &gt; 0">
      <call-template name="process_inserts">
        <with-param name="string" select="$next" />
      </call-template>
    </if>
  </template>


  <template name="remove_newline">
    <param name="string" />
    <choose>
      <when test="contains($string,'\n')">
        <variable name="current" select="substring-before($string,'\n')" />
        <variable name="next" select="substring-after($string,'\n')" />
        <if test="string-length($current) &gt; 0">
          <call-template name="remove_quote">
            <with-param name="string" select="$current" />
          </call-template>
          <text></text>
        </if>
        <if test="string-length($next) &gt; 0">
          <call-template name="remove_newline">
            <with-param name="string" select="$next" />
          </call-template>
        </if>
      </when>
      <otherwise>
        <call-template name="remove_quote">
          <with-param name="string" select="$string" />
        </call-template>
      </otherwise>
    </choose>
  </template>



  <template name="remove_quote">
    <param name="string" />
    <choose>
      <when test="contains($string,'\A')">
        <variable name="current" select="substring-before($string,'\A')" />
        <variable name="next" select="substring-after($string,'\A')" />
        <if test="string-length($current) &gt; 0">
          <call-template name="remove_singlequote">
            <with-param name="string" select="$current" />
          </call-template>
          <text>"</text>
        </if>
        <if test="string-length($next) &gt; 0">
          <call-template name="remove_quote">
            <with-param name="string" select="$next" />
          </call-template>
        </if>
      </when>
      <otherwise>
        <call-template name="remove_singlequote">
          <with-param name="string" select="$string" />
        </call-template>
      </otherwise>
    </choose>
  </template>


  <template name="remove_singlequote">
    <param name="string" />
    <choose>
      <when test="contains($string,'\a')">
        <variable name="current" select="substring-before($string,'\a')" />
        <variable name="next" select="substring-after($string,'\a')" />
        <if test="string-length($current) &gt; 0">
          <value-of select="$current" />
          <text>'</text>
        </if>
        <if test="string-length($next) &gt; 0">
          <call-template name="remove_quote">
            <with-param name="string" select="$next" />
          </call-template>
        </if>
      </when>
      <otherwise>
        <value-of select="$string" />
      </otherwise>
    </choose>
  </template>
</transform>
