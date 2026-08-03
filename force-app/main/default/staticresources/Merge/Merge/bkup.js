/***
  This is part of Master Flosum project
  Updated: Alexey Kalutov <k5771k@gmail.com>  added the function get_difference_array 


  ***/
  var __whitespace = {" ":true, "\t":true, "\n":true, "\f":true, "\r":true};

  const ROLL_BACK_ZIP_DESCRIPTION = 'BACKUP ZIP';
  const ROLL_BACK_FILE_DESCRIPTION = 'Rollback';
  const ROLL_BACK_FILE_TYPE = 'application/zip';
  const flosumsf = jsforce;

    /**
     *  4-params Constructor
     *  editorObj is a pointer to obj which in further will be used for displaying data
     */

    var RollBackZip = function(creds, logId, session, collector, bkup){
        //console.log('call RollBackZip');
        this.deploymentLogId = logId;
        this.deployPatchId;
        this.conn1;
        this.sid = session;
        this.SF_GET_BKUP = collector;
        this.errorsLi = []; 
        this.credentials = creds;
        this.callback;
        this.backupObjectList = [];
	this.bkup = bkup;
    }




    RollBackZip.prototype.createRollBackZip = function (patchId, call){
      //console.log('call createRollBackZip');
      this.errorsLi = [];
      this.callback = call;
      this.deployPatchId = patchId;

        if (this.credentials == undefined){
            this.errorsLi.push('Creating rollback: wrong credentials');
            this.callback(this.errorsLi);
        }else{
	    if (this.bkup == undefined){
	      this.getBackUpInfo();
	    }else{
	      this.processBackUpInfo();
	    }
        }
}

RollBackZip.prototype.getBackUpInfo = function()
{
    var self = this;
    Visualforce.remoting.Manager.invokeAction(
        this.SF_GET_BKUP,
        this.deployPatchId,
	function (r,e){
	  self.handleBackUpInfo(r,e);   
	}
    );
}

RollBackZip.prototype.getBkup = function()
{
  var bkMap = new Object();
  bkMap = this.bkup;
  return bkMap;
}

RollBackZip.prototype.connection = function()
{
    this.conn1 =  new flosumsf.Connection({
     oauth2 : {
        clientId : this.credentials.clientId,
        clientSecret : this.credentials.clientSecret,
        redirectUri : this.credentials.redirectUri,
    },
    accessToken : this.credentials.accessToken,
    proxyUrl: "/services/proxy",
    refreshToken : this.credentials.refreshToken,
	  //                maxRequest: 10,
	  serverUrl: this.credentials.instanceUrl
    });

}

RollBackZip.prototype.handleBackUpInfo = function(r,e)
{
  if(e.status && r) 
  {
    this.bkup = r;
    this.processBackUpInfo();
  }
  else
  {
    this.errorsLi.push('Error while getting backup of target org :'+e.message);
    this.callback(this.errorsLi);
  }
 
}

RollBackZip.prototype.processBackUpInfo = function()
{
  var self = this;
  //console.log('handleBackUpInfo:'+JSON.stringify(r));
  try{
    console.log('this.credentials '+JSON.stringify(this.credentials));
    setMessageOnPage("Creating backup...");
    this.conn1 =  new flosumsf.Connection({
     oauth2 : {
        clientId : this.credentials.clientId,
        clientSecret : this.credentials.clientSecret,
        redirectUri : this.credentials.redirectUri,
    },
    accessToken : this.credentials.accessToken,
    proxyUrl: "/services/proxy",
    refreshToken : this.credentials.refreshToken,
	  //                maxRequest: 10,
	  serverUrl: this.credentials.instanceUrl
    });

    var retrieveRequest = this.getRetrieveRequest(this.bkup);
    this.conn1.metadata.pollTimeout = 12000000;
    this.conn1.metadata.retrieve(
		retrieveRequest,
		 function (e,r){
		    self.retrieveDetail(e,r);
		 }
	);
   }catch(e){
     if (e != undefined){
	      this.errorsLi.push(e);
     }else{
	      this.errorsLi.push('Unknown error. Try to refresh the page.');
     }
      this.callback(this.errorsLi);
  }
 }

