    /**
     *  6-params Constructor
     *  editorObj is a pointer to obj which in further will be used for displaying data
     */

     var BackUp = function (logAttachmentId, deploymentLogId, patchListJSON, logsListJSON, urls, sessionId) {
        //console.log('call BackUp');
        this.logAttachmentId = logAttachmentId;
        this.deploymentLogId = deploymentLogId;
        this.patchIdList = [];
        if (patchListJSON != undefined && patchListJSON != '') {
            this.patchIdList = JSON.parse(patchListJSON);
        }
        this.currentPatch;
        this.logsIdList = [];
        if (logsListJSON != undefined && logsListJSON != '') {
            this.logsIdList = JSON.parse(logsListJSON);
        }
        this.currentLog;
        this.indexLog;
        this.urls = urls;
        this.callback;
        this.currentPatchBkup;
        this.errors = [];
        this.chunkBlocks = [];
        this.blockIdx = 0;
        this.sid = sessionId;
    }

    BackUp.prototype.getPatchId = function () {
        if (this.patchIdList.length > 0)
            return this.patchIdList[0];
    }

    BackUp.prototype.createBackUp = function (validateOnly, call) {
        //console.log('call createBackUp');
        this.callback = call;
        this.validateOnly = validateOnly;
        if (this.urls && this.patchIdList.length > 0 && this.logAttachmentId && this.deploymentLogId) {
            this.getChunkBlocks();
        } else { // invalid params
            this.errors.push('Creating backup: wrong params');
            this.callback(this.errors);
        }
    }

    BackUp.prototype.getChunkBlocks = function () {
        //console.log('call getChunkBlocks');
        var self = this;
        Visualforce.remoting.Manager.invokeAction(
            this.urls.GET_CHUNK_BLOCKS,
            this.logAttachmentId,
            function (r, e) {
            self.handleChunckData(r, e);
        });
    }

    BackUp.prototype.handleChunckData = function (r, e) {
        //console.log('handleChunckData');
        if (e.status && r) {
            //console.log(JSON.stringify(r));
            this.chunkBlocks = r;
            this.blockIdx = 0;
            this.currentPatch = this.patchIdList.shift();
            this.populatePatch();
        } else {
            this.errors.push(e);
            this.callback(this.errors);
        }

    }

    // used to create a related list of Patch Manifests
    BackUp.prototype.populatePatch = function () {
        var self = this;
        if (this.blockIdx < this.chunkBlocks.length) {
            //console.log('currentPatch'+this.currentPatch);
            //console.log('populatePatch:'+JSON.stringify(this.chunkBlocks));
            Visualforce.remoting.Manager.invokeAction(
                this.urls.POPULATE_PATCH,
                this.currentPatch,
                JSON.stringify(this.chunkBlocks[this.blockIdx++]),
                this.urls.SOURCE_TYPE,
                this.urls.SOURCE_NAME,
                function (r, e) {
                self.handlePatchPopulate(r, e);
            });
        } else { // patch is ready, create a bkup for each metadata log (if needed)
            ////console.log('this.currentPatch:'+this.currentPatch);
            //test exit point
            //return;
            if (this.validateOnly == true || this.validateOnly == 'true') { // do not create rollback if validation only mode set
                this.callback(this.errors);
            } else {
                indexLog = 0;
                this.processMetadataLog();
            }
        }
    }

    BackUp.prototype.handlePatchPopulate = function (r, e) {
        //console.log('handlePatchPopulate:'+JSON.stringify(r));
        if (e.status && r) {
            this.populatePatch();
        } else {
            this.errors.push(e);
            this.callback(this.errors);
        }
    }

    BackUp.prototype.processMetadataLog = function () {
        var self = this;
        if (indexLog < this.logsIdList.length) {
            this.currentLog = this.logsIdList[indexLog++];
            Visualforce.remoting.Manager.invokeAction(
                this.urls.SET_AUTH,
                this.currentLog,
                function (r, e) {
                self.handleAuthInformation(r, e);
            });
        } else {
            if (self.patchIdList.length > 0) {
                self.currentPatch = self.patchIdList.shift();
                self.blockIdx = 0;
                self.populatePatch();
            } else {
                self.callback(self.errors);
            }

        }

    }

    BackUp.prototype.handleAuthInformation = function (r, e) {
        var self = this;
        if (e.status && r) {
            if (r.msg == '') {
                //console.log('auth:'+JSON.stringify(r));
                //console.log('currentPatchBkup:'+JSON.stringify(this.currentPatchBkup));
                var rollBack = new RollBackZip(r, this.currentLog, this.sid, this.urls.COLLECT_BKUP_INFO, this.currentPatchBkup);
                rollBack.createRollBackZip(this.currentPatch, function (err) {
                    ////console.log('createRollBackZip complete:'+JSON.stringify(err));
                    // TODO: analyse error list and cancel some patches if needed
                    if (self.logsIdList.length > 0) {
                        this.currentPatchBkup = rollBack.getBkup();
                        //console.log('currentPatchBkup:'+JSON.stringify(this.currentPatchBkup));
                        self.processMetadataLog();
                    } else {
                        self.callback(self.errors);
                    }
                });
            } else {
                this.errors.push(r.msg);
                this.callback(this.errors);
            }
        } else {
            this.errors.push(e);
            this.callback(this.errors);
        }
    }

    var mmap = new Object();
    mmap['CustomField'] = true;
    mmap['CustomLabel'] = true;
    mmap['CompactLayout'] = true;
    mmap['WebLink'] = true;
    mmap['RecordType'] = true;
    mmap['ListView'] = true;
    mmap['FieldSet'] = true;
    mmap['AssignmentRule'] = true;
    mmap['AutoResponseRule'] = true;
    mmap['ValidationRule'] = true;
    mmap['WorkflowTask'] = true;
    mmap['WorkflowOutboundMessage'] = true;
    mmap['WorkflowFieldUpdate'] = true;
    mmap['WorkflowKnowledgePublish'] = true;
    mmap['WorkflowAlert'] = true;
    mmap['WorkflowRule'] = true;
    mmap['SharingOwnerRule'] = true;
    mmap['SharingCriteriaRule'] = true;
    mmap['SharingGuestRule'] = true;
    mmap['SharingTerritoryRule'] = true;
    mmap['BusinessProcess'] = true;
    mmap['SharingReason'] = true;
    mmap['EscalationRule'] = true;
    mmap['MatchingRule'] = true;
    mmap['ManagedTopic'] = true;
    mmap['BotVersion'] = true;


    var metadataTypeHeaderMap = {};
    metadataTypeHeaderMap['CustomLabel'] = '<?xml version="1.0" encoding="UTF-8"?><CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['CustomField'] = '<?xml version="1.0" encoding="UTF-8"?><CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['CompactLayout'] = '<?xml version="1.0" encoding="UTF-8"?><CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['WebLink'] = '<?xml version="1.0" encoding="UTF-8"?><CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['RecordType'] = '<?xml version="1.0" encoding="UTF-8"?><CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['ListView'] = '<?xml version="1.0" encoding="UTF-8"?><CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['FieldSet'] = '<?xml version="1.0" encoding="UTF-8"?><CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['BusinessProcess'] = '<?xml version="1.0" encoding="UTF-8"?><CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['SharingReason'] = '<?xml version="1.0" encoding="UTF-8"?><CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['ValidationRule'] = '<?xml version="1.0" encoding="UTF-8"?><CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['AssignmentRule'] = '<?xml version="1.0" encoding="UTF-8"?><AssignmentRules xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['AutoResponseRule'] = '<?xml version="1.0" encoding="UTF-8"?><AutoResponseRules xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['WorkflowTask'] = '<?xml version="1.0" encoding="UTF-8"?><Workflow xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['WorkflowOutboundMessage'] = '<?xml version="1.0" encoding="UTF-8"?><Workflow xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['WorkflowFieldUpdate'] = '<?xml version="1.0" encoding="UTF-8"?><Workflow xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['WorkflowKnowledgePublish'] = '<?xml version="1.0" encoding="UTF-8"?><Workflow xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['WorkflowAlert'] = '<?xml version="1.0" encoding="UTF-8"?><Workflow xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['WorkflowRule'] = '<?xml version="1.0" encoding="UTF-8"?><Workflow xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['SharingOwnerRule'] = '<?xml version="1.0" encoding="UTF-8"?><SharingRules xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['SharingCriteriaRule'] = '<?xml version="1.0" encoding="UTF-8"?><SharingRules xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['SharingGuestRule'] = '<?xml version="1.0" encoding="UTF-8"?><SharingRules xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['SharingTerritoryRule'] = '<?xml version="1.0" encoding="UTF-8"?><SharingRules xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['EscalationRule'] = '<?xml version="1.0" encoding="UTF-8"?><EscalationRules xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['MatchingRule'] = '<?xml version="1.0" encoding="UTF-8"?><MatchingRules xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['ManagedTopic'] = '<?xml version="1.0" encoding="UTF-8"?><ManagedTopics xmlns="http://soap.sforce.com/2006/04/metadata">';
    metadataTypeHeaderMap['BotVersion'] = '<?xml version="1.0" encoding="UTF-8"?><Bot xmlns="http://soap.sforce.com/2006/04/metadata">';

    var metadataTypeFooterMap = {};
    metadataTypeFooterMap['CustomLabel'] = '</CustomLabels>';
    metadataTypeFooterMap['CustomField'] = '</CustomObject>';
    metadataTypeFooterMap['CompactLayout'] = '</CustomObject>';
    metadataTypeFooterMap['WebLink'] = '</CustomObject>';
    metadataTypeFooterMap['RecordType'] = '</CustomObject>';
    metadataTypeFooterMap['ListView'] = '</CustomObject>';
    metadataTypeFooterMap['FieldSet'] = '</CustomObject>';
    metadataTypeFooterMap['BusinessProcess'] = '</CustomObject>';
    metadataTypeFooterMap['SharingReason'] = '</CustomObject>';
    metadataTypeFooterMap['ValidationRule'] = '</CustomObject>';
    metadataTypeFooterMap['AssignmentRule'] = '</AssignmentRules>';
    metadataTypeFooterMap['AutoResponseRule'] = '</AutoResponseRules>';
    metadataTypeFooterMap['WorkflowTask'] = '</Workflow>';
    metadataTypeFooterMap['WorkflowOutboundMessage'] = '</Workflow>';
    metadataTypeFooterMap['WorkflowFieldUpdate'] = '</Workflow>';
    metadataTypeFooterMap['WorkflowKnowledgePublish'] = '</Workflow>';
    metadataTypeFooterMap['WorkflowAlert'] = '</Workflow>';
    metadataTypeFooterMap['WorkflowRule'] = '</Workflow>';
    metadataTypeFooterMap['SharingOwnerRule'] = '</SharingRules>';
    metadataTypeFooterMap['SharingCriteriaRule'] = '</SharingRules>';
    metadataTypeFooterMap['SharingGuestRule'] = '</SharingRules>';
    metadataTypeFooterMap['SharingTerritoryRule'] = '</SharingRules>';
    metadataTypeFooterMap['EscalationRule'] = '</EscalationRules>';
    metadataTypeFooterMap['MatchingRule'] = '</MatchingRules>';
    metadataTypeFooterMap['ManagedTopic'] = '</ManagedTopics>';
    metadataTypeFooterMap['BotVersion'] = '</Bot>';

    var metadataTypePreTagMap = {};
    metadataTypePreTagMap['CustomLabel'] = '<labels>';
    metadataTypePreTagMap['CustomField'] = '<fields>';
    metadataTypePreTagMap['CompactLayout'] = '<compactLayouts>';
    metadataTypePreTagMap['WebLink'] = '<webLinks>';
    metadataTypePreTagMap['RecordType'] = '<recordTypes>';
    metadataTypePreTagMap['ListView'] = '<listViews>';
    metadataTypePreTagMap['FieldSet'] = '<fieldSets>';
    metadataTypePreTagMap['BusinessProcess'] = '<businessProcesses>';
    metadataTypePreTagMap['SharingReason'] = '<sharingReasons>';
    metadataTypePreTagMap['ValidationRule'] = '<validationRules>';
    metadataTypePreTagMap['AssignmentRule'] = '<assignmentRule>';
    metadataTypePreTagMap['AutoResponseRule'] = '<autoResponseRule>';
    metadataTypePreTagMap['WorkflowTask'] = '<tasks>';
    metadataTypePreTagMap['WorkflowOutboundMessage'] = '<outboundMessages>';
    metadataTypePreTagMap['WorkflowFieldUpdate'] = '<fieldUpdates>';
    metadataTypePreTagMap['WorkflowKnowledgePublish'] = '<knowledgePublishes>';
    metadataTypePreTagMap['WorkflowAlert'] = '<alerts>';
    metadataTypePreTagMap['WorkflowRule'] = '<rules>';
    metadataTypePreTagMap['SharingOwnerRule'] = '<sharingOwnerRules>';
    metadataTypePreTagMap['SharingCriteriaRule'] = '<sharingCriteriaRules>';
    metadataTypePreTagMap['SharingGuestRule'] = '<sharingGuestRules>';
    metadataTypePreTagMap['SharingTerritoryRule'] = '<sharingTerritoryRules>';
    metadataTypePreTagMap['EscalationRule'] = '<escalationRule>';
    metadataTypePreTagMap['MatchingRule'] = '<matchingRules>';
    metadataTypePreTagMap['ManagedTopic'] = '<managedTopic>';
    metadataTypePreTagMap['BotVersion'] = '<botVersions>';

    var metadataTypePostTagMap = {};
    metadataTypePostTagMap['CustomLabel'] = '</labels>';
    metadataTypePostTagMap['CustomField'] = '</fields>';
    metadataTypePostTagMap['CompactLayout'] = '</compactLayouts>';
    metadataTypePostTagMap['WebLink'] = '</webLinks>';
    metadataTypePostTagMap['RecordType'] = '</recordTypes>';
    metadataTypePostTagMap['ListView'] = '</listViews>';
    metadataTypePostTagMap['FieldSet'] = '</fieldSets>';
    metadataTypePostTagMap['BusinessProcess'] = '</businessProcesses>';
    metadataTypePostTagMap['SharingReason'] = '</sharingReasons>';
    metadataTypePostTagMap['ValidationRule'] = '</validationRules>';
    metadataTypePostTagMap['AssignmentRule'] = '</assignmentRule>';
    metadataTypePostTagMap['AutoResponseRule'] = '</autoResponseRule>';
    metadataTypePostTagMap['WorkflowTask'] = '</tasks>';
    metadataTypePostTagMap['WorkflowOutboundMessage'] = '</outboundMessages>';
    metadataTypePostTagMap['WorkflowFieldUpdate'] = '</fieldUpdates>';
    metadataTypePostTagMap['WorkflowKnowledgePublish'] = '</knowledgePublishes>';
    metadataTypePostTagMap['WorkflowAlert'] = '</alerts>';
    metadataTypePostTagMap['WorkflowRule'] = '</rules>';
    metadataTypePostTagMap['SharingOwnerRule'] = '</sharingOwnerRules>';
    metadataTypePostTagMap['SharingCriteriaRule'] = '</sharingCriteriaRules>';
    metadataTypePostTagMap['SharingGuestRule'] = '</sharingGuestRules>';
    metadataTypePostTagMap['SharingTerritoryRule'] = '</sharingTerritoryRules>';
    metadataTypePostTagMap['EscalationRule'] = '</escalationRule>';
    metadataTypePostTagMap['MatchingRule'] = '</matchingRules>';
    metadataTypePostTagMap['ManagedTopic'] = '</managedTopic>';
    metadataTypePostTagMap['BotVersion'] = '</botVersions>';


    const XML_NAME = 'package.xml';
    const XML_PRE = 'destructiveChangesPre.xml';
    const XML_POST = 'destructiveChangesPost.xml';

    const bundleTypesList = [
        'AuraDefinitionBundle',
        'LightningComponentBundle',
        'ExperienceBundle',
        'WaveTemplateBundle',
        'DigitalExperience',
        'DigitalExperienceBundle',
        'GenAiFunction',
        'AppFrameworkTemplateBundle',
        'LightningTypeBundle',
        'GenAiPlannerBundle',
        'ContentTypeBundle'
    ];

    var folderMap = {};
    folderMap['DocumentFolder'] = 'Document';
    folderMap['DashboardFolder'] = 'Dashboard';
    folderMap['ReportFolder'] = 'Report';
    folderMap['EmailFolder'] = 'EmailTemplate';

    var DeployZip = function (
        logAttachmentId,
        urls,
        isProfileValidation,
        isPermissionSetValidation,
        pipeId,
        branchId,
        logId,
        sId
    ) {
        this.maxZipSize = 6000000; //2500000;//constant
        //console.log('call DeployZip');

        this.logAttachmentId = logAttachmentId;
        this.urls = urls;
        this.pipeId = pipeId;
        this.branchId = branchId;
        this.logId = logId;
        this.sId = sId;
        this.dataMap = {};
        this.typesToDeployMap = {};
        this.profileList = [];

        this.targetConnection = {};
        this.orgId = '';
        this.permissionSetList = [];
        this.permissionSetNamesToMergeList = [];
        this.orgsToRetrievePermissionSetsList = [];
        this.orgIdToMergedPermissionSetsList = {};

        this.attList = [];
        this.MergeBase64Str = [];
        this.Mergewrap = new Object();
        this.errors = [];

        if (typeof isProfileValidation !== "undefined" && isProfileValidation !== null && isProfileValidation !== '' && isProfileValidation !== '[]') {
            console.log('isProfileValidation');
            console.log(isProfileValidation);
            this.isProfileValidationNeeded = isProfileValidation;
        } else {
            this.isProfileValidationNeeded = true;
        }

        this.isPermissionSetValidationNeeded = isPermissionSetValidation != null ? isPermissionSetValidation : true;

        this.isClosed = false;
        //this.isProfileValidationNeeded = false;
        this.validName = {
            'ApexClass': [],
            'CustomObject': [],
            'ApexPage': [],
            'CustomTab': [],
            'Layout': [],
            'CustomApplication': [],
            'ExternalDataSource': [],
            'CustomPermission': [],
            'CustomField': [],
            'RecordType': [],
            'Profile': [],
            'FlexiPage': [],
            'DataCategoryGroup': [],
            'Flow':[]
        };

    }

    DeployZip.prototype.bClosed = function () {
        return this.isClosed;
    }

    DeployZip.prototype.getMergeList = function () {
        var tmp = [];
        for (var x = 0; x < this.MergeBase64Str.length; x++) {
            tmp.push(this.MergeBase64Str[x]);
        }
        return tmp;
    }

    DeployZip.prototype.create = function (strict, call) {
        var self = this;

        this.callback = call;
        if (this.urls == undefined || this.logAttachmentId == undefined) {
            this.errors.push('Creating deploy zip: wrong params');
            this.callback(this.errors);
        } else {
            Visualforce.remoting.Manager.invokeAction(
                this.urls.GET_MERGE_DETAIL,
                this.logAttachmentId,
                function (r, e) {
                self.handleMergeDetail(r, e);
            });
        }
    }

    DeployZip.prototype.create2 = function (strict, call) {
        var self = this;
        this.callback = call;
        if (this.urls == undefined || this.logAttachmentId == undefined) {
            this.errors.push('Creating deploy zip: wrong params');
            this.callback(this.errors);
        } else {
            Visualforce.remoting.Manager.invokeAction(
                this.urls.GET_MERGE_DETAIL,
                this.logAttachmentId,
                this.pipeId,
                function (r, e) {
                self.handleMergeDetail(r, e);
            });
        }
    }

    DeployZip.prototype.handleMergeDetail = function (r, e) {
        if (e.status && r) {
            this.Mergewrap = r;
            if (r.attIdList.length > 0) {
                this.attList = JSON.parse(JSON.stringify(r.attIdList));
                this.getMergeAttachments();
            } else if (r.destructiveInfo != undefined && (Object.keys(r.destructiveInfo.preMap).length > 0 || Object.keys(r.destructiveInfo.postMap).length > 0)){
                console.log('destructive changes only');// continue as usual
                this.processAttachments();
            } else {
                ////console.log('nothing to merge');// continue as usual
                this.callback(this.errors);
            }
        } else {
            this.errors.push(e.message);
            this.callback(this.errors);
        }
    }

    DeployZip.prototype.getMergeAttachments = function () {
        var self = this;
        if (this.attList.length > 0) {
            var attSet = this.attList[0];
            Visualforce.remoting.Manager.invokeAction(
                this.urls.GET_ATT,
                JSON.stringify(attSet),
                function (r, e) {
                self.handleMergeAttachments(r, e);
            });
            this.attList.shift(0);
        }
    }

    DeployZip.prototype.handleMergeAttachments = function (r, e) {
        try {
            if (e.status && r) {
                for (var index in r) {
                    var compName = r[index].parentId;
                    var componentType = r[index].compType;
                    if (this.typesToDeployMap[componentType] == undefined) {
                        this.typesToDeployMap[componentType] = true;
                    }
                    var zip = new JSZip(r[index].base64, {
                        base64: true
                    });

                    for (var fileName in zip.files) {
                        if (fileName != undefined && fileName.charAt(fileName.length - 1) != '/' && fileName != XML_NAME && fileName != 'undefined') {
                            var atom = Object();
                            var file = zip.files[fileName];
                            atom.packedSize = 5000; //default value to avoid infinite cycle
                            if (file._data != undefined) {
                                var d = file._data;
                                atom.packedSize = d.compressedSize == undefined ? 5000 : d.compressedSize;
                            }
                            if(componentType === 'Profile' || componentType === 'PermissionSet'){
                                atom.data = file.asText();
                                this.dataMap[componentType + "#" + fileName] = atom;
                            }
                            else if (mmap[componentType] == undefined) {
                                atom.data = file.asBinary();
                                this.dataMap[componentType + "#" + fileName] = atom;
                            } else {
                                atom.data = file.asText();
                                this.dataMap[componentType + "#" + compName] = atom;
                            }
                        }
                        if (
                            componentType == 'Profile' &&
                            fileName != undefined &&
                            fileName.indexOf('profiles/') == 0 &&
                            fileName != XML_NAME &&
                            fileName != 'undefined'
                        ) {
                            this.profileList.push(componentType + '#' + fileName);
                        } else if (
                            componentType == 'PermissionSet' &&
                            fileName != undefined &&
                            fileName.indexOf('permissionsets/') == 0 &&
                            fileName != XML_NAME &&
                            fileName != 'undefined'
                        ) {
                            this.permissionSetNamesToMergeList.push(compName);
                            this.permissionSetList.push(componentType + '#' + fileName);
                        }
                    }
                }
                if (this.attList.length > 0) {
                    this.getMergeAttachments();
                } else {
                    ////debug(this.dataMap);
                    console.log('all atts collected succesfully');
                    console.log('profiles:' + this.profileList.length);

                    if (this.profileList.length > 0 || this.permissionSetList.length > 0) {
                        console.log('creating map');
                        for (var index = 0; index < this.Mergewrap.compList.length; index++) {
                            var comp = this.Mergewrap.compList[index];
                            var fileName = comp.compFileName;
                            var compType = comp.compType;
                            var compName = comp.compName;

                            if (mmap[compType] == undefined) {
                                key = compType + "#" + fileName;
                            } else {
                                key = compType + "#" + compName;
                            }

                            if (this.dataMap[key] != undefined) {
                                this.addValidName(compType, compName);
                            }
                        }

                        if (this.isProfileValidationNeeded || this.isPermissionSetValidationNeeded) {
                            const self = this;
                            const updateAll = function () {
                                if (self.profileList.length > 0 && self.isProfileValidationNeeded) {
                                    // merging Profiles if partialProfile is enabled
                                    const pkey = self.profileList.shift();
                                    self.updateProfilesAndPermissionSets(pkey, function () {
                                        updateAll();
                                    });
                                } else if (self.permissionSetList.length > 0 && self.isPermissionSetValidationNeeded) {
                                    // merging Permission Sets if partialProfile is enabled
                                    const pkey = self.permissionSetList.shift();
                                    self.updateProfilesAndPermissionSets(pkey, function () {
                                        updateAll();
                                    });
                                } else {
                                    // start retrieve for partial Permission Sets
                                    self.orgsToRetrievePermissionSetsList = self.Mergewrap.orgList.slice();
                                    self.retrievePermissionSetForMerge();
                                    return;
                                }
                            };
                            updateAll();
                        } else {
                            this.processAttachments();
                        }
                    } else {
                        this.processAttachments();
                    }
                }
            } else {
                this.errors.push(e.message);
                this.callback(this.errors);
            }
        } catch (e) {
            this.errors.push(e.message);
            this.callback(this.errors);
        }

    }

    DeployZip.prototype.createConnection = function (authDetails) {
        // using create createConnection method from RunPipeline.page
        return createConnection(authDetails.accessToken, authDetails.refreshToken, authDetails.instanceUrl);
    };

    DeployZip.prototype.retrievePermissionSetForMerge = function () {
        try {
            if (
                this.isPermissionSetValidationNeeded &&
                this.permissionSetNamesToMergeList.length > 0 &&
                this.orgsToRetrievePermissionSetsList.length > 0
            ) {
                setMessageOnPage('Merging permission sets...');

                const retrieveRequest = getRetrieveRequest({
                    PermissionSet: this.permissionSetNamesToMergeList
                });
                this.orgId = this.orgsToRetrievePermissionSetsList.shift();
                // using listAuth variable from RunPipeline.page to get credentials for needed orgs
                const authDetails = Object.values(listAuth).find((auth) => auth.orgId === this.orgId);
                if (!authDetails || !authDetails.isSuccess) {
                    console.log(`Partial permission sets error: ${authDetails.msg ?? 'unknown'}`);
                    return this.retrievePermissionSetForMerge();
                }

                this.targetConnection = this.createConnection(authDetails);
                this.targetConnection.metadata.pollTimeout = 12000000;
                this.targetConnection.metadata.retrieve(retrieveRequest, this.permissionRetrieveDetail.bind(this));
            } else {
                // if partial permission sets is disabled or retrieve is done, continue process
                this.processAttachments();
            }
        } catch (e) {
            this.errors.push(e.message);
            this.callback(this.errors);
        }
    };

    DeployZip.prototype.permissionRetrieveDetail = function (err, result) {
        if (err) {
            this.errors.push(e.message);
            this.callback(this.errors);
        } else {
            if (result && result.id) {
                const AsyncId = result.id;
                let remainingTime = 10;

                const timeCounter = () => {
                    if (remainingTime > 0) {
                        setMessageOnPage('Merge in progress, status check is scheduled after ' + remainingTime + ' seconds.');
                        setTimeout(timeCounter, 1000);
                        remainingTime--;
                    } else {
                        this.checkPermissionRetrieveStatus(AsyncId);
                    }
                };
                timeCounter();
            }
        }
    };

    DeployZip.prototype.checkPermissionRetrieveStatus = function (AsyncId) {
        this.targetConnection.metadata.pollTimeout = 12000000;
        this.targetConnection.metadata.checkRetrieveStatus(AsyncId, this.checkPermissionRetrieveStatusDetail.bind(this));
    };

    DeployZip.prototype.checkPermissionRetrieveStatusDetail = function (err, result) {
        if (err) {
            this.errors.push(e.message);
            this.callback(this.errors);
        } else {
            if (result != undefined && result.id != undefined) {
                if (result.done == 'true') {
                    // Errors?
                    if (result.status == 'Succeeded') {
                        const self = this;
                        if (result.zipFile != undefined) {
                            zip.createReader(
                                new zip.Data64URIReader(result.zipFile),
                                function (reader) {
                                    let EntryIndex = 0;
                                    // get all entries from the zip
                                    reader.getEntries(function (entries) {
                                        if (entries.length) {
                                            const readSingleFile = function () {
                                                if (EntryIndex < entries.length) {
                                                    const singleEntry = entries[EntryIndex];
                                                    const fileName = singleEntry.filename;

                                                    entries[EntryIndex].getData(new zip.TextWriter(), function (targetXML) {
                                                        //merge logic
                                                        try {
                                                            for (let key in self.dataMap) {
                                                                if (key != undefined && key.indexOf('PermissionSet#' + fileName) == 0) {
                                                                    const branchXML = self.dataMap[key].data;
                                                                    targetXML = self.mergePermissionSet(targetXML, branchXML);

                                                                    self.orgIdToMergedPermissionSetsList[self.orgId] =
                                                                        self.orgIdToMergedPermissionSetsList[self.orgId] || {};
                                                                    self.orgIdToMergedPermissionSetsList[self.orgId].dataMap =
                                                                        self.orgIdToMergedPermissionSetsList[self.orgId]?.dataMap || {};
                                                                    self.orgIdToMergedPermissionSetsList[self.orgId].dataMap[key] = {
                                                                        data: targetXML,
                                                                        compressedSize: singleEntry.compressedSize
                                                                    };
                                                                    break;
                                                                }
                                                            }
                                                        } catch (jsexcep) {
                                                            return setMessageOnPage(
                                                                'Malformed XML in component ' + fileName + '. Please fix before proceeding.'
                                                            );
                                                        }
                                                        //set to map.
                                                        EntryIndex++;
                                                        readSingleFile();
                                                    });
                                                } else {
                                                    self.retrievePermissionSetForMerge();
                                                }
                                            };
                                            readSingleFile();
                                        } else {
                                            self.retrievePermissionSetForMerge();
                                        }
                                    });
                                },
                                function (error) {
                                    // onerror callback
                                    if (error.message != undefined) {
                                        setMessageOnPage(error.message);
                                    } else {
                                        setMessageOnPage('Unknown error.');
                                    }
                                }
                            );
                        } else {
                            this.errors.push(e.message);
                            this.callback(this.errors);
                        }
                    } else {
                        this.errors.push(e.message);
                        this.callback(this.errors);
                    }
                } else {
                    const AsyncId = result.id;
                    let remainingTime = 10;
                    const timeCounter = () => {
                        if (remainingTime > 0) {
                            setMessageOnPage('Merge in progress, status check is scheduled after ' + remainingTime + ' seconds.');
                            setTimeout(timeCounter, 1000);
                            remainingTime--;
                        } else {
                            this.checkPermissionRetrieveStatus(AsyncId);
                        }
                    };
                    timeCounter();
                }
            } else {
                this.errors.push(e.message);
                this.callback(this.errors);
            }
        }
    };

    DeployZip.prototype.processAttachments = function () {
        try {
            var self = this;
            if (this.Mergewrap.compList != undefined && this.Mergewrap.compList.length > 0) {
                var mainZip = new JSZip();
                var packageXmlMap = {};
                var totalSize = 0;
                var index = 0;
                var typeNameMap = {};

                var processComponents = function () {
                    if (index < self.Mergewrap.compList.length) {
                        var comp = self.Mergewrap.compList[index];
                        var fileName = comp.compFileName;
                        var compType = comp.compType;
                        var compName = comp.compName;
                        var key;

                        if (mmap[compType] == undefined) {
                            key = compType + "#" + fileName;
                            if (folderMap[compType] != undefined) {
                                key = folderMap[compType] + '#' + fileName;
                            }
                        } else {
                            key = compType + "#" + compName;
                        }
                        if (self.dataMap[key] != undefined) {
                            //creating package.xml data
                            var packageXmlLi = [];
                            if (packageXmlMap[compType] != undefined) {
                                packageXmlLi = packageXmlMap[compType];
                            }
                            packageXmlLi.push(compName);
                            packageXmlMap[compType] = packageXmlLi;

                            if (mainZip.files[fileName] != undefined) {
                                ////debug('filename allready found in zip');
                                if (mmap[compType] != undefined) {
                                    var oldXML = mainZip.files[fileName].asText();

                                    var tempName = "" + compName;
                                    if (tempName.lastIndexOf('.') > -1) {
                                        var tempName = tempName.slice(tempName.lastIndexOf('.') + 1, tempName.length)
                                    }

                                    var customXML = self.getChildPartXml(self.dataMap[key].data, fileName, tempName, oldXML, compType);
                                    typeNameMap[fileName] = compType;
                                    mainZip.file(fileName, customXML);
                                    totalSize += self.dataMap[key].packedSize;
                                } else {
                                    //debug(compType+' have duplicate file Name');
                                }
                            } else {
                                typeNameMap[fileName] = compType;
                                if (mmap[compType] != undefined) {
                                    var tempName = "" + compName;
                                    if (tempName.lastIndexOf('.') > -1) {
                                        var tempName = tempName.slice(tempName.lastIndexOf('.') + 1, tempName.length)
                                    }

                                    var customXML = self.childSplitter(self.dataMap[key].data, compType, tempName);
                                    mainZip.file(fileName, customXML);
                                } else if (compType === 'Profile' || compType === 'PermissionSet') {
                                    mainZip.file(fileName, self.dataMap[key].data);
                                } else {
                                    mainZip.file(fileName, self.dataMap[key].data, {
                                        binary: true
                                    });
                                }
                                totalSize += self.dataMap[key].packedSize;
                                if (self.dataMap[key + "-meta.xml"] != undefined) {
                                    const metaName = fileName + "-meta.xml";
                                    mainZip.file(metaName, self.dataMap[key + "-meta.xml"].data, {
                                        binary: true
                                    });
                                    
                                    typeNameMap[metaName] = compType;
                                    totalSize += self.dataMap[key + "-meta.xml"].packedSize;
                                }
                            }

                            //console.log('totalSize: '+totalSize);
                            if (totalSize > self.maxZipSize) {
                                //console.log('totalSize : '+totalSize);
                                var isEmpty = true;
                                for (var fileName in mainZip.files) { // check the existence of at least 1 non-package.xml file
                                    if (fileName != undefined && fileName != XML_NAME && fileName.charAt(fileName.length - 1) != '/' && isEmpty) {
                                        isEmpty = false;
                                        break;
                                    }
                                }
                                if (!isEmpty) {
                                    if (self.Mergewrap.destructiveInfo != undefined) {
                                        if (Object.keys(self.Mergewrap.destructiveInfo.preMap).length > 0) {
                                            var preDestructiveManifest = self.destructiveXmlCreator(self.Mergewrap.destructiveInfo.preMap);
                                            mainZip.file(XML_PRE, preDestructiveManifest);
                                        }
                                        if (Object.keys(self.Mergewrap.destructiveInfo.postMap).length > 0) {
                                            var postDestructiveManifest = self.destructiveXmlCreator(self.Mergewrap.destructiveInfo.postMap);
                                            mainZip.file(XML_POST, postDestructiveManifest);
                                        }
                                    }

                                    var xmlData = self.packageXmlCreator(packageXmlMap);
                                    mainZip.file(XML_NAME, xmlData);

                                    var strBase64 = mainZip.generate({
                                        base64: true,
                                        compression: "DEFLATE"
                                    });
                                    self.MergeBase64Str.push(strBase64);
                                    self.isClosed = true;
                                    packageXmlMap = {};
                                    mainZip = new JSZip();
                                    totalSize = 0;
                                }
                            }
                        } else {
                            if (bundleTypesList.includes(compType)) {
                                var packageXmlLi = [];
                                if (packageXmlMap[compType] != undefined) {
                                    packageXmlLi = packageXmlMap[compType];
                                }
                                packageXmlLi.push(compName);
                                packageXmlMap[compType] = packageXmlLi;
                                for (var tempKey in self.dataMap) {
                                    if (tempKey != undefined && tempKey.indexOf(key + '/') == 0) {
                                        var fName = tempKey.replace(compType + "#", '');
                                        typeNameMap[fName] = compType;
                                        mainZip.file(fName, self.dataMap[tempKey].data, {
                                            binary: true
                                        });
                                        totalSize += self.dataMap[tempKey].packedSize;
                                    }
                                }
                                if (compType == 'ExperienceBundle' && self.dataMap[key + ".site-meta.xml"] != undefined) {
                                    typeNameMap[fileName] = compType;
                                    mainZip.file(fileName + ".site-meta.xml", self.dataMap[key + ".site-meta.xml"].data, {
                                        binary: true
                                    });
                                    totalSize += self.dataMap[key + ".site-meta.xml"].packedSize;
                                }
                            } else {
                                console.log('item not found---'+key);
                            }
                        }
                        index++;

                        setTimeout(function () {
                            processComponents();
                        }, 3);
                    } else {
                        let isEmpty = true;

                        for (var fileName in mainZip.files) {
                            if (fileName != undefined && fileName != 'package.xml' && fileName.charAt(fileName.length - 1) != '/' && isEmpty) {
                                isEmpty = false;
                                break;
                            }
                        }

                        if (!isEmpty) {
                            //console.log('totalSize: ' + totalSize);
                            if (self.Mergewrap.destructiveInfo != undefined) {

                                if (Object.keys(self.Mergewrap.destructiveInfo.preMap).length > 0) {
                                    const preDestructiveManifest = self.destructiveXmlCreator(self.Mergewrap.destructiveInfo.preMap);
                                    mainZip.file(XML_PRE, preDestructiveManifest);
                                }
                                if (Object.keys(self.Mergewrap.destructiveInfo.postMap).length > 0) {
                                    const postDestructiveManifest = self.destructiveXmlCreator(self.Mergewrap.destructiveInfo.postMap);
                                    mainZip.file(XML_POST, postDestructiveManifest);
                                }
                            }

                            const xmlData = self.packageXmlCreator(packageXmlMap);
                            mainZip.file(XML_NAME, xmlData);

                            const logAttachments = [];

                            for (let i = 0; i < self.Mergewrap.orgList.length; i++) {
                                const orgId = self.Mergewrap.orgList[i];
                                const tempZip = new JSZip();

                                for (let fileName in mainZip.files) {
                                    let isFileChanged = false;

                                    if (
                                        fileName != undefined &&
                                        fileName != 'package.xml' &&
                                        self.isPermissionSetValidationNeeded &&
                                        self.orgIdToMergedPermissionSetsList[orgId] &&
                                        self.orgIdToMergedPermissionSetsList[orgId].dataMap['PermissionSet#' + fileName] &&
                                        fileName.startsWith('permissionsets/') &&
                                        fileName.charAt(fileName.length - 1) != '/' &&
                                        mainZip.files[fileName] != undefined &&
                                        mainZip.files[fileName].dir == false
                                    ) {
                                        const text =
                                            self.orgIdToMergedPermissionSetsList[orgId].dataMap['PermissionSet#' + fileName].data ??
                                            mainZip.files[fileName].asText();
                                        tempZip.file(fileName, text);
                                        isFileChanged = true;
                                    }

                                    if (
                                        fileName != undefined &&
                                        fileName != 'package.xml' &&
                                        self.Mergewrap.envVarMap[orgId] &&
                                        self.Mergewrap.metaTypes.includes(typeNameMap[fileName]) &&
                                        fileName.charAt(fileName.length - 1) != '/' &&
                                        mainZip.files[fileName] != undefined &&
                                        mainZip.files[fileName].dir == false
                                    ) {
                                        let text = mainZip.files[fileName].asText();
                                        for (let val in self.Mergewrap.envVarMap[orgId]) {
                                            text = text.replaceAll('%%' + val + '%%', self.Mergewrap.envVarMap[orgId][val]);
                                        }
                                        tempZip.file(fileName, text);
                                        isFileChanged = true;
                                    }

                                    if (!isFileChanged) {
                                        tempZip.file(fileName, mainZip.files[fileName].asBinary(), {
                                            binary: true
                                        });
                                    }
                                }

                                const strBase64 = tempZip.generate({
                                    base64: true,
                                    compression: 'DEFLATE'
                                });

                                logAttachments.push({
                                    ParentId: self.branchId,
                                    Name: 'Build' + orgId.substring(0, 15),
                                    Body: strBase64,
                                    ContentType: 'application/zip',
                                    Description: 'Build' + self.logId
                                });
                            }

                            const selfConn = new flosumsf.Connection({
                                accessToken: self.sId,
                                maxRequest: 45
                            });
                            selfConn.sobject('Attachment').create(logAttachments, function (err, result) {
                                if (err) {
                                    totalSize = 0;
                                    self.errors.push(err.message);
                                    self.callback(self.errors);
                                } else {
                                    totalSize = 0;
                                    self.callback(self.errors);
                                }
                            });
                        } else {
                            self.callback(self.errors);
                        }
                    }
                } // end of processComponents def
                processComponents();
            } else {
                if (self.Mergewrap.destructiveInfo != undefined) {
                    var mainZip = new JSZip();
                    var packageXmlMap = {};
                    var totalSize = 0;

                    var logAttachments = [];
                    if (Object.keys(self.Mergewrap.destructiveInfo.preMap).length > 0) {
                        var preDestructiveManifest = self.destructiveXmlCreator(self.Mergewrap.destructiveInfo.preMap);
                        mainZip.file(XML_PRE, preDestructiveManifest);
                    }
                    if (Object.keys(self.Mergewrap.destructiveInfo.postMap).length > 0) {
                        var postDestructiveManifest = self.destructiveXmlCreator(self.Mergewrap.destructiveInfo.postMap);
                        mainZip.file(XML_POST, postDestructiveManifest);
                    }
                    var xmlData = self.packageXmlCreator(packageXmlMap);
                    mainZip.file(XML_NAME, xmlData);
                    var strBase64 = mainZip.generate({
                        base64: true,
                        compression: "DEFLATE"
                    });
                    for (var i = 0; i < self.Mergewrap.orgList.length; i++) {
                        var org = self.Mergewrap.orgList[i];
                        logAttachments.push({
                            ParentId: self.branchId,
                            Name: 'Build' + org.substring(0, 15),
                            Body: strBase64,
                            ContentType: 'application/zip',
                            Description: 'Build' + self.logId
                        });
                    }
                    const selfConn = new flosumsf.Connection({
                        accessToken: self.sId,
                        maxRequest: 45
                    });
                    selfConn.sobject('Attachment').create(logAttachments, function (err, result) {
                        if (err) {
                            totalSize = 0;
                            self.errors.push(err.message);
                            self.callback(self.errors);
                        } else {
                            totalSize = 0;
                            self.callback(self.errors);
                        }
                    });
                } else {
                    self.callback(self.errors);
                }
            }
        } catch (e) {
            this.errors.push(e.message);
            this.callback(this.errors);
        }
    }

    DeployZip.prototype.packageXmlCreator = function (packageXmlMap) {
        var xml = '<?xml version="1.0" encoding="UTF-8"?><Package xmlns="http://soap.sforce.com/2006/04/metadata">';
        for (var mType in packageXmlMap) {
            var packageXmlLi = [];
            packageXmlLi = packageXmlMap[mType];
            xml = xml + '<types>';
            for (var index in packageXmlLi) {
                if (index < packageXmlLi.length) {
                    xml = xml + '<members>';
                    xml = xml + packageXmlLi[index];
                    xml = xml + '</members>';
                }
            }
            xml = xml + '<name>' + mType + '</name></types>';
        }
        xml = xml + '<version>' + apiVersion + '</version></Package>\n';
        return vkbeautify.xml(xml);
    }

    DeployZip.prototype.destructiveXmlCreator = function (packageXmlMap) {
        var xml = '<?xml version="1.0" encoding="UTF-8"?><Package xmlns="http://soap.sforce.com/2006/04/metadata">';
        var isFound = false;
        for (var mType in packageXmlMap) {
            if (!isFound)
                isFound = true;
            var packageXmlLi = [];
            packageXmlLi = packageXmlMap[mType];
            xml = xml + '<types>';
            for (var index in packageXmlLi) {
                if (index < packageXmlLi.length) {
                    xml = xml + '<members>';
                    xml = xml + packageXmlLi[index];
                    xml = xml + '</members>';
                }
            }
            xml = xml + '<name>' + mType + '</name></types>';
        }
        xml = xml + '<version>' + apiVersion + '</version></Package>\n';
        if (!isFound) {
            return '';
        }
        return vkbeautify.xml(xml);
    }

    DeployZip.prototype.mergePermissionSet = function (targetXML, branchXML) {
        var x2js = new X2JS({ useDoubleQuotes: true, stripWhitespaces: false });
        var targetOBJ = x2js.xml_str2json(targetXML);
        var branchOBJ = x2js.xml_str2json(branchXML);
        console.log('before merge-targetOBJ-', JSON.parse(JSON.stringify(targetOBJ)));
        console.log('before merge-branchOBJ-', JSON.parse(JSON.stringify(branchOBJ)));
        var TargetObjectForVal;
        var BranchObjectForVal;
        if (targetOBJ.PermissionSet != undefined) {
            TargetObjectForVal = targetOBJ.PermissionSet;
        }
        if (branchOBJ.PermissionSet != undefined) {
            BranchObjectForVal = branchOBJ.PermissionSet;
        }
        if (TargetObjectForVal != null && BranchObjectForVal != null) {
            var paramMapping = {};
            paramMapping['applicationVisibilities'] = 'application';
            paramMapping['classAccesses'] = 'apexClass';
            paramMapping['customMetadataTypeAccesses'] = 'name';
            paramMapping['customPermissions'] = 'name';
            paramMapping['customSettingAccesses'] = 'name';
            paramMapping['externalDataSourceAccesses'] = 'externalDataSource';
            paramMapping['fieldPermissions'] = 'field';
            paramMapping['flowAccesses'] = 'flow';
            paramMapping['objectPermissions'] = 'object';
            paramMapping['pageAccesses'] = 'apexPage';
            paramMapping['recordTypeVisibilities'] = 'recordType';
            paramMapping['tabSettings'] = 'tab';
            paramMapping['userPermissions'] = 'name';

            $.each(BranchObjectForVal, function (paramKey, paramVal) {
                if (paramKey != undefined && paramVal != undefined) {
                    if (paramMapping[paramKey] != undefined) {
                        let targetEntityList = [];
                        let brachEntityList = [];
                        //check for brach permissions
                        if (Array.isArray(paramVal)) {
                            brachEntityList = paramVal;
                        } else {
                            brachEntityList.push(paramVal);
                        }
                        //check for target org permissions
                        if (TargetObjectForVal[paramKey] != undefined && Array.isArray(TargetObjectForVal[paramKey])) {
                            targetEntityList = TargetObjectForVal[paramKey];
                        } else if (TargetObjectForVal[paramKey] != undefined) {
                            targetEntityList.push(TargetObjectForVal[paramKey]);
                        }

                        let fullMap = {};
                        $.each(targetEntityList, function (index2, item) {
                            if (item != undefined && typeof item == 'object' && item[paramMapping[paramKey]] != undefined) {
                                fullMap[item[paramMapping[paramKey]]] = item;
                            }
                        });
                        if (paramKey != 'userPermissions') {
                            $.each(brachEntityList, function (index2, item) {
                                if (item != undefined && typeof item == 'object' && item[paramMapping[paramKey]] != undefined) {
                                    fullMap[item[paramMapping[paramKey]]] = item;
                                }
                            });
                        }
                        let NewArr = [];
                        $.each(fullMap, function (permissionEntityName, permissionNode) {
                            NewArr.push(permissionNode);
                        });
                        if (NewArr.length > 0) {
                            TargetObjectForVal[paramKey] = NewArr;
                        } else {
                            delete TargetObjectForVal[paramKey];
                        }
                    } else {
                        TargetObjectForVal[paramKey] = paramVal;
                    }
                }
            });
        }
        if (targetOBJ.PermissionSet != undefined && TargetObjectForVal != null) {
            targetOBJ.PermissionSet = TargetObjectForVal;
        }
        console.log('after merge', JSON.parse(JSON.stringify(targetOBJ)));
        let returnXML = x2js.json2xml_str(targetOBJ)+'\n';
        returnXML = vkbeautify.xml('<?xml version="1.0" encoding="UTF-8"?>' + returnXML);
        return returnXML;
    };


    DeployZip.prototype.getChildPartXml = function (newXml, fileName, itemName, oldXml, metaType) {
        var x2js = new X2JS({
            useDoubleQuotes: true,
            stripWhitespaces: false,
            escapeMode: true
        });
        var tgtmap = {};
        var srcjson = x2js.xml_str2json(newXml);
        if (srcjson != null) {
            var srcitems;
            if (metaType == 'CustomLabel') {
                var srcMetaItem = srcjson.CustomLabels;
                srcitems = srcMetaItem.labels;
            } else if (metaType == 'CustomField') {
                var srcMetaItem = srcjson.CustomObject;
                srcitems = srcMetaItem.fields;
            } else if (metaType == 'ListView') {
                var srcMetaItem = srcjson.CustomObject;
                srcitems = srcMetaItem.listViews;
            } else if (metaType == 'CompactLayout') {
                var srcMetaItem = srcjson.CustomObject;
                srcitems = srcMetaItem.compactLayouts;
            } else if (metaType == 'WebLink') {
                var srcMetaItem = srcjson.CustomObject;
                srcitems = srcMetaItem.webLinks;
            } else if (metaType == 'RecordType') {
                var srcMetaItem = srcjson.CustomObject;
                srcitems = srcMetaItem.recordTypes;
            } else if (metaType == 'FieldSet') {
                var srcMetaItem = srcjson.CustomObject;
                srcitems = srcMetaItem.fieldSets;
            } else if (metaType == 'ValidationRule') {
                var srcMetaItem = srcjson.CustomObject;
                srcitems = srcMetaItem.validationRules;
            } else if (metaType == 'AssignmentRule') {
                var srcMetaItem = srcjson.AssignmentRules;
                srcitems = srcMetaItem.assignmentRule;
            } else if (metaType == 'AutoResponseRule') {
                var srcMetaItem = srcjson.AutoResponseRules;
                srcitems = srcMetaItem.autoResponseRule;
            } else if (metaType == 'WorkflowTask') {
                var srcMetaItem = srcjson.Workflow;
                srcitems = srcMetaItem.tasks;
            } else if (metaType == 'WorkflowOutboundMessage') {
                var srcMetaItem = srcjson.Workflow;
                srcitems = srcMetaItem.outboundMessages;
            } else if (metaType == 'WorkflowFieldUpdate') {
                var srcMetaItem = srcjson.Workflow;
                srcitems = srcMetaItem.fieldUpdates;
            } else if (metaType == 'WorkflowKnowledgePublish') {
                var srcMetaItem = srcjson.Workflow;
                srcitems = srcMetaItem.knowledgePublishes;
            } else if (metaType == 'WorkflowAlert') {
                var srcMetaItem = srcjson.Workflow;
                srcitems = srcMetaItem.alerts;
            } else if (metaType == 'WorkflowRule') {
                var srcMetaItem = srcjson.Workflow;
                srcitems = srcMetaItem.rules;
            } else if (metaType == 'SharingCriteriaRule') {
                var srcMetaItem = srcjson.SharingRules;
                srcitems = srcMetaItem.sharingCriteriaRules;
            } else if (metaType == 'SharingGuestRule') {
                var srcMetaItem = srcjson.SharingRules;
                srcitems = srcMetaItem.sharingGuestRules;
            } else if (metaType == 'SharingTerritoryRule') {
                var srcMetaItem = srcjson.SharingRules;
                srcitems = srcMetaItem.sharingTerritoryRules;
            } else if (metaType == 'SharingOwnerRule') {
                var srcMetaItem = srcjson.SharingRules;
                srcitems = srcMetaItem.sharingOwnerRules;
            } else if (metaType == 'BusinessProcess') {
                var srcMetaItem = srcjson.CustomObject;
                srcitems = srcMetaItem.businessProcesses;
            } else if (metaType == 'SharingReason') {
                var srcMetaItem = srcjson.CustomObject;
                srcitems = srcMetaItem.sharingReasons;
            } else if (metaType == 'EscalationRule') {
                var srcMetaItem = srcjson.EscalationRules;
                srcitems = srcMetaItem.escalationRule;
            } else if (metaType == 'MatchingRule') {
                var srcMetaItem = srcjson.MatchingRules;
                srcitems = srcMetaItem.matchingRules;
            } else if (metaType == 'ManagedTopic') {
                var srcMetaItem = srcjson.ManagedTopics;
                srcitems = srcMetaItem.ManagedTopic;
            } else if (metaType == 'BotVersion') {
                var srcMetaItem = srcjson.Bot;
                srcitems = srcMetaItem.botVersions;
            }
            ////
            if (srcitems != undefined) {
                if (srcitems.fullName == undefined) {
                    $.each(srcitems, function (i, v) {
                        tgtmap[v.fullName] = JSON.stringify(v);
                    });
                } else {
                    tgtmap[srcitems.fullName] = JSON.stringify(srcitems);
                }
            }
        }

        if (tgtmap[itemName] != undefined) {
            tempJsn = x2js.xml_str2json(oldXml);
            if (tempJsn != null) {
                var obje = {};
                var templi;
                var preMap = {};
                if (metaType == 'CustomLabel') {
                    obje = tempJsn.CustomLabels;
                    templi = obje.labels;
                } else if (metaType == 'CustomField') {
                    obje = tempJsn.CustomObject;
                    templi = obje.fields;
                } else if (metaType == 'ListView') {
                    obje = tempJsn.CustomObject;
                    templi = obje.listViews;
                } else if (metaType == 'CompactLayout') {
                    obje = tempJsn.CustomObject;
                    templi = obje.compactLayouts;
                } else if (metaType == 'WebLink') {
                    obje = tempJsn.CustomObject;
                    templi = obje.webLinks;
                } else if (metaType == 'RecordType') {
                    obje = tempJsn.CustomObject;
                    templi = obje.recordTypes;
                } else if (metaType == 'FieldSet') {
                    obje = tempJsn.CustomObject;
                    templi = obje.fieldSets;
                } else if (metaType == 'ValidationRule') {
                    obje = tempJsn.CustomObject;
                    templi = obje.validationRules;
                } else if (metaType == 'AssignmentRule') {
                    obje = tempJsn.AssignmentRules;
                    templi = obje.assignmentRule;
                } else if (metaType == 'AutoResponseRule') {
                    obje = tempJsn.AutoResponseRules;
                    templi = obje.autoResponseRule;
                } else if (metaType == 'WorkflowTask') {
                    obje = tempJsn.Workflow;
                    templi = obje.tasks;
                } else if (metaType == 'WorkflowOutboundMessage') {
                    obje = tempJsn.Workflow;
                    templi = obje.outboundMessages;
                } else if (metaType == 'WorkflowFieldUpdate') {
                    obje = tempJsn.Workflow;
                    templi = obje.fieldUpdates;
                } else if (metaType == 'WorkflowKnowledgePublish') {
                    obje = tempJsn.Workflow;
                    templi = obje.knowledgePublishes;
                } else if (metaType == 'WorkflowAlert') {
                    obje = tempJsn.Workflow;
                    templi = obje.alerts;
                } else if (metaType == 'WorkflowRule') {
                    obje = tempJsn.Workflow;
                    templi = obje.rules;
                } else if (metaType == 'SharingCriteriaRule') {
                    obje = tempJsn.SharingRules;
                    templi = obje.sharingCriteriaRules;
                } else if (metaType == 'SharingGuestRule') {
                    obje = tempJsn.SharingRules;
                    templi = obje.sharingGuestRules;
                } else if (metaType == 'SharingTerritoryRule') {
                    obje = tempJsn.SharingRules;
                    templi = obje.sharingTerritoryRules;
                } else if (metaType == 'SharingOwnerRule') {
                    obje = tempJsn.SharingRules;
                    templi = obje.sharingOwnerRules;
                } else if (metaType == 'BusinessProcess') {
                    obje = tempJsn.CustomObject;
                    templi = obje.businessProcesses;
                } else if (metaType == 'SharingReason') {
                    obje = tempJsn.CustomObject;
                    templi = obje.sharingReasons;
                } else if (metaType == 'EscalationRule') {
                    obje = tempJsn.EscalationRules;
                    templi = obje.escalationRule;
                } else if (metaType == 'MatchingRule') {
                    obje = tempJsn.MatchingRules;
                    templi = obje.matchingRules;
                } else if (metaType == 'ManagedTopic') {
                    obje = tempJsn.ManagedTopics;
                    templi = obje.ManagedTopic;
                } else if (metaType == 'BotVersion') {
                    obje = tempJsn.Bot;
                    templi = obje.botVersions;
                }

                if (templi != undefined) {
                    if (templi.fullName == undefined) {
                        $.each(templi, function (i, v) {
                            preMap[v.fullName] = JSON.stringify(v);
                        });
                    } else {
                        preMap[templi.fullName] = JSON.stringify(templi);
                    }
                }
                preMap[itemName] = tgtmap[itemName];
                updatedJsn = '[';
                for (var name in preMap) {
                    if (updatedJsn == '[') {
                        updatedJsn += preMap[name];
                    } else {
                        updatedJsn += ',' + preMap[name];
                    }
                }
                updatedJsn += ']';
                if (metaType == 'CustomLabel') {
                    obje.labels = JSON.parse(updatedJsn);
                    tempJsn.CustomLabels = obje;
                } else if (metaType == 'CustomField') {
                    obje.fields = JSON.parse(updatedJsn);
                    tempJsn.CustomObject = obje;
                } else if (metaType == 'ListView') {
                    obje.listViews = JSON.parse(updatedJsn);
                    tempJsn.CustomObject = obje;
                } else if (metaType == 'CompactLayout') {
                    obje.compactLayouts = JSON.parse(updatedJsn);
                    tempJsn.CustomObject = obje;
                } else if (metaType == 'WebLink') {
                    obje.webLinks = JSON.parse(updatedJsn);
                    tempJsn.CustomObject = obje;
                } else if (metaType == 'RecordType') {
                    obje.recordTypes = JSON.parse(updatedJsn);
                    tempJsn.CustomObject = obje;
                } else if (metaType == 'FieldSet') {
                    obje.fieldSets = JSON.parse(updatedJsn);
                    tempJsn.CustomObject = obje;
                } else if (metaType == 'ValidationRule') {
                    obje.validationRules = JSON.parse(updatedJsn);
                    tempJsn.CustomObject = obje;
                } else if (metaType == 'AssignmentRule') {
                    obje.assignmentRule = JSON.parse(updatedJsn);
                    tempJsn.AssignmentRules = obje;
                } else if (metaType == 'AutoResponseRule') {
                    obje.autoResponseRule = JSON.parse(updatedJsn);
                    tempJsn.AutoResponseRules = obje;
                } else if (metaType == 'WorkflowTask') {
                    obje.tasks = JSON.parse(updatedJsn);
                    tempJsn.Workflow = obje;
                } else if (metaType == 'WorkflowOutboundMessage') {
                    obje.outboundMessages = JSON.parse(updatedJsn);
                    tempJsn.Workflow = obje;
                } else if (metaType == 'WorkflowFieldUpdate') {
                    obje.fieldUpdates = JSON.parse(updatedJsn);
                    tempJsn.Workflow = obje;
                } else if (metaType == 'WorkflowKnowledgePublish') {
                    obje.knowledgePublishes = JSON.parse(updatedJsn);
                    tempJsn.Workflow = obje;
                } else if (metaType == 'WorkflowAlert') {
                    obje.alerts = JSON.parse(updatedJsn);
                    tempJsn.Workflow = obje;
                } else if (metaType == 'WorkflowRule') {
                    obje.rules = JSON.parse(updatedJsn);
                    tempJsn.Workflow = obje;
                } else if (metaType == 'SharingCriteriaRule') {
                    obje.sharingCriteriaRules = JSON.parse(updatedJsn);
                    tempJsn.SharingRules = obje;
                } else if (metaType == 'SharingGuestRule') {
                    obje.sharingGuestRules = JSON.parse(updatedJsn);
                    tempJsn.SharingRules = obje;
                } else if (metaType == 'SharingTerritoryRule') {
                    obje.sharingTerritoryRules = JSON.parse(updatedJsn);
                    tempJsn.SharingRules = obje;
                } else if (metaType == 'SharingOwnerRule') {
                    obje.sharingOwnerRules = JSON.parse(updatedJsn);
                    tempJsn.SharingRules = obje;
                } else if (metaType == 'BusinessProcess') {
                    obje.businessProcesses = JSON.parse(updatedJsn);
                    tempJsn.CustomObject = obje;
                } else if (metaType == 'SharingReason') {
                    obje.sharingReasons = JSON.parse(updatedJsn);
                    tempJsn.CustomObject = obje;
                } else if (metaType == 'EscalationRule') {
                    obje.escalationRule = JSON.parse(updatedJsn);
                    tempJsn.EscalationRules = obje;
                } else if (metaType == 'MatchingRule') {
                    obje.matchingRules = JSON.parse(updatedJsn);
                    tempJsn.MatchingRules = obje;
                } else if (metaType == 'ManagedTopic') {
                    obje.ManagedTopic = JSON.parse(updatedJsn);
                    tempJsn.ManagedTopics = obje;
                } else if (metaType == 'BotVersion') {
                    obje.botVersions = JSON.parse(updatedJsn);
                    tempJsn.Bot = obje;
                }
                ////
                oldXml = x2js.json2xml_str($.parseJSON(JSON.stringify(tempJsn)));
                oldXml = '<?xml version="1.0" encoding="UTF-8"?>' + oldXml;
            }
        }
        return vkbeautify.xml(oldXml);
    }



    DeployZip.prototype.childSplitter = function (fullXml, metaType, fileName) {
        if (fullXml != undefined) {
            var fullName = '';
            var tempXml = '';
            /*if (metaType != 'CustomLabel') {
                fullName = fileName.slice(fileName.indexOf("/") + 1, fileName.lastIndexOf('.')) + ".";
            }*/
            var x2js = new X2JS({useDoubleQuotes: true, stripWhitespaces: false});
            var tgtmap = {};
            var srcjson = x2js.xml_str2json(fullXml);
            if (srcjson != null) {
                var srcitems;
                if (metaType == 'CustomLabel') {
                    var srcMetaItem = srcjson.CustomLabels;
                    srcitems = srcMetaItem.labels;
                } else if (metaType == 'CustomField') {
                    var srcMetaItem = srcjson.CustomObject;
                    srcitems = srcMetaItem.fields;
                } else if (metaType == 'ListView') {
                    var srcMetaItem = srcjson.CustomObject;
                    srcitems = srcMetaItem.listViews;
                } else if (metaType == 'CompactLayout') {
                    var srcMetaItem = srcjson.CustomObject;
                    srcitems = srcMetaItem.compactLayouts;
                } else if (metaType == 'WebLink') {
                    var srcMetaItem = srcjson.CustomObject;
                    srcitems = srcMetaItem.webLinks;
                } else if (metaType == 'RecordType') {
                    var srcMetaItem = srcjson.CustomObject;
                    srcitems = srcMetaItem.recordTypes;
                } else if (metaType == 'FieldSet') {
                    var srcMetaItem = srcjson.CustomObject;
                    srcitems = srcMetaItem.fieldSets;
                } else if (metaType == 'ValidationRule') {
                    var srcMetaItem = srcjson.CustomObject;
                    srcitems = srcMetaItem.validationRules;
                } else if (metaType == 'AssignmentRule') {
                    var srcMetaItem = srcjson.AssignmentRules;
                    srcitems = srcMetaItem.assignmentRule;
                } else if (metaType == 'AutoResponseRule') {
                    var srcMetaItem = srcjson.AutoResponseRules;
                    srcitems = srcMetaItem.autoResponseRule;
                } else if (metaType == 'WorkflowTask') {
                    var srcMetaItem = srcjson.Workflow;
                    srcitems = srcMetaItem.tasks;
                } else if (metaType == 'WorkflowOutboundMessage') {
                    var srcMetaItem = srcjson.Workflow;
                    srcitems = srcMetaItem.outboundMessages;
                } else if (metaType == 'WorkflowFieldUpdate') {
                    var srcMetaItem = srcjson.Workflow;
                    srcitems = srcMetaItem.fieldUpdates;
                } else if (metaType == 'WorkflowKnowledgePublish') {
                    var srcMetaItem = srcjson.Workflow;
                    srcitems = srcMetaItem.knowledgePublishes;
                } else if (metaType == 'WorkflowAlert') {
                    var srcMetaItem = srcjson.Workflow;
                    srcitems = srcMetaItem.alerts;
                } else if (metaType == 'WorkflowRule') {
                    var srcMetaItem = srcjson.Workflow;
                    srcitems = srcMetaItem.rules;
                } else if (metaType == 'SharingCriteriaRule') {
                    var srcMetaItem = srcjson.SharingRules;
                    srcitems = srcMetaItem.sharingCriteriaRules;
                } else if (metaType == 'SharingGuestRule') {
                    var srcMetaItem = srcjson.SharingRules;
                    srcitems = srcMetaItem.sharingGuestRules;
                } else if (metaType == 'SharingTerritoryRule') {
                    var srcMetaItem = srcjson.SharingRules;
                    srcitems = srcMetaItem.sharingTerritoryRules;
                } else if (metaType == 'SharingOwnerRule') {
                    var srcMetaItem = srcjson.SharingRules;
                    srcitems = srcMetaItem.sharingOwnerRules;
                } else if (metaType == 'BusinessProcess') {
                    var srcMetaItem = srcjson.CustomObject;
                    srcitems = srcMetaItem.businessProcesses;
                } else if (metaType == 'SharingReason') {
                    var srcMetaItem = srcjson.CustomObject;
                    srcitems = srcMetaItem.sharingReasons;
                } else if (metaType == 'EscalationRule') {
                    var srcMetaItem = srcjson.EscalationRules;
                    srcitems = srcMetaItem.escalationRule;
                } else if (metaType == 'MatchingRule') {
                    var srcMetaItem = srcjson.MatchingRules;
                    srcitems = srcMetaItem.matchingRules;
                } else if (metaType == 'ManagedTopic') {
                    var srcMetaItem = srcjson.ManagedTopics;
                    srcitems = srcMetaItem.ManagedTopic;
                } else if (metaType == 'BotVersion') {
                    var srcMetaItem = srcjson.Bot;
                    srcitems = srcMetaItem.botVersions;
                }
                //console.log('Test point for each');
                //console.log(srcitems);
                if (srcitems != undefined) {
                    if (srcitems.fullName == undefined) {
                        $.each(srcitems, function (i, v) {
                            if (v.fullName == fileName){
                                tgtmap[v.fullName] = JSON.stringify(v);
                            }
                        });
                    } else {
                        tgtmap[srcitems.fullName] = JSON.stringify(srcitems);
                    }
                }
                if (metadataTypeHeaderMap[metaType] != undefined && metadataTypePreTagMap[metaType] != undefined && metadataTypePostTagMap[metaType] != undefined && metadataTypeFooterMap[metaType] != undefined) {
                    for (var itemName in tgtmap) {

                        //header
                        tempXml = metadataTypeHeaderMap[metaType];
                        //body
                        tempXml += metadataTypePreTagMap[metaType] + '' + x2js.json2xml_str($.parseJSON(tgtmap[itemName])) + '' + metadataTypePostTagMap[metaType];
                        //footer
                        tempXml += metadataTypeFooterMap[metaType];

                    }
                }
            }
            return vkbeautify.xml(tempXml);
        }
    }

    // validation logic

    //Validation Profile
    const ACT_STR = 'Activity.';

    DeployZip.prototype.addValidName = function (metaType, itemName) {
        if (this.validName[metaType] != undefined && itemName != undefined) {
            //this.isProfileValidationNeeded = true;
            this.validName[metaType].push(itemName);
            var itemFullName = itemName;
            //Activity custom fields to Event and Task
            if (metaType == 'CustomField' && itemFullName.indexOf(ACT_STR) == 0 && itemFullName.lastIndexOf('__c') == itemFullName.length - 3) {
                var tempItemName = itemFullName.substring(ACT_STR.length, itemFullName.length);
                this.validName[metaType].push('Task.' + tempItemName);
                this.validName[metaType].push('Event.' + tempItemName);
            }
        }
    }

    DeployZip.prototype.updateProfilesAndPermissionSets = function (key, callback) {

        var obj = this.dataMap[key];
        if (obj == undefined || obj.data == undefined) {
            callback();
            return;
        }
        var objectForValidation = obj.data;
        var x2js = new X2JS({
            useDoubleQuotes: true,
            stripWhitespaces: false,
            escapeMode: true
        });
        var orignal = x2js.xml_str2json(objectForValidation);
        var ObjectForVal;
        if (orignal.Profile != undefined) {
            ObjectForVal = orignal.Profile;
        } else if (orignal.PermissionSet != undefined) {
            ObjectForVal = orignal.PermissionSet;
        }
        if (ObjectForVal != null) {
            //APEX CLASS
            if (ObjectForVal.classAccesses != undefined) {
                var NewArr = [];
                var EtallonClasses = this.validName.ApexClass;
                if (Array.isArray(ObjectForVal.classAccesses)) {
                    for (var index in ObjectForVal.classAccesses) {
                        if (jQuery.inArray(ObjectForVal.classAccesses[index].apexClass, EtallonClasses) !== -1) {
                            NewArr.push(ObjectForVal.classAccesses[index]);
                        }
                    }
                } else {
                    if (jQuery.inArray(ObjectForVal.classAccesses.apexClass, EtallonClasses) !== -1) {
                        NewArr.push(ObjectForVal.classAccesses);
                    }
                }
                if (NewArr.length > 0) {
                    ObjectForVal.classAccesses = NewArr;
                } else {
                    delete ObjectForVal.classAccesses;
                }
            }

            //APEX PAGE
            if (ObjectForVal.pageAccesses != undefined) {
                var NewArr = [];
                var EtallonPages = this.validName.ApexPage;
                if (Array.isArray(ObjectForVal.pageAccesses)) {
                    for (var index in ObjectForVal.pageAccesses) {
                        if (jQuery.inArray(ObjectForVal.pageAccesses[index].apexPage, EtallonPages) !== -1) {
                            NewArr.push(ObjectForVal.pageAccesses[index]);
                        }
                    }
                } else {
                    if (jQuery.inArray(ObjectForVal.pageAccesses.apexPage, EtallonPages) !== -1) {
                        NewArr.push(ObjectForVal.pageAccesses);
                    }
                }
                if (NewArr.length > 0) {
                    ObjectForVal.pageAccesses = NewArr;
                } else {
                    delete ObjectForVal.pageAccesses;
                }
            }

            //TAB permision
            if (ObjectForVal.tabSettings != undefined && orignal.PermissionSet != undefined) {
                var NewArr = [];
                var EtallonTab = this.validName.CustomTab;
                if (Array.isArray(ObjectForVal.tabSettings)) {
                    for (var index in ObjectForVal.tabSettings) {
                        if (jQuery.inArray(ObjectForVal.tabSettings[index].tab, EtallonTab) !== -1) {
                            NewArr.push(ObjectForVal.tabSettings[index]);
                        }
                    }
                } else {
                    if (jQuery.inArray(ObjectForVal.tabSettings.tab, EtallonTab) !== -1) {
                        NewArr.push(ObjectForVal.tabSettings);
                    }
                }
                if (NewArr.length > 0) {
                    ObjectForVal.tabSettings = NewArr;
                } else {
                    delete ObjectForVal.tabSettings;
                }
            }

            //TAB Profile
            if (ObjectForVal.tabVisibilities != undefined && orignal.Profile != undefined) {
                var NewArr = [];
                var EtallonTab = this.validName.CustomTab;
                if (Array.isArray(ObjectForVal.tabVisibilities)) {
                    for (var index in ObjectForVal.tabVisibilities) {
                        if (jQuery.inArray(ObjectForVal.tabVisibilities[index].tab, EtallonTab) !== -1) {
                            NewArr.push(ObjectForVal.tabVisibilities[index]);
                        }
                    }
                } else {
                    if (jQuery.inArray(ObjectForVal.tabVisibilities.tab, EtallonTab) !== -1) {
                        NewArr.push(ObjectForVal.tabVisibilities);
                    }
                }
                if (NewArr.length > 0) {
                    ObjectForVal.tabVisibilities = NewArr;
                } else {
                    delete ObjectForVal.tabVisibilities;
                }
            }

            //profileActionOverrides Profile
            if (ObjectForVal.profileActionOverrides != undefined && orignal.Profile != undefined) {
                var NewArr = [];
                var EtallonTab = this.validName.FlexiPage;
                if (Array.isArray(ObjectForVal.profileActionOverrides)) {
                    for (var index in ObjectForVal.profileActionOverrides) {
                        if (jQuery.inArray(ObjectForVal.profileActionOverrides[index].content, EtallonTab) !== -1) {
                            NewArr.push(ObjectForVal.profileActionOverrides[index]);
                        }
                    }
                } else {
                    if (jQuery.inArray(ObjectForVal.profileActionOverrides.content, EtallonTab) !== -1) {
                        NewArr.push(ObjectForVal.profileActionOverrides);
                    }
                }
                if (NewArr.length > 0) {
                    ObjectForVal.profileActionOverrides = NewArr;
                } else {
                    delete ObjectForVal.profileActionOverrides;
                }
            }

            //categoryGroupVisibilities Profile
            if (ObjectForVal.categoryGroupVisibilities != undefined && orignal.Profile != undefined) {
                var NewArr = [];
                var EtallonTab = this.validName.DataCategoryGroup;
                if (Array.isArray(ObjectForVal.categoryGroupVisibilities)) {
                    for (var index in ObjectForVal.categoryGroupVisibilities) {
                        if (jQuery.inArray(ObjectForVal.categoryGroupVisibilities[index].dataCategoryGroup, EtallonTab) !== -1) {
                            NewArr.push(ObjectForVal.categoryGroupVisibilities[index]);
                        }
                    }
                } else {
                    if (jQuery.inArray(ObjectForVal.categoryGroupVisibilities.dataCategoryGroup, EtallonTab) !== -1) {
                        NewArr.push(ObjectForVal.categoryGroupVisibilities);
                    }
                }
                if (NewArr.length > 0) {
                    ObjectForVal.categoryGroupVisibilities = NewArr;
                } else {
                    delete ObjectForVal.categoryGroupVisibilities;
                }
            }

            //OBJECT
            if (ObjectForVal.objectPermissions != undefined) {
                var NewArr = [];
                var EtallonObject = this.validName.CustomObject;
                if (Array.isArray(ObjectForVal.objectPermissions)) {
                    for (var index in ObjectForVal.objectPermissions) {
                        if (jQuery.inArray(ObjectForVal.objectPermissions[index].object, EtallonObject) !== -1) {
                            NewArr.push(ObjectForVal.objectPermissions[index]);
                        }
                    }
                } else {
                    if (jQuery.inArray(ObjectForVal.objectPermissions.object, EtallonObject) !== -1) {
                        NewArr.push(ObjectForVal.objectPermissions);
                    }
                }

                if (NewArr.length > 0) {
                    ObjectForVal.objectPermissions = NewArr;
                } else {
                    delete ObjectForVal.objectPermissions;
                }
            }

            //customMetadataTypeAccesses
            if (ObjectForVal.customMetadataTypeAccesses != undefined) {
                var NewArr = [];
                var EtallonObject = this.validName.CustomObject;
                if (Array.isArray(ObjectForVal.customMetadataTypeAccesses)) {
                    for (var index in ObjectForVal.customMetadataTypeAccesses) {
                        if (jQuery.inArray(ObjectForVal.customMetadataTypeAccesses[index].name, EtallonObject) !== -1) {
                            NewArr.push(ObjectForVal.customMetadataTypeAccesses[index]);
                        }
                    }
                } else {
                    if (jQuery.inArray(ObjectForVal.customMetadataTypeAccesses.name, EtallonObject) !== -1) {
                        NewArr.push(ObjectForVal.customMetadataTypeAccesses);
                    }
                }

                if (NewArr.length > 0) {
                    ObjectForVal.customMetadataTypeAccesses = NewArr;
                } else {
                    delete ObjectForVal.customMetadataTypeAccesses;
                }
            }

            //customSettingAccesses
            if (ObjectForVal.customSettingAccesses != undefined) {
                var NewArr = [];
                var EtallonObject = this.validName.CustomObject;
                if (Array.isArray(ObjectForVal.customSettingAccesses)) {
                    for (var index in ObjectForVal.customSettingAccesses) {
                        if (jQuery.inArray(ObjectForVal.customSettingAccesses[index].name, EtallonObject) !== -1) {
                            NewArr.push(ObjectForVal.customSettingAccesses[index]);
                        }
                    }
                } else {
                    if (jQuery.inArray(ObjectForVal.customSettingAccesses.name, EtallonObject) !== -1) {
                        NewArr.push(ObjectForVal.customSettingAccesses);
                    }
                }

                if (NewArr.length > 0) {
                    ObjectForVal.customSettingAccesses = NewArr;
                } else {
                    delete ObjectForVal.customSettingAccesses;
                }
            }

            //Layout
            if (ObjectForVal.layoutAssignments != undefined) {
                var NewArr = [];
                var EtallonLauout = this.validName.Layout;
                if (Array.isArray(ObjectForVal.layoutAssignments)) {
                    for (var index in ObjectForVal.layoutAssignments) {
                        if (jQuery.inArray(ObjectForVal.layoutAssignments[index].layout, EtallonLauout) !== -1) {
                            if (ObjectForVal.layoutAssignments[index].recordType != undefined) {
                                var RecordTypesAvailLi = this.validName.RecordType;
                                if (jQuery.inArray(ObjectForVal.layoutAssignments[index].recordType, RecordTypesAvailLi) !== -1) {
                                    NewArr.push(ObjectForVal.layoutAssignments[index]);
                                }
                            } else {
                                NewArr.push(ObjectForVal.layoutAssignments[index]);
                            }
                        }
                    }
                } else {
                    if (jQuery.inArray(ObjectForVal.layoutAssignments.layout, EtallonLauout) !== -1) {
                        //NewArr.push(ObjectForVal.layoutAssignments);
                        if (ObjectForVal.layoutAssignments.recordType != undefined) {
                            var RecordTypesAvailLi = this.validName.RecordType;
                            if (jQuery.inArray(ObjectForVal.layoutAssignments.recordType, RecordTypesAvailLi) !== -1) {
                                NewArr.push(ObjectForVal.layoutAssignments);
                            }
                        } else {
                            NewArr.push(ObjectForVal.layoutAssignments);
                        }
                    }
                }

                if (NewArr.length > 0) {
                    ObjectForVal.layoutAssignments = NewArr;
                } else {
                    delete ObjectForVal.layoutAssignments;
                }
            }

            //recordType
            if (ObjectForVal.recordTypeVisibilities != undefined) {
                var NewArr = [];
                var EtallonObject = this.validName.RecordType;
                if (EtallonObject.length > 0) {
                    if (Array.isArray(ObjectForVal.recordTypeVisibilities)) {
                        for (var index = 0; index < ObjectForVal.recordTypeVisibilities.length; index++) {
                            var RecordTypeName = ObjectForVal.recordTypeVisibilities[index].recordType;
                            if (jQuery.inArray(RecordTypeName, EtallonObject) !== -1) {
                                NewArr.push(ObjectForVal.recordTypeVisibilities[index]);
                            }
                        }
                    } else {
                        var RecordTypeName = ObjectForVal.recordTypeVisibilities.recordType;
                        if (jQuery.inArray(RecordTypeName, EtallonObject) !== -1) {
                            NewArr.push(ObjectForVal.recordTypeVisibilities);
                        }
                    }
                }
                if (NewArr.length > 0) {
                    ObjectForVal.recordTypeVisibilities = NewArr;
                } else {
                    delete ObjectForVal.recordTypeVisibilities;
                }
            }

            //fieldPermissions
            if (ObjectForVal.fieldPermissions != undefined) {
                var NewArr = [];
                var EtallonObject = this.validName.CustomField;
                if (EtallonObject.length > 0) {
                    if (Array.isArray(ObjectForVal.fieldPermissions)) {
                        for (var index = 0; index < ObjectForVal.fieldPermissions.length; index++) {
                            var fieldName = ObjectForVal.fieldPermissions[index].field;
                            if (jQuery.inArray(fieldName, EtallonObject) !== -1) {
                                NewArr.push(ObjectForVal.fieldPermissions[index]);
                            }
                        }
                    } else {
                        var fieldName = ObjectForVal.fieldPermissions.field;
                        if (jQuery.inArray(fieldName, EtallonObject) !== -1) {
                            NewArr.push(ObjectForVal.fieldPermissions);
                        }
                    }
                }
                if (NewArr.length > 0) {
                    ObjectForVal.fieldPermissions = NewArr;
                } else {
                    delete ObjectForVal.fieldPermissions;
                }
            }

            //applicationVisibilities
            if (ObjectForVal.applicationVisibilities != undefined) {
                var NewArr = [];
                var EtallonPages = this.validName.CustomApplication;
                if (Array.isArray(ObjectForVal.applicationVisibilities)) {
                    for (var index in ObjectForVal.applicationVisibilities) {
                        if (jQuery.inArray(ObjectForVal.applicationVisibilities[index].application, EtallonPages) !== -1) {
                            NewArr.push(ObjectForVal.applicationVisibilities[index]);
                        }
                    }
                } else {
                    if (jQuery.inArray(ObjectForVal.applicationVisibilities.application, EtallonPages) !== -1) {
                        NewArr.push(ObjectForVal.applicationVisibilities);
                    }
                }

                if (NewArr.length > 0) {
                    ObjectForVal.applicationVisibilities = NewArr;
                } else {
                    delete ObjectForVal.applicationVisibilities;
                }
            }

            //externalDataSourceAccesses
            if (ObjectForVal.externalDataSourceAccesses != undefined) {
                var NewArr = [];
                var EtallonPages = this.validName.ExternalDataSource;
                if (Array.isArray(ObjectForVal.externalDataSourceAccesses)) {
                    for (var index in ObjectForVal.externalDataSourceAccesses) {
                        if (jQuery.inArray(ObjectForVal.externalDataSourceAccesses[index].externalDataSource, EtallonPages) !== -1) {
                            NewArr.push(ObjectForVal.externalDataSourceAccesses[index]);
                        }
                    }
                } else {
                    if (jQuery.inArray(ObjectForVal.externalDataSourceAccesses.externalDataSource, EtallonPages) !== -1) {
                        NewArr.push(ObjectForVal.externalDataSourceAccesses);
                    }
                }
                if (NewArr.length > 0) {
                    ObjectForVal.externalDataSourceAccesses = NewArr;
                } else {
                    delete ObjectForVal.externalDataSourceAccesses;
                }
            }

            //customPermissions
            if (ObjectForVal.customPermissions != undefined) {
                var NewArr = [];
                var EtallonPages = this.validName.CustomPermission;
                if (Array.isArray(ObjectForVal.customPermissions)) {
                    for (var index in ObjectForVal.customPermissions) {
                        if (jQuery.inArray(ObjectForVal.customPermissions[index].name, EtallonPages) !== -1) {
                            NewArr.push(ObjectForVal.customPermissions[index]);
                        }
                    }
                } else {
                    if (jQuery.inArray(ObjectForVal.customPermissions.name, EtallonPages) !== -1) {
                        NewArr.push(ObjectForVal.customPermissions);
                    }
                }
                if (NewArr.length > 0) {
                    ObjectForVal.customPermissions = NewArr;
                } else {
                    delete ObjectForVal.customPermissions;
                }
            }

            //flowAccesses
            if (ObjectForVal.flowAccesses != undefined) {
                var NewArr = [];
                var EtallonPages = this.validName.Flow;
                if (Array.isArray(ObjectForVal.flowAccesses)) {
                    for (var index in ObjectForVal.flowAccesses) {
                        if (jQuery.inArray(ObjectForVal.flowAccesses[index].flow, EtallonPages) !== -1) {
                            NewArr.push(ObjectForVal.flowAccesses[index]);
                        }
                    }
                } else {
                    if (jQuery.inArray(ObjectForVal.flowAccesses.flow, EtallonPages) !== -1) {
                        NewArr.push(ObjectForVal.flowAccesses);
                    }
                }
                if (NewArr.length > 0) {
                    ObjectForVal.flowAccesses = NewArr;
                } else {
                    delete ObjectForVal.flowAccesses;
                }
            }
        }
        if (ObjectForVal != null && ObjectForVal.userPermissions != undefined)
            delete ObjectForVal.userPermissions;
        if (ObjectForVal != null && ObjectForVal.loginIpRanges != undefined)
            delete ObjectForVal.loginIpRanges;
        if (orignal.Profile != undefined && ObjectForVal != null) {
            orignal.Profile = ObjectForVal;
        } else if (orignal.PermissionSet != undefined && ObjectForVal != null) {
            orignal.PermissionSet = ObjectForVal;
        }

        const formattedData = vkbeautify.xml('<?xml version="1.0" encoding="UTF-8"?>' + x2js.json2xml_str(orignal)+'\n');
        this.dataMap[key].data = formattedData;
        callback();
    }
