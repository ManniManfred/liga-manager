qx.Class.define("ligamanager.ui.DateCellEditor",
{
   extend : qx.ui.table.celleditor.AbstractField,

   members :
   {
     _createEditor : function()
     {
       var cellEditor = new qx.ui.form.DateField();
       return cellEditor;
     },

     createCellEditor : function(cellInfo)
     {
       var cellEditor = this._createEditor();

       cellEditor.originalValue = cellInfo.value;
       if (cellInfo.value === null || cellInfo.value === undefined) {
         cellInfo.value = new Date();
       }
       cellEditor.setValue(cellInfo.value);

       cellEditor.addListener("appear", function() {
         cellEditor.selectAllText();
       });

       return cellEditor;
     }
   }
}); 