RollBackZip.prototype.retrieveDetail = function(err, result)
{
  var self = this;
  if(err) 
  { 
      if(err != null && err != undefined && err.errorCode != undefined)
      {
          this.errorsLi.push(err.errorCode);
          this.callback(this.errorsLi);
      }
      else
      {
          this.errorsLi.push('A request was sent to Salesforce to retrieve the prior version of the files before deployment. However, Salesforce did not return any response. Flosum was not able to create a rollback.');
          this.callback(this.errorsLi);
      }
  }
  else
  {
      if(result != undefined && result.id != undefined)
      {
          var AsyncId = result.id;
          var remainingTime = 10;
          var timeCounter = function(){
            if(remainingTime > 0)
            {
                setMessageOnPage("Backup Retrieval status check is scheduled after "+remainingTime+" seconds.");
                setTimeout(timeCounter, 1000);
                remainingTime--;
            }
            else
            {
                self.checkRetrieveStatus(AsyncId);
            }
        }
        timeCounter();
    }
  }
}

RollBackZip.prototype.checkRetrieveStatus = function(AsyncId)
{
    self = this;
    this.conn1.metadata.pollTimeout = 12000000;
    this.conn1.metadata.checkRetrieveStatus(AsyncId,
					    function (e,r){
						self.checkRetrieveStatusDetail(e,r);
					    });
}


