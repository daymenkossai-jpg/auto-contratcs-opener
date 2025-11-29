(function(){
  function safeOverride(){
    try{
      if(typeof window.showInitialActivationDocument==='function'){
        const original=window.showInitialActivationDocument;
        window.showInitialActivationDocument=function(){
          documentViewCount=1;
          $("#showImageDivId").css('display','none');
          $("#documentsDivId").css('display','');
          $("#documentsMenuDivId").css('display','');
          var data_value=findActivationTab();
          var activation_data=response.interface;
          var document_data=null;
          document.getElementById("cafDownloadDivId").style="display:none";
          if(data_value!=null&&data_value=="re_processed_data"&&activation_data.hasOwnProperty("reprocess_data")&&activation_data.reprocess_data!=null)
            document_data=activation_data.reprocess_data;
          else if(data_value!=null&&data_value=="approval_data"&&activation_data.hasOwnProperty("approval_data")&&activation_data.approval_data!=null)
            document_data=activation_data.approval_data;
          else
            document_data=activation_data.order_data;
          var document_details=null;
          if(document_data.document_details!=undefined&&document_data.document_details!=null){
            if(document_data.document_details instanceof Array)
              document_details=document_data.document_details[0];
            else if(document_data.document_details instanceof Object)
              document_details=document_data.document_details;
          }else{
            document_data=activation_data.order_data;
            if(document_data.document_details instanceof Array)
              document_details=document_data.document_details[0];
            else if(document_data.document_details instanceof Object)
              document_details=document_data.document_details;
          }
          if(document_details!=null){
            var fileObj=null;
            var file_id=null;
            var file_id2=null;
            var file_id3=null;
            var fileObj2=null;
            var fileObj3=null;
            $("#idProofRdBtn").prop('checked',true);
            $("#idProofFrontRdBtn").prop('checked',true);
            $('#idProofFandBdiv').css("display","");
            $('#controls').css("display","");
            $('#cafPreviewDiv').css("display","none");
            $('#img-preview').css("display","");
            enableDisableListOfDocuments(document_details);
            if(document_details!=null&&document_details.id_front!=undefined&&document_details.id_front!=null&&document_details.id_front!=""){
              const img=document.getElementById('documentImageId');
              if(img){
                const clone=img.cloneNode(true);
                clone.id=img.id+'2';
                const clone2=img.cloneNode(true);
                clone2.id=img.id+'3';
                img.parentNode.insertBefore(clone2,img.nextSibling);
                img.parentNode.insertBefore(clone,img.nextSibling);
              }
              file_id=document_details.id_front;
              file_id2=document_details.signature;
              file_id3=document_details.id_back;
              fileObj=getFileDataByFileId(file_id);
              fileObj2=getFileDataByFileId(file_id2);
              fileObj3=getFileDataByFileId(file_id3);
              if(fileObj!=null&&fileObj.file!=undefined&&fileObj.file!=null&&fileObj.file!=""&&fileObj2!=null&&fileObj2.file!=undefined&&fileObj2.file!=null&&fileObj2.file!=""&&fileObj3!=null&&fileObj3.file!=undefined&&fileObj3.file!=null&&fileObj3.file!=""){
                $("#idProofFrontRdBtn").attr('data_file_id',file_id);
                $('#documentImageId').attr('src','data:image/png;base64,'+fileObj.file);
                $('#documentImageId2').attr('src','data:image/png;base64,'+fileObj3.file);
                $('#documentImageId3').attr('src','data:image/png;base64,'+fileObj2.file);
              }
            }
            if(fileObj==undefined||fileObj==null||fileObj==""){
              $('#documentImageId').attr('src',"");
              bootbox.alert("ID Front Not Available");
            }
          }
        };
        console.log('[Extension] doSomething overriden');
      }else{
        console.log('[Extension] doSomething non trouvée, réessai...');
        setTimeout(safeOverride,200);
      }
    }catch(err){
      console.error('[Extension] erreur override:',err);
    }
  }
  safeOverride();
  function removeDigitsOnInput(fieldId){
    const field=document.getElementById(fieldId);
    if(field){
      field.addEventListener('input',function(){
        const originalValue=field.value;
        const cleanedValue=originalValue.replace(/\d+/g,'');
        if(originalValue!==cleanedValue){
          field.value=cleanedValue;
        }
      });
    }
  }
  removeDigitsOnInput('firstName');
  removeDigitsOnInput('lastName');
})();