RollBackZip.prototype.checkRetrieveStatusDetail = function(err, result)
{
  var self = this;
if(err){
        if(err != null && err != undefined && err.errorCode != undefined)
        {
            this.errorsLi.push(err.errorCode);
            this.callback(this.errorsLi);
        }
        else
        {
          this.errorsLi.push('A request was sent to Salesforce to retrieve the prior version of the files before deployment. However, Salesforce did not return any response. Flosum was not able to create a rollback.');
          this.callback(this.errorsLi);
      }
}
else
{
    if(result != undefined && result.id != undefined)
    {
        if(result.done == 'true')
        {
            // Errors?
            if(result.status == 'Succeeded')
            {
                if(result.zipFile != undefined )
                {   
                    if(result.zipFile.length < 3000000)
                    {
                        this.saveBackupZip(result.zipFile);
                    }
                    else//repack retrieved zip file into smaller zips
                    {
                    self.backupObjectList = [];
                       zip.workerScripts = {
                            deflater: ['res/js/workers/z-worker.js', 'res/js/workers/deflate.js'],
                            inflater: ['res/js/workers/z-worker.js', 'res/js/workers/inflate.js']
                        };

                        zip.useWebWorkers = false;
                        zip.createReader(new zip.Data64URIReader(result.zipFile), function(reader) {
                        var EntryIndex = 0;
                        // get all entries from the zip
                        reader.getEntries(function(entries) {
                            if(entries.length)
                            {
                                var bodySize = 0;
                                var fileLi = [];
                                var readSingleFile = function(){
                                    if (EntryIndex < entries.length) 
                                    {
                                        var singleEntry = entries[EntryIndex];
                                        var fileName = singleEntry.filename;
                                        entries[EntryIndex].getData(new zip.BlobWriter(), function(blobData) {
                                            if(bodySize + blobData.size > 2000000 && fileLi.length > 0)
                                            {
                                                var addIndex = 0;
                                                function nextFile() 
                                                {
                                                    var file = fileLi[addIndex];
                                                    zipWriter.add(file.name, new zip.BlobReader(file.data), function() {
                                                        addIndex++;
                                                        if(addIndex < fileLi.length)
                                                            nextFile();
                                                        else
                                                        {
                                                            zipWriter.close(function(base64Data) {
                                                                base64Data = base64Data.slice(base64Data.indexOf(';base64,') + 8);
                                                                bodySize = 0;
                                                                fileLi = [];
                                                                self.backupObjectList.push({
                                                                    ParentId: self.deploymentLogId,
                                                                    Name : ROLL_BACK_ZIP_DESCRIPTION,
                                                                    Description:ROLL_BACK_ZIP_DESCRIPTION,
                                                                    Body:base64Data,
                                                                    ContentType : ROLL_BACK_FILE_TYPE
                                                                });

                                                                var fileInfo = new Object();
                                                                fileInfo.name = fileName;
                                                                fileInfo.data = blobData;
                                                                fileLi.push(fileInfo);
                                                                bodySize = bodySize + blobData.size;
                                                                EntryIndex++;
                                                                readSingleFile();
                                                            });
                                                        }
                                                    });
                                                }

                                                function createZipWriter() {
                                                  zip.createWriter(writer, function(writer) {
                                                    zipWriter = writer;
                                                    nextFile();
                                                }, onerror);
                                              }
                                              writer = new zip.Data64URIWriter();
                                              createZipWriter();
                                          }
                                          else
                                          {
                                            var fileInfo = new Object();
                                            fileInfo.name = fileName;
                                            fileInfo.data = blobData;
                                            fileLi.push(fileInfo);
                                            bodySize = bodySize + blobData.size;
                                            EntryIndex++;
                                            readSingleFile();
                                           }
                                        });
                                    }
                                    else
                                    {
                                        if(fileLi.length > 0)
                                        {
                                            var addIndex = 0;
                                            function nextFile() 
                                            {
                                                var file = fileLi[addIndex];
                                                zipWriter.add(file.name, new zip.BlobReader(file.data), function() {
                                                addIndex++;
                                                if(addIndex < fileLi.length){
                                                     nextFile();
                                                }
                                                else
                                                {
                                                    zipWriter.close(function(base64Data) {
                                                        base64Data = base64Data.slice(base64Data.indexOf(';base64,') + 8);
                                                        bodySize = 0;
                                                        fileLi = [];
                                                        console.log('zipWriter.close');
                                                        self.backupObjectList.push({
                                                            ParentId: self.deploymentLogId,
                                                            Name : ROLL_BACK_ZIP_DESCRIPTION,
                                                            Description:ROLL_BACK_ZIP_DESCRIPTION,
                                                            Body:base64Data,
                                                            ContentType : ROLL_BACK_FILE_TYPE
                                                        });
                                                        self.backupSingleFileSaver();
                                                    });
                                                }
                                                });
                                            }
        
                                            function createZipWriter() {
                                                zip.createWriter(writer, function(writer) {
                                                    zipWriter = writer;
                                                    nextFile();
                                                    }, onerror
                                                );
                                            }
                                            writer = new zip.Data64URIWriter();
                                            createZipWriter();
                                        }
                                        else
                                        {
                                            self.backupSingleFileSaver();
                                        }
                                    }
                                }
                                readSingleFile();
                            }
                            else
                            {
                                //console.log('!entries.length');
                            }
                        });
                    }, function(error) {
                      // onerror this.callback
                       if(error.message != undefined)
                        {
                            console.log(error);
                            setMessageOnPage(error.message);
                        }
                        else
                        {
                            setMessageOnPage('Unknown error.');
                        }
                    });
                    }
                }
                else
                {
                    this.callback(this.errorsLi);
                }
            }
            else
            {
                this.errorsLi.push(result.errorMessage);
                this.callback(this.errorsLi);
            }
        }
        else
        {
            var AsyncId = result.id;
            var remainingTime = 10;
            var timeCounter = function(){
                if(remainingTime > 0)
                {
                    setMessageOnPage("Backup Retrieval status check is scheduled after "+remainingTime+" seconds.");
                    setTimeout(timeCounter, 1000);
                    remainingTime--;
                }
                else
                {
                    self.checkRetrieveStatus(AsyncId);
                }
            }
            timeCounter();
        }
    }
    else
    {
        this.errorsLi.push('Unknown error while getting backup of target org.');
        this.callback(this.errorsLi);
    }
}
}

RollBackZip.prototype.backupSingleFileSaver = function()
{
    var self = this;
	//console.log("Saving backup file...");

    if(self.backupObjectList.length > 0)
    {
        setMessageOnPage("Saving backup file...");
        var attObj = self.backupObjectList[0];
        var selfConn = new flosumsf.Connection({ accessToken: self.sid});
        selfConn.sobject('Attachment').create(attObj,function(err, result){
            if(err)
            {
                setMessageOnPage(err.errorCode);
            }
            else
            {
                self.backupSingleFileSaver();
            }
        });
        self.backupObjectList.shift();
    }
    else
    {
         this.callback(this.errorsLi);
    }
}

    //Save backup zip for rollback
    RollBackZip.prototype.saveBackupZip = function(base64data)
    {
	var self = this;
        setMessageOnPage("Saving backup file...");
        
        //console.log(("Saving backup file..."));
        
        var selfConn = new flosumsf.Connection({ accessToken: self.sid});
        selfConn.sobject('Attachment').create({ 
	      ParentId: self.deploymentLogId,
	      Name : ROLL_BACK_ZIP_DESCRIPTION,
	      Body: base64data,
	      ContentType : ROLL_BACK_FILE_TYPE, 
	      Description :  ROLL_BACK_ZIP_DESCRIPTION,
	    },
	    function (e,r){
	      self.attachmentSaveHandler(e,r);
	    }
        );
    }
    
    RollBackZip.prototype.attachmentSaveHandler = function(err, ret)
    {
        if (err || !ret.success) 
        { 
          console.error(err, ret); 
          //start deployment
          this.errorsLi.push(err.message);
          this.callback(this.errorsLi);
      }
      else
      {
          //start deployment
          this.callback(this.errorsLi);
      }
  }
  
  RollBackZip.prototype.getRetrieveRequest = function(retrieveMap)
  {
    var retrieveRequest = new Object();
    retrieveRequest.apiVersion = apiVersion;
    retrieveRequest.singlePackage = true;
    retrieveRequest.unpackaged = {};
    retrieveRequest.unpackaged.types = [];
    if (retrieveMap != undefined){
      for(var metaType in retrieveMap)
      {
        var oneType = {};
        oneType.name = metaType;
        oneType.members = [];
        var li = retrieveMap[metaType];
        for(var index in li)
        {
            if(index< li.length)
            {
                oneType.members.push(li[index]);
            }
        }
        retrieveRequest.unpackaged.types.push(oneType);
      }
    }
    return retrieveRequest;
}


function setMessageOnPage2(msg)
{
    var parentVal = $("[id$='msg']");
    if(parentVal != undefined)
    {
     var childVal = parentVal.find('.messageText');
     if(childVal != undefined)
     {
        if(msg.indexOf('#') > -1)
        {
            var li = msg.split('#');
            var strHtml = '<span></span>';
            for(var index=0; index < li.length; index++)
                strHtml+= '<li>'+li[index]+'</li>';
            childVal.html(strHtml);
        }
        else
            childVal.text(msg);
		overridePageMessagesStatic();
     }
    }
}

function setMessageOnPage(msg)
{
    var parentVal = $("[id$='msg']");
    if (msg == undefined || msg == ''){
        if($j('#msg') != undefined)
        {
            $j('#msg').remove();
        }
	return;
    }
    if(parentVal != undefined)
    {
        parentVal.html('');
 //       var childVal = '<span id="j_id0:msg:j_id19:j_id20:0:j_id21">'+
        var childVal = '<span id="msg">'+
        '<div class="message infoM3" role="alert">'+
        '<table border="0" cellpadding="0" cellspacing="0" class="messageTable" style="padding:0px;margin:0px;">'+
        '<tbody>'+
        '<tr valign="top">'+
        '<td><img alt="INFO" class="msgIcon" src="/s.gif" title="INFO"></td>'+
        '<td class="messageCell">'+
        '<div id="j_id0:msg:j_id19:j_id20:0:j_id21:j_id22:j_id24" class="messageText">'+
        '<span id="j_id0:msg:j_id19:j_id20:0:j_id21:j_id22:j_id25">'+
        '<h4></h4>'+
        '</span>'+msg+'<br>'+
        '</div>'+
        '</td>'+
        '</tr>'+
        '<tr>'+
        '<td></td>'+
        '<td></td>'+
        '</tr>'+
        '</tbody>'+
        '</table>'+
        '</div>'+
        '</span>';
        parentVal.append(childVal);
		overridePageMessagesStatic();
    }
}

function overridePageMessagesStatic(){    
	var textureEffect = '';
	textureEffect = 'slds-theme--alert-texture';
				 
	$j('.warningM3').addClass('slds-notify slds-notify--toast slds-theme--warning customMessage '+textureEffect);          
	$j('.confirmM3').addClass('slds-notify slds-notify--alert slds-theme--success  customMessage '+textureEffect);    
	$j('.errorM3').addClass('slds-notify slds-notify--alert slds-theme--error customMessage '+textureEffect);                  
	$j('.infoM3').addClass('slds-notify slds-notify--toast customMessage infoMessage '+textureEffect);                    
	$j('.errorM3').removeClass('errorM3'); 
	$j('.confirmM3').removeClass('confirmM3'); 
	$j('.infoM3').removeClass('infoM3');   
	$j('.warningM3').removeClass('warningM3'); 
}


