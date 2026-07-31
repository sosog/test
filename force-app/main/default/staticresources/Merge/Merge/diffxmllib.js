const COLOR_UPDATED = '#d3f1ff';
const COLOR_DELETED = '#ffdcdc';
const COLOR_CREATED = '#daffda';

const COLOR_CHANGED = '#FFF7CC';

const typeSupertagMap = new Object();
typeSupertagMap['ActionLinkGroupTemplate'] = 'ActionLinkGroupTemplate';
typeSupertagMap['AnalyticSnapshot'] = 'AnalyticSnapshot';
typeSupertagMap['ArticleType'] = 'ArticleType';
typeSupertagMap['ApexComponent'] = 'ApexComponent';
typeSupertagMap['ApexTestSuite'] = 'ApexTestSuite';
typeSupertagMap['AppMenu'] = 'AppMenu';
typeSupertagMap['ApprovalProcess'] = 'ApprovalProcess';
typeSupertagMap['AssignmentRules'] = 'AssignmentRules';
typeSupertagMap['AuthProvider'] = 'AuthProvider';
typeSupertagMap['AutoResponseRules'] = 'AutoResponseRules';
typeSupertagMap['BrandingSet'] = 'BrandingSet';
typeSupertagMap['CallCenter'] = 'CallCenter';
typeSupertagMap['CampaignInfluenceModel'] = 'CampaignInfluenceModel';
typeSupertagMap['Certificate'] = 'Certificate';
typeSupertagMap['ChatterExtensions(Pilot)'] = 'ChatterExtensions(Pilot)';
typeSupertagMap['CleanDataService'] = 'CleanDataService';
typeSupertagMap['Community(Zone)'] = 'Community(Zone)';
typeSupertagMap['CommunityTemplateDefinition'] = 'CommunityTemplateDefinition';
typeSupertagMap['CommunityThemeDefinition'] = 'CommunityThemeDefinition';
typeSupertagMap['ConnectedApp'] = 'ConnectedApp';
typeSupertagMap['ContentAsset'] = 'ContentAsset';
typeSupertagMap['CorsWhitelistOrigin'] = 'CorsWhitelistOrigin';
typeSupertagMap['CspTrustedSite'] = 'CspTrustedSite';
typeSupertagMap['CustomApplication'] = 'CustomApplication';
typeSupertagMap['CustomApplicationComponent'] = 'CustomApplicationComponent';
typeSupertagMap['CustomFeedFilter'] = 'CustomFeedFilter';
typeSupertagMap['CustomLabels'] = 'CustomLabels';
typeSupertagMap['CustomObject'] = 'CustomObject';
typeSupertagMap['CustomObjectTranslation'] = 'CustomObjectTranslation';
typeSupertagMap['CustomPageWebLink'] = 'CustomPageWebLink';
typeSupertagMap['CustomPermission'] = 'CustomPermission';
typeSupertagMap['CustomSite'] = 'CustomSite';
typeSupertagMap['CustomTab'] = 'CustomTab';
typeSupertagMap['CustomValue'] = 'CustomValue';
typeSupertagMap['Dashboard'] = 'Dashboard';
typeSupertagMap['DataCategoryGroup'] = 'DataCategoryGroup';
typeSupertagMap['DelegateGroup'] = 'DelegateGroup';
typeSupertagMap['Document'] = 'Document';
typeSupertagMap['DuplicateRule'] = 'DuplicateRule';
typeSupertagMap['EclairGeoData'] = 'EclairGeoData';
typeSupertagMap['EmailTemplate'] = 'EmailTemplate';
typeSupertagMap['EntitlementProcess'] = 'EntitlementProcess';
typeSupertagMap['EntitlementTemplate'] = 'EntitlementTemplate';
typeSupertagMap['EscalationRules'] = 'EscalationRules';
typeSupertagMap['ExternalDataSource'] = 'ExternalDataSource';
typeSupertagMap['ExternalServiceRegistration'] = 'ExternalServiceRegistration';
typeSupertagMap['FlexiPage'] = 'FlexiPage';
typeSupertagMap['Flow'] = 'Flow';
//            typeSupertagMap['FlowDefinition'] = 'FlowDefinition';
typeSupertagMap['Folder'] = 'Folder';
typeSupertagMap['GlobalPicklist'] = 'GlobalPicklist';
typeSupertagMap['GlobalPicklistValue'] = 'GlobalPicklistValue';
typeSupertagMap['GlobalValueSet'] = 'GlobalValueSet';
typeSupertagMap['GlobalValueSetTranslation'] = 'GlobalValueSetTranslation';
typeSupertagMap['Group'] = 'Group';
typeSupertagMap['HomePageComponent'] = 'HomePageComponent';
typeSupertagMap['HomePageLayout'] = 'HomePageLayout';
typeSupertagMap['InstalledPackage'] = 'InstalledPackage';
typeSupertagMap['KeywordList'] = 'KeywordList';
typeSupertagMap['Layout'] = 'Layout';
typeSupertagMap['Letterhead'] = 'Letterhead';
typeSupertagMap['LiveChatAgentConfig'] = 'LiveChatAgentConfig';
typeSupertagMap['LiveChatButton'] = 'LiveChatButton';
typeSupertagMap['LiveChatDeployment'] = 'LiveChatDeployment';
typeSupertagMap['LiveChatSensitiveDataRule'] = 'LiveChatSensitiveDataRule';
typeSupertagMap['ManagedTopics'] = 'ManagedTopics';
typeSupertagMap['MatchingRule'] = 'MatchingRule';
typeSupertagMap['Metadata'] = 'Metadata';
typeSupertagMap['MetadataWithContent'] = 'MetadataWithContent';
typeSupertagMap['MilestoneType'] = 'MilestoneType';
typeSupertagMap['ModerationRule'] = 'ModerationRule';
typeSupertagMap['NamedCredential'] = 'NamedCredential';
typeSupertagMap['Network'] = 'Network';
typeSupertagMap['Package'] = 'Package';
typeSupertagMap['PathAssistant'] = 'PathAssistant';
typeSupertagMap['PermissionSet'] = 'PermissionSet';
typeSupertagMap['PlatformCachePartition'] = 'PlatformCachePartition';
typeSupertagMap['Portal'] = 'Portal';
typeSupertagMap['PostTemplate'] = 'PostTemplate';
typeSupertagMap['Profile'] = 'Profile';
typeSupertagMap['ProfileActionOverride'] = 'ProfileActionOverride';
typeSupertagMap['ProfilePasswordPolicy'] = 'ProfilePasswordPolicy';
typeSupertagMap['Queue'] = 'Queue';
typeSupertagMap['QuickAction'] = 'QuickAction';
typeSupertagMap['RemoteSiteSetting'] = 'RemoteSiteSetting';
typeSupertagMap['Report'] = 'Report';
typeSupertagMap['ReportType'] = 'ReportType';
typeSupertagMap['Role'] = 'Role';
typeSupertagMap['RoleOrTerritory'] = 'RoleOrTerritory';
typeSupertagMap['SamlSsoConfig'] = 'SamlSsoConfig';
typeSupertagMap['Scontrol'] = 'Scontrol';
typeSupertagMap['Settings'] = 'Settings';
typeSupertagMap['SharedTo'] = 'SharedTo';
typeSupertagMap['SharingBaseRule'] = 'SharingBaseRule';
typeSupertagMap['SharingRules'] = 'SharingRules';
typeSupertagMap['SharingSet'] = 'SharingSet';
typeSupertagMap['SiteDotCom'] = 'SiteDotCom';
typeSupertagMap['Skill'] = 'Skill';
typeSupertagMap['StandardValueSet'] = 'StandardValueSet';
typeSupertagMap['StandardValueSetTranslation'] = 'StandardValueSetTranslation';
typeSupertagMap['StaticResource'] = 'StaticResource';
typeSupertagMap['SynonymDictionary'] = 'SynonymDictionary';
typeSupertagMap['Territory'] = 'Territory';
typeSupertagMap['Territory2'] = 'Territory2';
typeSupertagMap['Territory2Model'] = 'Territory2Model';
typeSupertagMap['Territory2Rule'] = 'Territory2Rule';
typeSupertagMap['Territory2Type'] = 'Territory2Type';
typeSupertagMap['TransactionSecurityPolicy'] = 'TransactionSecurityPolicy';
typeSupertagMap['Translations'] = 'Translations';
typeSupertagMap['UserCriteria'] = 'UserCriteria';
typeSupertagMap['WaveApplication'] = 'WaveApplication';
typeSupertagMap['WaveDataflow'] = 'WaveDataflow';
typeSupertagMap['WaveDashboard'] = 'WaveDashboard';
typeSupertagMap['WaveDataset'] = 'WaveDataset';
typeSupertagMap['WaveLens'] = 'WaveLens';
typeSupertagMap['WaveTemplateBundle'] = 'WaveTemplateBundle';
typeSupertagMap['Wavexmd'] = 'Wavexmd';
typeSupertagMap['Workflow'] = 'Workflow';



const LinkingDB = new Object();

LinkingDB['CustomObject'] = {
    'fields' : ['fullName','name'],
    'actionOverrides' : ['actionName','type'],
    'value' : ['fullName'],
    'businessProcesses' : ['fullName'],
    'values' : ['fullName'],
    'compactLayouts' : ['fullName'],
    'recordTypes' : ['fullName'],
    'fieldSets' : ['fullName'],
    'availableFields' : ['field'],
    'displayedFields' : ['field'],
    'listViews' : ['fullName'],
    'filters' : ['field'],
    'namedfilters' : ['fullName'],
    'picklistValues' : ['picklist'],
    'sharingReasons' : ['fullName'],
    'sharingRecalculations' : ['className'],
    'validationRules' : ['fullName'],
    'webLinks' : ['fullName','linkType'],
    'linkType' : ['fullName'],
    'articleTypeTemplates' : ['channel'],
    'indexes' : ['name'],
    'valueSettings' : ['valueName']
};

LinkingDB['CustomObjectTranslation'] = {
    'caseValues' : ['caseType','value'],
    'fields' : ['name'],
    'workflowTasks' : ['name'],
    'webLinks' : ['name'],
    'validationRules' : ['name'],
    'sharingReasons' : ['name'],
    'recordTypes' : ['name'],
    'quickActions' : ['name'],
    'layouts' : ['layout'],
    'sections' : ['section'],
    'namedFilters' : ['name'],
    'picklistValues' : ['masterLabel']
};

LinkingDB['ActionLinkGroupTemplate'] = {
    'actionLinkTemplates' : ['labelKey','linkType']
};

LinkingDB['AnalyticSnapshot'] = {
    'mappings' : ['sourceField','sourceType','targetField']
};

LinkingDB['AppMenu'] = {
    'appMenuItems' : ['name']
};

LinkingDB['ApprovalProcess'] = {
    'allowedSubmitters' : ['type'],
    'approvalStep' : ['name'],
    'action' : ['name'],
    'approver' : ['name'],
    'criteriaItems' : ['field']
};

LinkingDB['AssignmentRules'] = {
    'assignmentRule' : ['fullName'],
    'ruleEntry' : ['assignedTo'],
    'criteriaItems' : ['field']
};


LinkingDB['AutoResponseRules'] = {
    'autoresponseRule' : ['fullName'],
    'ruleEntry' : ['senderName'],
    'criteriaItems' : ['field']
};

LinkingDB['BrandingSet'] = {
    'brandingSetProperty' : ['propertyName']
};

LinkingDB['CallCenter'] = {
    'sections' : ['name'],
    'items' : ['name']
};

LinkingDB['ChannelLayout'] = {
    'layoutItems' : ['field']
};

LinkingDB['CleanDataService'] = {
    'cleanRules' : ['developerName'],
    'fieldMappings' : ['developerName'],
    'fieldMappingRows' : ['fieldName'],
    'fieldMappingFields' : ['dataServiceField','dataServiceObjectName'],
};

LinkingDB['Community'] = {
    'chatterAnswersReputationLevels' : ['name'],
    'ideaReputationLevels' : ['name']
};

LinkingDB['CommunityTemplateDefinition'] = {
    'bundlesInfo' : ['title','type'],
    'pageSetting' : ['page'],
    'navigationMenuItem' : ['label']
};

LinkingDB['CommunityThemeDefinition'] = {
    'customThemeLayoutType' : ['label'],
    'themeSetting' : ['themeLayout']
};

LinkingDB['ConnectedApp'] = {
    'attributes' : ['key'],
    'canvasConfig' : ['canvasUrl'],
    'oauthConfig' : ['consumerKey'],
    'samlConfig' : ['entityUrl'],
    'ipRanges' : ['startAddress','endAddress']
};

LinkingDB['ContentAsset'] = {
    'organization' : ['name'],
    'version' : ['number']
};


LinkingDB['CustomApplication'] = {
    'actionOverrides' : ['actionName','formFactor','pageOrSobjectType'],
    'profileActionOverrides' : ['profile','recordType','actionName','formFactor'],
    'customApplicationComponents' : ['customApplicationComponent'],
    'defaultShortcut' : ['customApplicationComponent'],
    'customShortcut' : ['action'],
    'domainWhitelist' : ['domain'],
    'pagesToOpen' : ['pagesToOpen'],
    'pushNotification' : ['fieldNames','objectName'],
    'mapping' : ['fieldName','tab']
};


LinkingDB['CustomFeedFilter'] = {
    'criteria' : ['feedItemType','relatedSObjectType']
};

LinkingDB['CustomLabels'] = {
    'labels' : ['fullName']
};

LinkingDB['CustomMetadata'] = {
    'values' : ['field']
};


LinkingDB['CustomPermission'] = {
    'requiredPermission' : ['customPermission']
};

LinkingDB['CustomSite'] = {
    'customWebAddresses' : ['domainName'],
    'siteRedirectMappings' : ['source','target']
};

LinkingDB['CustomTab'] = {
    'actionOverrides' : ['actionName','type'],
    'value' : ['fullName']
};

LinkingDB['Dashboard'] = {
    'dashboardFilterOptions' : ['operator'],
    'dashboardFilters' : ['name'],
    'components' : ['title','componentType'],
    'dashboardFilterColumns' : ['column'],
    'dashboardComponent' : ['componentType'],
    'chartSummary' : ['column']
};

LinkingDB['DataCategoryGroup'] = {
    'dataCategory' : ['name'],
    'value' : ['fullName']
};


LinkingDB['DuplicateRule'] = {
    'duplicateRuleFilterItems' : ['field'],
    'duplicateRuleMatchRules' : ['matchRuleSObjectType','matchingRule'],
    'objectMapping' : ['outputObject','inputObject'],
    'mappingFields' : ['outputField','inputField']
};

LinkingDB['EclairGeoData'] = {
    'maps' : ['mapName']
};

LinkingDB['EmailTemplate'] = {
    'attachments' : ['name']
};

LinkingDB['EntitlementProcess'] = {
    'exitCriteriaFilterItems' : ['field'],
    'milestoneCriteriaFilterItems' : ['field'],
    'milestones' : ['milestoneName'],
    'successActions' : ['name','type'],
    'actions' : ['name','type']
};

LinkingDB['EntitlementTemplate'] = {
    'value' : ['fullName']
};

LinkingDB['EscalationRules'] = {
    'escalationRule' : ['fullName'],
    'criteriaItems' : ['field'],
    'escalationAction' : ['assignedTo']
};


LinkingDB['FlexiPage'] = {
    'flexiPageRegions' : ['name'],
    'itemInstances' : ['componentInstance.componentName','fieldInstance.identifier'],
    'componentInstance' : ['componentName'],
    'componentInstanceProperties' : ['name'],
    'fieldInstanceProperties' : ['name'],
    'flexiPageTemplateInstance' : ['name'],
    'platformActionListItems' : ['actionName'],
    'quickActionListItems' : ['quickActionName'],
    'template' : ['name'],
    'valueListItems': ['value']
};

LinkingDB['Flow'] = {
    'assignments' : ['name'],
    'actionCalls' : ['actionName'],
    'decisions' : ['name'],
    'dynamicChoiceSets' : ['name'],
    'inputParameters' : ['name'],
    'outputParameters' : ['name'],
    'apexPluginCalls' : ['apexClass'],
    'assignmentItems' : ['assignToReference'],
    'choices' : ['name'],
    'formulas' : ['name'],
    'fields' : ['name'],
    'value' : ['elementReference'],
    'processMetadataValues' : ['name'],
    'recordCreates' : ['name'],
    'rules' : ['name'],
    'screens' : ['name'],
    'subflows' : ['flowName'],
    'inputAssignments' : ['field'],
    'outputAssignments' : ['field'],
    'variables' : ['name'],
    'waits' : ['name'],
    'conditions' : ['leftValueReference'],
    'recordLookups' : ['name'],
    'customProperties' : ['name'],
    'connector' : ['targetReference'],
    'transforms' : ['name']
};

LinkingDB['DashboardFolder'] = {
    'folderShares' : ['accessLevel','sharedTo','sharedToType']
};

LinkingDB['ReportFolder'] = {
    'folderShares' : ['accessLevel','sharedTo','sharedToType']
};

LinkingDB['GlobalPicklist'] = {
    'globalPicklistValues' : ['fullName']
};

LinkingDB['GlobalValueSet'] = {
    'customValue' : ['fullName']
};

LinkingDB['GlobalValueSetTranslation'] = {
    'valueTranslation' : ['masterLabel']
};

LinkingDB['KeywordList'] = {
    'keywords' : ['keyword']
};

LinkingDB['Layout'] = {
    'layoutSections' : ['label'],
    'layoutItems' : ['field','page'],
    'layoutItem' : ['component'],
    'miniRelatedLists' : ['relatedList'],
    'relatedLists' : ['relatedList'],
    'analyticsCloudComponent' : ['devName'],
    'reportChartComponent' : ['reportName'],
    'platformActionListItems' : ['actionName','actionType'],
    'quickActionListItems' : ['quickActionName'],
    'summaryLayout' : ['masterLabel'],
    'summaryLayoutItems' : ['field'],
    'sidebarComponent' : ['page'],
    'component' : ['visualforcePage'],
    'leftComponents' : ['componentType','page'],
    'rightComponents' : ['componentType','page'],
    'feedFilters' : ['feedFilerType','feedItemType']
};


LinkingDB['ManagedTopics'] = {
    'ManagedTopic' : ['name']
};

LinkingDB['MatchingRule'] = {
    'matchingRuleItems' : ['fieldName'],
    'matchingRules' : ['fullName']
};

LinkingDB['MatchingRules'] = {
    'matchingRuleItems' : ['fieldName'],
    'matchingRules' : ['fullName']
};


LinkingDB['ModerationRule'] = {
    'entitiesAndFields' : ['entityName','fieldName']
};


LinkingDB['Network'] = {
    'level' : ['label'],
    'pointsRule' : ['eventType']
};

LinkingDB['Package'] = {
    'types' : ['name']
};

LinkingDB['PathAssistant'] = {
    'pathAssistantSteps' : ['picklistValueName']
};

LinkingDB['PermissionSet'] = {
    'applicationVisibilities' : ['application'],
    'classAccesses' : ['apexClass'],
    'customPermissions' : ['name'],
    'fieldPermissions' : ['field'],
    'objectPermissions' : ['object'],
    'pageAccesses' : ['apexPage'],
    'tabSettings' : ['tab'],
    'userPermissions' : ['name'],
    'externalDataSourceAccesses' : ['externalDataSource'],
    'recordTypeVisibilities' : ['recordType']
};

LinkingDB['PlatformCachePartition'] = {
    'platformCachePartitionTypes' : ['cacheType']
};


LinkingDB['Profile'] = {
    'applicationVisibilities' : ['application'],
    'classAccesses' : ['apexClass'],
    'customPermissions' : ['name'],
    'fieldPermissions' : ['field'],
    'fieldLevelSecurities' : ['field'],
    'layoutAssignments' : ['recordType','layout'],
    'objectPermissions' : ['object'],
    'pageAccesses' : ['apexPage'],
    'tabVisibilities' : ['tab'],
    'userPermissions' : ['name'],
    'externalDataSourceAccesses' : ['externalDataSource'],
    'recordTypeVisibilities' : ['recordType'],
    'categoryGroupVisibilities' : ['dataCategoryGroup'],
    'customMetadataTypeAccesses' : ['name'],
    'customSettingAccesses' : ['name'],
    'flowAccesses' : ['flow'],
    'loginFlows' : ['friendlyname']
};

LinkingDB['Queue'] = {
    'queueSobject' : ['sobjectType']
};

LinkingDB['QuickAction'] = {
    'fieldOverrides' : ['field'],
    'quickActionLayout' : ['layoutSectionStyle'],
    'quickActionLayoutItems' : ['field']
};


LinkingDB['Report'] = {
    'aggregates' : ['masterLabel'],
    'aggregateReferences' : ['aggregate'],
    'blockInfo' : ['blockId'],
    'buckets' : ['masterLabel','developerName'],
    'values' : ['value'],
    'chart' : ['title'],
    'colorRanges' : ['columnName'],
    'columns' : ['field'],
    'chartSummaries' : ['column'],
    'criteriaItems' : ['column'],
    'groupingsAcross' : ['field'],
    'groupingsDown' : ['field'],
    'params' : ['name']
};

LinkingDB['ReportType'] = {
    'join' : ['relationship'],
    'sections' : ['masterLabel'],
    'columns' : ['field']
};



LinkingDB['AddressSettings'] = {
    'country' : ['integrationValue'],
    'state' : ['integrationValue']
};

LinkingDB['BusinessHoursSettings'] = {
    'businessHours' : ['name'],
    'holidays' : ['name']
};

LinkingDB['CaseSettings'] = {
    'routingAddresses' : ['routingName'],
    'webToCase' : ['caseOrigin']
};

LinkingDB['CompanySettings'] = {
    'fiscalYear' : ['fiscalYearNameBasedOn']
};

LinkingDB['FileUploadAndDownloadSecuritySettings'] = {
    'dispositions' : ['behavior','fileType']
};

LinkingDB['ForecastingSettings'] = {
    'forecastingTypeSettings' : ['name'],
    'opportunityListFieldsSelectedSettings' : ['field'],
    'forecastingCategoryMappings' : ['forecastingItemCategoryApiName'],
    'weightedSourceCategories' : ['sourceCategoryApiName']
};

LinkingDB['KnowledgeSettings'] = {
    'field' : ['name']
};

LinkingDB['LeadConvertSettings'] = {
    'objectMapping' : ['inputObject','outputObject'],
    'mappingFields' : ['inputField','outputField']
};

LinkingDB['OrgPreferenceSettings'] = {
    'preferences' : ['settingName']
};

LinkingDB['SearchSettings'] = {
    'searchSettingsByObject' : ['name']
};

LinkingDB['SecuritySettings'] = {
    'ipRanges' : ['description']
};


LinkingDB['SharingRules'] = {
    'sharingCriteriaRules' : ['fullName'],
    'sharingGuestRules' : ['fullName'],
    'criteriaItems' : ['field'],
    'sharingOwnerRules' : ['fullName'],
    'sharingTerritoryRules' : ['fullName'],
    'criteriaBasedRules' : ['fullName'],
    'ownerRules' : ['fullName'],
    'rules' : ['fullName'],
    'membershipRules' : ['fullName']
};

LinkingDB['AccountSharingRules'] = {
    'sharingCriteriaRules' : ['fullName'],
    'criteriaItems' : ['field'],
    'sharingOwnerRules' : ['fullName'],
    'sharingTerritoryRules' : ['fullName'],
    'criteriaBasedRules' : ['fullName'],
    'ownerRules' : ['fullName'],
    'rules' : ['fullName'],
    'membershipRules' : ['fullName']
};

LinkingDB['SharingSet'] = {
    'accessMappings' : ['object','objectField','userField']
};


LinkingDB['StandardValueSet'] = {
    'standardValue' : ['fullName']
};

LinkingDB['StandardValueSetTranslation'] = {
    'valueTranslation' : ['masterLabel']
};


LinkingDB['SynonymDictionary'] = {
    'groups' : ['languages']
};


LinkingDB['Territory2'] = {
    'ruleAssociations' : ['ruleName'],
    'customFields' : ['name']
};

LinkingDB['Territory2Model'] = {
    'customFields' : ['name']
};

LinkingDB['Territory2Rule'] = {
    'ruleItems' : ['field']
};

LinkingDB['Territory2Type'] = {
    'value' : ['fullName']
};

LinkingDB['TransactionSecurityPolicy'] = {
    'notifications' : ['user']
};

LinkingDB['Translations'] = {
    'globalPicklists' : ['name'],
    'picklistValues' : ['masterLabel'],
    'label' : ['name'],
    'customLabels' : ['name'],
    'customApplications' : ['name'],
    'customTabs' : ['name'],
    'quickActions' : ['name']
};


LinkingDB['Workflow'] = {
    'alerts' : ['fullName'],
    'recipients' : ['field'],
    'fieldUpdates' : ['fullName'],
    'outboundMessages' : ['fullName'],
    'rules' : ['fullName'],
    'criteriaItems' : ['field'],
    'actions' : ['name','type'],
    'tasks' : ['fullName'],
    'flowActions' : ['label'],
    'knowledgePublishes' : ['label']
};

LinkingDB['OmniScript'] = {
    'omniProcessElements' : ['name'],
    'childElements' : ['name'],
};

LinkingDB['OmniIntegrationProcedure'] = {
    'omniProcessElements' : ['name']
};

LinkingDB['OmniDataTransform'] = {
    'omniDataTransformItem' : ['globalKey']
};

const ExcludeSort = new Object();
ExcludeSort['CustomObject'] = ['value'];
ExcludeSort['Layout'] = ['relatedLists','layoutItems','layoutSections'];
ExcludeSort['FlexiPage'] = ['componentInstanceProperties','componentInstance','flexiPageRegions','itemInstances','valueListItems'];
ExcludeSort['Flow'] = ['conditions'];
ExcludeSort['AssignmentRules'] = ['ruleEntry'];
ExcludeSort['CustomApplication'] = ['profileActionOverrides'];


//order is important. The first keys are more priority
const AdditionalKeys = {
    'FlexiPage': {'itemInstances': ['componentInstance.componentInstanceProperties','componentInstance.identifier']}
};

function createComponentsDB(){
    for (var component in LinkingDB){
        if (LinkingDB.hasOwnProperty(component)){
            var keys = LinkingDB[component];
            var keySet = {};
            for (var key in keys){
                if (keys.hasOwnProperty(key)){
                    var tags = keys[key];
                    for (var x = 0; x < tags.length; x++){
                        if (keySet[tags[x]] == undefined){
                            keySet[tags[x]] = true;
                        }
                    }
                }
            }
            LinkingDB[component].keySet = keySet;
        }
    }
}
createComponentsDB();


var DeepDiffMapper = function() {
    this.parserL, this.parserR;
    this.ignorews = false;
    this.VALUE_CREATED = 'created';
    this.VALUE_UPDATED = 'updated';
    this.VALUE_DELETED = 'deleted';
    this.VALUE_UNCHANGED = 'unchanged';
    this.VALUE = 'value';
    this.NOVALUE = 'NoValue';
    this.OBJECT = 'obj';
    this.upperLevelTag = '';
    this.componentDescriptor = '';/* not null, if  */
}

const deepDiffMapper = new DeepDiffMapper();


DeepDiffMapper.prototype.inDb = function (tag){
    this.upperLevelTag =   superKey;
};

DeepDiffMapper.prototype.getLinkingTags = function (tag){
    this.upperLevelTag =   superKey;
};

DeepDiffMapper.prototype.setType = function (superKey){
    this.upperLevelTag =   superKey;
    this.componentDescriptor = LinkingDB[superKey];
};

DeepDiffMapper.prototype.getSuperKey = function (obj){
    if (this.isObject(obj)){
        for (var key in obj){
            if (obj.hasOwnProperty(key) && key.indexOf('_') == -1){
                this.setType(key);
                return key;
            }
        }
    }
};

DeepDiffMapper.prototype.initCompare = function(){
    this.leftLines = [];
    this.rightLines = [];
    this.leftCounter = 0;
    this.rightCounter = 0;
    this.id = 0;
    this.parserL = null;
    this.parserR = null;
};

DeepDiffMapper.prototype.getBlock = function(left,leftCount,right,rightCount,ids,op){
    var block = {'lhs-line-from':left,
        'lhs-line-to':left + leftCount - 1,
        'rhs-line-from':right,
        'rhs-line-to':right + rightCount - 1,
        'ids': ids,
        'op':op};
    return block;
};
///////////////////// TRASH ////////////////////
// DeepDiffMapper.prototype.getBlock = function(left,right,op){
//     var block = {'lhs-line-from':left,
//         'lhs-line-to':left,
//         'rhs-line-from':right,
//         'rhs-line-to':right,
//         'op':op};
//     return block;
// };
///////////////////// TRASH ////////////////////

DeepDiffMapper.prototype.getChanges = function(){
    var blockLi = [];
    for (var n in this.changes){
        var block = this.changes[n];
        block['op'] = 'c';
        blockLi.push(block);
    }
    return blockLi;
};

DeepDiffMapper.prototype.getLines = function(side){
    if (side == 'left'){
        return this.leftLines;
    }else if (side == 'right'){
        return this.rightLines;
    }
};

/*   Main method   */
DeepDiffMapper.prototype.diff = function(parserL, parserR, ignorews) {
    var rootTag;
    this.parserL = parserL;
    this.parserR = parserR;
    this.ignorews = ignorews;
    var valid = this.parserL && this.parserR;
    if (this.parserL && this.parserL.json){
        rootTag = this.getSuperKey(this.parserL.json);
    }else if (this.parserR && this.parserR.json){
        rootTag = this.getSuperKey(this.parserR.json);
    }
    if (valid && rootTag){
        return this.map(rootTag, this.parserL.json[rootTag], this.parserR.json[rootTag], 0, this.parserL.rootNode, 0, this.parserR.rootNode);
    }
    return {};
};

/*   ref - object which contains obj1    */
DeepDiffMapper.prototype.map = function(masterKey, obj1, obj2, levelL, masterTagElemL, levelR, masterTagElemR, idx) {
    if (this.isFunction(obj1) || this.isFunction(obj2)) {
        return {};
    }

    if (this.isUndefined(obj1) && this.isUndefined(obj2)){/* both  null, usefull if comparing tags like     <fox/> <-> <fox/> */
        var delta = {compare:this.VALUE_UNCHANGED, key:masterKey, val:"", newVal:"", type:this.VALUE};
        return delta;
    }
    if (!this.isUndefined(obj1) && !this.isUndefined(obj2)){/* both non null */
        if (this.isValue(obj1) && this.isValue(obj2)){/* both are values */
            var DiffType = this.compareValues(obj1, obj2);
            var delta = {compare:DiffType, key:masterKey, val:obj1, newVal:obj2, idx:idx, type:this.VALUE};
            return delta;
        }else if (this.isObject(obj1) && this.isObject(obj2)){ /* objects */
            var keySet = (this.componentDescriptor && this.componentDescriptor[masterKey])? this.componentDescriptor[masterKey]:[];
            var key1, key2;
            if (this.upperLevelTag=='Profile' && masterKey=='layoutAssignments' ){
                let layoutAssignmentsKeySet = [];
                if (obj1.hasOwnProperty('recordType') && obj2.hasOwnProperty('recordType') ){
                    layoutAssignmentsKeySet.push('recordType');
                } else {
                    layoutAssignmentsKeySet.push('layout');
                }
                key1 = this.getCompositeKey(layoutAssignmentsKeySet,obj1);
                key2 = this.getCompositeKey(layoutAssignmentsKeySet,obj2);
            } else {
                key1 = this.getCompositeKey(keySet,obj1);
                key2 = this.getCompositeKey(keySet,obj2);
            }
            if (this.upperLevelTag=='Flow' && masterKey=='formulas' && (
                (key1.lastIndexOf('_')!=-1 && key1.substring(key1.lastIndexOf('_')+1).length==10 && !isNaN(key1.substring(key1.lastIndexOf('_')+1))) ||
                (key2.lastIndexOf('_')!=-1 && key2.substring(key2.lastIndexOf('_')+1).length==10 && !isNaN(key2.substring(key2.lastIndexOf('_')+1)))))
            {
                key1 = key1.substring(0,key1.lastIndexOf('_'));
                key2 = key2.substring(0,key2.lastIndexOf('_'));
            }

            var diff = {};
            /* if composed keys are equal, compare obj */
            var semiSortedLiL = [];
            var semiSortedLiR = [];
            var keySetObj1 = {};
            var keySetObj2 = {};
            var counter;
            if (key1 === key2){
                counter = 0;
                for (var key in obj1){
                    if (obj1.hasOwnProperty(key)){
                        if (obj2[key] != undefined){
                            /* equal or updated */
                            semiSortedLiL.push({ref: key, ref1:counter, op: 'e'});
                            keySetObj1[key] = counter;
                        }else{
                            semiSortedLiL.push({ref: key, op: 'c'});
                        }
                        counter++;
                    }
                }
                counter = 0;
                for (var key in obj2){
                    if (obj2.hasOwnProperty(key)){
                        if (obj1[key] != undefined){
                            /* equal or updated */
                            semiSortedLiR.push({ref: key, ref2:counter,  op: 'e'});
                            keySetObj2[key] = counter;
                        }else{
                            /* only deleted */
                            semiSortedLiR.push({ref: key, op: 'd'});
                        }
                        counter++;
                    }
                }
                for (var x = 0; x < semiSortedLiL.length; x++){
                    var el = semiSortedLiL[x];
                    if (el.op == 'e'){
                        el.ref2 = keySetObj2[el.ref];
                    }
                }
                for (var x = 0; x < semiSortedLiR.length; x++){
                    var el = semiSortedLiR[x];
                    if (el.op == 'e'){
                        el.ref1 = keySetObj1[el.ref];
                    }
                }

                var mergedLi = this.mergeCompareArrays(semiSortedLiL,semiSortedLiR);

                for (var x = 0; x < mergedLi.length; x++){
                    var cmd = mergedLi[x];
                    var value = null;
                    var key = cmd.ref;
                    if (cmd.op == 'e'){
                        value = this.processECase(key, obj1[key], obj2[key], levelL, masterTagElemL, levelR, masterTagElemR, false);
                    }else if (cmd.op == 'c'){
                        value = this.processCCase(key, obj1[key], levelL, masterTagElemL, levelR, masterTagElemR, false);
                    }else if (cmd.op == 'd'){
                        value = this.processDCase(key, obj2[key], levelL, masterTagElemL, levelR, masterTagElemR, false);
                    }
                    if (value && value != null){
                        diff[key] = value;
                    }
                }
                return diff;
            }else{/* rare case when xml are very different in their structure */
                /* add all obj1 as new, and obj2 as deleted*/
                var mockArray = [];
                var value = null;
                value = this.processCCase(masterKey, obj1, levelL, masterTagElemL, levelR, masterTagElemR, false);
                mockArray.push(value);
                value = this.processDCase(masterKey, obj2, levelL, masterTagElemL, levelR, masterTagElemR, false);
                mockArray.push(value);
                return mockArray;
            }
        }else{
            return this.processECase(masterKey, obj1, obj2, levelL, masterTagElemL, levelR, masterTagElemR, false);
        }


    }else if (this.isUndefined(obj1)){
        return this.processDCase(masterKey, obj2, levelL, masterTagElemL, levelR, masterTagElemR, idx);
    }else if (this.isUndefined(obj2)){// NB: updated logic for array case
        return this.processCCase(masterKey, obj1, levelL, masterTagElemL, levelR, masterTagElemR, idx);
    }
};

/*	flag processed means that the key=masterKey already has been added		*/
DeepDiffMapper.prototype.processECase = function(masterKey, obj1, obj2, levelL, masterTagElemL, levelR, masterTagElemR, processed){
    if (obj1==='' && this.isObject(obj2)){
        obj1 = {};
    }
    if (obj2==='' && this.isObject(obj1)){
        obj2 = {};
    }
    if (this.isArray(obj1) && this.isArray(obj2)){
        /* 2 arrays */
        return this.processArrays(masterKey, obj1, obj2, levelL, masterTagElemL, levelR, masterTagElemR);
    }else if (this.isObject(obj1) && this.isArray(obj2)){
        /* obj1 is object - obj2 is array, create array and add  */
        var mockArray1 = [];
        mockArray1.push(obj1);
        return this.processArrays(masterKey, mockArray1, obj2, levelL, masterTagElemL, levelR, masterTagElemR);
    }else if (this.isArray(obj1) && this.isObject(obj2)){
        /* obj1 is  array - obj2 is object */
        var array2 = [];
        array2.push(obj2);
        return this.processArrays(masterKey, obj1, array2, levelL, masterTagElemL, levelR, masterTagElemR);
    }else if (this.isValue(obj1) && this.isArray(obj2)){
        /* obj1 is value - obj2 is array, create array and add a value to it */
        var array1 = [];
        array1.push(obj1);
        return this.processGeneralArrays(masterKey, array1, obj2, levelL, masterTagElemL, levelR, masterTagElemR);
    }else if (this.isArray(obj1) && this.isValue(obj2)){
        /* obj1 is  array (of values) - obj2 is value */
        var array2 = [];
        array2.push(obj2);
        return this.processGeneralArrays(masterKey, obj1, array2, levelL, masterTagElemL, levelR, masterTagElemR);
    }else if (this.isObject(obj1) && this.isValue(obj2)){
        /* obj1 is  object (of values) - obj2 is value */
        //console.log('object<-->value');
        var array1 = [];
        array1.push(obj1);
        var array2 = [];
        array2.push(obj2);
        return this.processGeneralArrays(masterKey, array1, array2, levelL, masterTagElemL, levelR, masterTagElemR);
        //return this.processArrays(masterKey, array1, array2, levelL, masterTagElemL, levelR, masterTagElemR);

    }else if (this.isValue(obj1) && this.isObject(obj2)){
        /* obj1 is value  - obj2 is object (of values) */
        //console.log('value<-->object');
        var array1 = [];
        array1.push(obj1);
        var array2 = [];
        array2.push(obj2);
        return this.processGeneralArrays(masterKey, array1, array2, levelL, masterTagElemL, levelR, masterTagElemR);
        //return this.processArrays(masterKey, array1, array2, levelL, masterTagElemL, levelR, masterTagElemR);

    }else{
        var elem1 = this.parserL.addTagElem(masterKey, levelL, masterTagElemL, obj1);
        var elem2 = this.parserR.addTagElem(masterKey, levelR, masterTagElemR, obj2);
        var e = this.map(masterKey, obj1, obj2, levelL+1, elem1, levelR+1, elem2, true);
        elem1.op = e.compare;
        elem2.op = e.compare;
        if (e.compare && e.compare != 'unchanged'){
            elem1.id = this.id;
            elem2.id = this.id;
            e.id = this.id;
            this.id++;
        }
        return e;
    }
};

DeepDiffMapper.prototype.processCCase = function(masterKey, obj1, levelL, masterTagElemL, levelR, masterTagElemR, processed){
    if (this.isArray(obj1)){// add the elems of array as the whole things
        var arr = [];
        for (var x = 0; x < obj1.length; x++){
            var e = null;
            var arrElem = this.parserL.addTagElem(masterKey, levelL, masterTagElemL, obj1[x]);
            var eElem =   this.parserR.addEmptyTagElem(masterKey, levelR, masterTagElemR);
            e = this.map(masterKey,  obj1[x], undefined, levelL+1, arrElem, levelR+1, masterTagElemR, true);
            arr.push(e);
            arrElem.op = e.compare;
            eElem.op = e.compare;
            if (e.compare && e.compare != 'unchanged'){
                arrElem.id = this.id;
                e.id = this.id;
                this.id++;
            }
        }
        return arr;
    }else if (this.isObject(obj1)){
        var levelDiff = 0;
        if (processed == false){
            this.parserL.addTagElem(masterKey, levelL, masterTagElemL, obj1);
            this.parserR.addEmptyTagElem(masterKey, levelR, masterTagElemR);
            levelDiff = 1;
        }
        var diff = {};
        for (var key in obj1){
            var e = null;
            if (this.isArray(obj1[key])){
                e = this.map(key, obj1[key], undefined, levelL, masterTagElemL, levelR, masterTagElemR,true);
            }else{
                var elem1 = this.parserL.addTagElem(key, levelL+levelDiff, masterTagElemL, obj1[key]);
                var eElem = this.parserR.addEmptyTagElem(key, levelR+levelDiff, masterTagElemR);
                e = this.map(key, obj1[key], undefined, levelL+1+levelDiff, elem1, levelR+1+levelDiff, masterTagElemR,true);
                elem1.op = e.compare;
                eElem.op = e.compare;
                if (e.compare && e.compare != 'unchanged'){
                    elem1.id = this.id;
                    e.id = this.id;
                    this.id++;
                }
            }
            if (e && e != null){
                diff[key] = e;
            }
        }
        return diff;
    }else{
        var e = null;
        e = {compare:this.VALUE_CREATED, key:masterKey, val:obj1, type:this.VALUE};
        if (processed == false){
            var elem1 = this.parserL.addTagElem(masterKey, levelL, masterTagElemL, obj1);
            this.parserR.addEmptyTagElem(masterKey, levelR, masterTagElemR);
            elem1.id = this.id;
        }
        e.id = this.id;
        this.id++;
        return e;
    }
};

DeepDiffMapper.prototype.processDCase = function(masterKey, obj2, levelL, masterTagElemL, levelR, masterTagElemR, processed){
    if (this.isArray(obj2)){
        var arr = [];
        for (var x = 0; x < obj2.length; x++){
            var eElem =   this.parserL.addEmptyTagElem(masterKey, levelL, masterTagElemL);
            var arrElem = this.parserR.addTagElem(masterKey, levelR, masterTagElemR, obj2[x]);
            var e = this.map(masterKey, undefined, obj2[x], levelL+1, masterTagElemL, levelR+1, arrElem, true);
            arr.push(e);
            arrElem.op = e.compare;
            eElem.op = e.compare;
            if (e.compare && e.compare != 'unchanged'){
                arrElem.id = this.id;
                e.id = this.id;
                this.id++;
            }
        }
        return arr;
    }else if (this.isObject(obj2)){
        var levelDiff = 0;
        if (processed == false){
            this.parserL.addEmptyTagElem(masterKey, levelL, masterTagElemL);
            this.parserR.addTagElem(masterKey, levelR, masterTagElemR, obj2);
            levelDiff = 1;
        }
        var diff = {};
        for (var key in obj2){
            var e = null;
            if (this.isArray(obj2[key])){
                e = this.map(key, undefined, obj2[key], levelL, masterTagElemL, levelR, elem2, true);
            }else{
                var eElem = this.parserL.addEmptyTagElem(key, levelL+levelDiff, masterTagElemL);
                var elem2 = this.parserR.addTagElem(key, levelR+levelDiff, masterTagElemR, obj2[key]);
                e = this.map(key, undefined, obj2[key], levelL+1+levelDiff, masterTagElemL, levelR+1+levelDiff, elem2, true);
                elem2.op = e.compare;
                eElem.op = e.compare;
                if (e.compare && e.compare != 'unchanged'){
                    elem2.id = this.id;
                    e.id = this.id;
                    this.id++;
                }
            }
            if (e && e != null){
                diff[key] = e;
            }
        }
        return diff;
    }else{
        /* add the ref to obj1's master level the key has been deleted from */
        var e = {compare:this.VALUE_DELETED, key:masterKey, newVal:obj2, type:this.VALUE};// NB added idx
        if (processed == false){
            this.parserL.addEmptyTagElem(masterKey, levelL, masterTagElemL);
            var elem2 = this.parserR.addTagElem(masterKey, levelR, masterTagElemR, obj2);
            elem2.id = this.id;
        }
        e.id = this.id;
        this.id++;
        return e;
    }
};

/**

 arr1:					arr2:
 [
 {"ref1":0,"ref2":1,"op":"e"},		{"ref1":1,"ref2":0,"op":"e"},
 {"ref1":1,"ref2":0,"op":"e"}		{"ref1":0,"ref2":1,"op":"e"}
 ]

 [{"ref1":0,"ref2":2,"op":"e"},		[{"ref1":3,"ref2":0,"op":"e"}
 {"ref1":1,"ref2":1,"op":"e"},		,{"ref1":1,"ref2":1,"op":"e"}
 {"ref1":2,"ref2":3,"op":"e"},		,{"ref1":0,"ref2":2,"op":"e"}
 {"ref1":3,"ref2":0,"op":"e"}]		,{"ref1":2,"ref2":3,"op":"e"}

 */
DeepDiffMapper.prototype.mergeCompareArrays = function(arr1,arr2){
    var merged = [];
    var mergedSet1 = {};
    var mergedSet2 = {};
    if (arr1 != undefined && arr2 != undefined){
        var x = 0;
        var y = 0;
        while ((x < arr1.length) || (y < arr2.length)){
            if (x < arr1.length){
                var el = arr1[x];
                if (el.op == 'c'){
                    merged.push(el);
                }else if (el.op == 'e' || el.op == 'u'){
                    if (el.ref2 != undefined){
                        for( var t = y; t < el.ref2+1; t++){
                            var el2 = arr2[t];
                            if (el2 && mergedSet2[t] == undefined){
                                merged.push(el2);
                                mergedSet2[t] = true;
                                if (el2.op == 'e' || el2.op == 'u'){
                                    mergedSet1[el2.ref1] = true;
                                }
                            }
                        }
                        y = el.ref2+1;
                    }
                }
                x++;
            }
            if (y < arr2.length){
                var el = arr2[y];
                if (el.op == 'd'){
                    merged.push(el);
                }else if (el.op == 'e' || el.op == 'u'){
                    if (el.ref1 != undefined && x<=el.ref1){
                        for( var t = x; t < el.ref1+1; t++){
                            var el1 = arr1[t];
                            if (el1 && mergedSet1[t] == undefined){
                                merged.push(el1);
                                mergedSet1[t] = true;
                                if (el1.op == 'e' || el1.op == 'u'){
                                    mergedSet2[el1.ref2] = true;
                                }
                            }
                        }
                        x = el.ref1+1;
                    }
                }
                y++;
            }
        }
    }
    
    return merged.filter((el, ind) => ind === merged.indexOf(el));
};

DeepDiffMapper.prototype.updateCounters = function(obj1,obj2){
    if (obj1 != undefined && !this.isArray(obj1)) this.leftCounter++;
    if (obj2 != undefined && !this.isArray(obj2)) this.rightCounter++;
};


DeepDiffMapper.prototype.compareValues = function(value1, value2) {

    if (this.ignorews)
    {
        value1 = value1.replace(/\s+/g, '');
        value2 = value2.replace(/\s+/g, '');
    }
    if (value1 === value2) {
        return this.VALUE_UNCHANGED;
    }
    if ('undefined' == typeof(value1) && 'undefined' == typeof(value2)) {
        return this.VALUE_UNCHANGED;
    }
    if ('undefined' == typeof(value1)) {
        return this.VALUE_CREATED;
    }
    if ('undefined' == typeof(value2)) {
        return this.VALUE_DELETED;
    }
    return this.VALUE_UPDATED;
};

DeepDiffMapper.prototype.getKeys = function(obj) {/* returns list of keys from obj */
    var list = [];
    if (this.isValue(obj)) return list;
    for (var key in obj){
        if (obj.hasOwnProperty(key)){
            list.push(key);
        }
    }
    return list;
};

DeepDiffMapper.prototype.processArrays = function (arrayKey, obj1, obj2, levelL, masterTagElemL, levelR, masterTagElemR)  {

    if (this.componentDescriptor && this.componentDescriptor[arrayKey]){
        return this.processSFArrays(arrayKey, obj1, obj2, levelL, masterTagElemL, levelR, masterTagElemR);
    }else{
        return this.processGeneralArrays(arrayKey, obj1, obj2, levelL, masterTagElemL, levelR, masterTagElemR);
    }
};


DeepDiffMapper.prototype.getCompositeKey = function (keySet, obj1, isStringNotRequired = false)  {
    var key = '.';
    const getKey = (obj,array) => {
        const value = obj[array.shift()];
        if (value) {
            return array.length ? getKey(value, array) : value;
        } else {
            return undefined;
        }
    };
    for (var x = 0; x < keySet.length; x++){
        partStr = getKey(obj1, keySet[x].split('.'));
        if (partStr !== undefined && (typeof partStr === 'string' || isStringNotRequired)){
            if (typeof partStr !== 'string') {
                partStr = JSON.stringify(partStr);
            }
            if (this.ignorews)
            {
                key += '.' + partStr.toLowerCase().replace(/\s+/g, '');
            } else {
                key += '.' + partStr.toLowerCase();
            }
        }
    }

    return key;
};


DeepDiffMapper.prototype.processSFArrays = function (arrayKey, obj1, obj2, levelL, masterTagElemL, levelR, masterTagElemR)  {
    var keySet = (this.componentDescriptor && this.componentDescriptor[arrayKey])? this.componentDescriptor[arrayKey]:[];
    /* detect equal by composeKey from keySet from componentDescriptor */
    var keyMap1 =  [];
    var keyMap2 =  [];
    for (var x = 0; x < obj1.length; x++){
        var key1;
        if (this.upperLevelTag=='Profile' && arrayKey=='layoutAssignments' ){
            let layoutAssignmentsKeySet = [];
            if (obj1[x].hasOwnProperty('recordType')){
                layoutAssignmentsKeySet.push('recordType');
            } else {
                layoutAssignmentsKeySet.push('layout');
            }
            key1 = this.getCompositeKey(layoutAssignmentsKeySet,obj1[x]);
        } else {
            key1 = this.getCompositeKey(keySet,obj1[x]);
        }
        if (this.upperLevelTag=='Flow' && arrayKey=='formulas' && key1.lastIndexOf('_')!=-1 && key1.substring(key1.lastIndexOf('_')+1).length==10 && !isNaN(key1.substring(key1.lastIndexOf('_')+1))){
            key1 = key1.substring(0,key1.lastIndexOf('_'));
        }
        keyMap1.push(key1);
    }
    /*	this map contains only the 1st occurrence of the unique key */
    var uniqueMapforObj2 = {};
    for (var y = 0; y < obj2.length; y++){
        var key;
        if (this.upperLevelTag=='Profile' && arrayKey=='layoutAssignments' ){
            let layoutAssignmentsKeySet = [];
            if (obj2[y].hasOwnProperty('recordType')){
                layoutAssignmentsKeySet.push('recordType');
            } else {
                layoutAssignmentsKeySet.push('layout');
            }
            key = this.getCompositeKey(layoutAssignmentsKeySet,obj2[y]);
        } else {
            key = this.getCompositeKey(keySet,obj2[y]);
        }
        if (this.upperLevelTag=='Flow' && arrayKey=='formulas' && key.lastIndexOf('_')!=-1 && key.substring(key.lastIndexOf('_')+1).length==10 && !isNaN(key.substring(key.lastIndexOf('_')+1))){
            key = key.substring(0,key.lastIndexOf('_'));
        }
        keyMap2.push(key);
        if (uniqueMapforObj2[key] == undefined){
            uniqueMapforObj2[key] = [];
        }
        uniqueMapforObj2[key].push(y);
    }

    var retArr = [];
    var equalMap1 = {};
    var equalMap2 = {};
    for (var x = 0; x < obj1.length; x++){
        var equals = uniqueMapforObj2[keyMap1[x]];
        if (equals != undefined && equals.length > 0){
            var y = equals.shift();
            equalMap1[x] = y;
            equalMap2[y] = x;
        }
    }

    var semiSortedLiL = [];
    var semiSortedLiR = [];

    /*Ignoring sorting for Case 5086 */
    if (ExcludeSort[this.upperLevelTag]!=undefined && ExcludeSort[this.upperLevelTag].includes(arrayKey)){
        if (AdditionalKeys[this.upperLevelTag]?.[arrayKey]) {
            this.generateUniqueKeys(keyMap1, keyMap2, obj1, obj2, arrayKey, keySet);
        }

        const comparingListObject = this.doSmartComparison(keyMap1, keyMap2);
        comparingListObject.leftCompareList.forEach((item) => {
            if (item.isExist) {
                semiSortedLiL.push({ref1: item.index, ref2: item.targetIndex, op: 'e'});
            } else {
                semiSortedLiL.push({ref1: item.index, op: 'c'});
            }
        });

        comparingListObject.rightCompareList.forEach((item) => {
            if (item.isExist) {
                semiSortedLiR.push({ref1: item.targetIndex, ref2: item.index, op: 'e'});
            } else {
                semiSortedLiR.push({ref2: item.index, op: 'd'});
            }
        });
///////////////////// TRASH for case 6081 ////////////////////
//         for (var x = 0; x < obj1.length; x++){/* iterate over all elem in array in the same order as they are put into array */
//             if (x == equalMap1[x] ){
//                 semiSortedLiL.push({ref1: x, ref2: equalMap1[x], op: 'e'});
//             }else {/*created */
//                 semiSortedLiL.push({ref1: x, op: 'c'});
//             }
//         }
//         /* all the rest (unprocessed) in 2nd obj - mark as deleted */
//         for (var x = 0; x < obj2.length; x++){
//             if (x == equalMap2[x]){
//                 /* equal or updated */
//                 semiSortedLiR.push({ref1: equalMap2[x], ref2: x, op: 'e'});
//             }else{/* only deleted */
//                 semiSortedLiR.push({ref2: x, op: 'd'});
//             }
//         }
///////////////////// TRASH for case 6081 ////////////////////
    } else {
        for (var x = 0; x < obj1.length; x++){/* iterate over all elem in array in the same order as they are put into array */
            if (equalMap1[x] != undefined){
                semiSortedLiL.push({ref1: x, ref2: equalMap1[x], op: 'e'});
            }else {/*created */
                semiSortedLiL.push({ref1: x, op: 'c'});
            }
        }
        /* all the rest (unprocessed) in 2nd obj - mark as deleted */
        for (var x = 0; x < obj2.length; x++){
            if (equalMap2[x] != undefined){
                /* equal or updated */
                semiSortedLiR.push({ref1: equalMap2[x], ref2: x, op: 'e'});
            }else{/* only deleted */
                semiSortedLiR.push({ref2: x, op: 'd'});
            }
        }
    }


    var mergedLi = this.mergeCompareArrays(semiSortedLiL,semiSortedLiR);
    for (var x = 0; x < mergedLi.length; x++){
        var cmd = mergedLi[x];
        var e = null;
        if (cmd.op == 'e'){
            var elem1 = this.parserL.addTagElem(arrayKey, levelL, masterTagElemL, obj1[cmd.ref1]);
            var elem2 = this.parserR.addTagElem(arrayKey, levelR, masterTagElemR, obj2[cmd.ref2]);
            e = this.map(arrayKey, obj1[cmd.ref1], obj2[cmd.ref2], levelL+1, elem1, levelR+1, elem2, true);
            elem1.op = e.compare;
            elem2.op = e.compare;
            if (e.compare && e.compare != 'unchanged'){
                elem1.id = this.id;
                elem2.id = this.id;
                e.id = this.id;
                this.id++;
            }
        }else if (cmd.op == 'c'){
            var elem1 = this.parserL.addTagElem(arrayKey, levelL, masterTagElemL, obj1[cmd.ref1]);
            var eElem = this.parserR.addEmptyTagElem(arrayKey, levelR, masterTagElemR);
            e = this.map(arrayKey, obj1[cmd.ref1], undefined, levelL+1, elem1, levelR+1, masterTagElemR, true);
            elem1.op = e.compare;
            eElem.op = e.compare;
            if (e.compare && e.compare != 'unchanged'){
                elem1.id = this.id;
                e.id = this.id;
                this.id++;
            }
        }else if (cmd.op == 'd'){
            var eElem = this.parserL.addEmptyTagElem(arrayKey, levelL, masterTagElemL);
            var elem2 = this.parserR.addTagElem(arrayKey, levelR, masterTagElemR, obj2[cmd.ref2]);
            e = this.map(arrayKey, undefined, obj2[cmd.ref2], levelL+1, masterTagElemL, levelR+1, elem2, true)
            eElem.op = e.compare;
            elem2.op = e.compare;
            if (e.compare && e.compare != 'unchanged'){
                elem2.id = this.id;
                e.id = this.id;
                this.id++;
            }
        }
        if (e && e != null){
            retArr.push(e);
        }
    }
    if (retArr.length > 0){
        return retArr;
    }
    return;
};


DeepDiffMapper.prototype.processGeneralArrays = function (arrayKey, obj1, obj2, levelL, masterTagElemL, levelR, masterTagElemR)   {
    /* used if LinkingDB does not contain the needed key */
    /* first, define pairs equal (by json) elems */

    var jsonMap1 =  [];
    var jsonMap2 =  [];
    for (var x = 0; x < obj1.length; x++){
        jsonMap1.push(JSON.stringify(obj1[x]));
    }
    /*	this map contains only the 1st occurrence of the unique key */
    var uniqueMapforObj2 = {};
    for (var y = 0; y < obj2.length; y++){
        var key = JSON.stringify(obj2[y]);
        jsonMap2.push(key);
        if (uniqueMapforObj2[key] == undefined){
            uniqueMapforObj2[key] = [];
        }
        uniqueMapforObj2[key].push(y);
    }

    var retArr = [];
    var equalMap1 = {};
    var equalMap2 = {};
    for (var x = 0; x < obj1.length; x++){
        var equals = uniqueMapforObj2[jsonMap1[x]];
        if (equals != undefined && equals.length > 0){
            var y = equals.shift();
            equalMap1[x] = y;
            equalMap2[y] = x;
        }
    }

    /* second, for each from the rest elem  create a signature as arrayMap[index]=[list of keys] */
    var arrayMap1 = {};
    var arrayMap2 = {};
    for (var x = 0; x < obj1.length; x++){
        if (equalMap1[x] == undefined){
            arrayMap1[x] = this.getKeys(obj1[x]);
        }
    }
    for (var x = 0; x < obj2.length; x++){
        if (equalMap2[x] == undefined){
            arrayMap2[x] = this.getKeys(obj2[x]);
        }
    }
    /* third, calc cost for each index and update linkMap  */
    var updateMap1 = {};
    var updateMap2 = {};
    for (var x in arrayMap1){
        if (arrayMap1.hasOwnProperty(x)){
            var minShared = 0;
            var index = 0;
            for (var y in arrayMap2){
                if (arrayMap2.hasOwnProperty(y)){
                    if (updateMap2[y] == undefined){/* only for those that not in map */
                        var shared = this.cost(arrayMap1[x],arrayMap2[y],obj1[x],obj2[y],arrayKey);/* compare 2 arrays of keys */
                        if (shared > minShared){/* look for link with max shared elems */
                            index = y;
                            minShared = shared;
                        }
                    }
                }
            }
            if (minShared > 0){/* do not update map if no shared keys */
                updateMap1[x] = index;
                updateMap2[index] = x;
            }
        }
    }
    var semiSortedLiL = [];
    var semiSortedLiR = [];


    /*Ignoring sorting for Case 5086 */
    if (ExcludeSort[this.upperLevelTag]!=undefined && ExcludeSort[this.upperLevelTag].includes(arrayKey)){

        for (var x = 0; x < obj1.length; x++){/* iterate over all elem in array in the same order as they are put into array */
            if (x ==equalMap1[x]){
                semiSortedLiL.push({ref1: x, ref2: equalMap1[x], op: 'e'});
            }else if (x == updateMap1[x]){
                semiSortedLiL.push({ref1: x, ref2: parseInt(updateMap1[x], 10), op: 'u'});
            }else {/*created */
                semiSortedLiL.push({ref1: x, op: 'c'});
            }
        }
        /* all the rest (unprocessed) in 2nd obj - mark as deleted */
        for (var x = 0; x < obj2.length; x++){
            if (x== equalMap2[x]){
                semiSortedLiR.push({ref1: equalMap2[x], ref2: x, op: 'e'});
            }else if (x == updateMap2[x] ){
                semiSortedLiR.push({ref1: parseInt(updateMap2[x], 10), ref2: x, op: 'u'});
            }else {/*created */
                semiSortedLiR.push({ref2: x, op: 'd'});
            }
        }
    } else {
        for (var x = 0; x < obj1.length; x++){/* iterate over all elem in array in the same order as they are put into array */
            if (equalMap1[x] != undefined){
                semiSortedLiL.push({ref1: x, ref2: equalMap1[x], op: 'e'});
            }else if (updateMap1[x] != undefined){
                semiSortedLiL.push({ref1: x, ref2: parseInt(updateMap1[x], 10), op: 'u'});
            }else {/*created */
                semiSortedLiL.push({ref1: x, op: 'c'});
            }
        }
        /* all the rest (unprocessed) in 2nd obj - mark as deleted */
        for (var x = 0; x < obj2.length; x++){
            if (equalMap2[x] != undefined){
                semiSortedLiR.push({ref1: equalMap2[x], ref2: x, op: 'e'});
            }else if (updateMap2[x] != undefined){
                semiSortedLiR.push({ref1: parseInt(updateMap2[x], 10), ref2: x, op: 'u'});
            }else {/*created */
                semiSortedLiR.push({ref2: x, op: 'd'});
            }
        }
    }

    var mergedLi = this.mergeCompareArrays(semiSortedLiL,semiSortedLiR);
    for (var x = 0; x < mergedLi.length; x++){
        var cmd = mergedLi[x];
        var e = null;
        if (cmd.op == 'e' || cmd.op == 'u'){
            var elem1 = this.parserL.addTagElem(arrayKey, levelL, masterTagElemL, obj1[cmd.ref1]);
            var elem2 = this.parserR.addTagElem(arrayKey, levelR, masterTagElemR, obj2[cmd.ref2]);
            e = this.map(arrayKey, obj1[cmd.ref1], obj2[cmd.ref2], levelL+1, elem1, levelR+1, elem2, true);
            elem1.op = e.compare;
            elem2.op = e.compare;
            if (e.compare && e.compare != 'unchanged'){
                elem1.id = this.id;
                elem2.id = this.id;
                e.id = this.id;
                this.id++;
            }
        }else if (cmd.op == 'c'){
            var elem1 = this.parserL.addTagElem(arrayKey, levelL, masterTagElemL, obj1[cmd.ref1]);
            var eElem = this.parserR.addEmptyTagElem(arrayKey, levelR, masterTagElemR);
            e = this.map(arrayKey, obj1[cmd.ref1], undefined, levelL+1, elem1, levelR+1, masterTagElemR, true);
            elem1.op = e.compare;
            eElem.op = e.compare;
            if (e.compare && e.compare != 'unchanged'){
                elem1.id = this.id;
                e.id = this.id;
                this.id++;
            }
        }else if (cmd.op == 'd'){
            var eElem = this.parserL.addEmptyTagElem(arrayKey, levelL, masterTagElemL);
            var elem2 = this.parserR.addTagElem(arrayKey, levelR, masterTagElemR, obj2[cmd.ref2]);
            e = this.map(arrayKey, undefined, obj2[cmd.ref2], levelL+1, masterTagElemL, levelR+1, elem2, true);
            eElem.op = e.compare;
            elem2.op = e.compare;
            if (e.compare && e.compare != 'unchanged'){
                elem2.id = this.id;
                e.id = this.id;
                this.id++;
            }
        }
        if (e && e != null){
            retArr.push(e);
        }
    }

    if (retArr.length > 0){
        return retArr;
    }
    return;
};

// Created for case 6081
DeepDiffMapper.prototype.generateUniqueKeys = function (leftKeyArray, rightKeyArray, obj1, obj2, arrayKey, mainKeys) {
    const additionalKeys = AdditionalKeys[this.upperLevelTag][arrayKey];

    const keyArraysObject = {
        keyArrays: [],
        rightChangedIndexesList: [],
        leftChangedIndexesList: [],
    };

    const fillKeyArray = (obj, newKeyArray, keySet) => {
        obj.forEach((item) => {
            key1 = this.getCompositeKey(keySet, item, true);
            newKeyArray.push(key1);
        });
    };

    const formNewKeyArrays = (keySet) => {
        const leftKeyArray = [];
        const rightKeyArray = [];

        fillKeyArray(obj1, leftKeyArray, keySet);
        fillKeyArray(obj2, rightKeyArray, keySet);

        keyArraysObject.keyArrays.push({leftKeyArray, rightKeyArray});
    }

    formNewKeyArrays([...mainKeys, ...additionalKeys]);

    additionalKeys.forEach((key) => {
        formNewKeyArrays([...mainKeys, key]);
    });

    keyArraysObject.keyArrays.forEach((objectArrays) => {
        let { leftKeyArray: newLeftKeyArray, rightKeyArray: newRightKeyArray } = objectArrays;

        newLeftKeyArray = newLeftKeyArray.map((item, index) => ({value: item, index}))
            .filter((item) => !keyArraysObject.leftChangedIndexesList.includes(item.index));
        newRightKeyArray = newRightKeyArray.map((item, index) => ({value: item, index}))
            .filter((item) => !keyArraysObject.rightChangedIndexesList.includes(item.index));

        const changingUniqueKey = (newKeyArray, oppositeNewKeyArray, originalKeyArray, changedIndexesList) => {
            newKeyArray.forEach((item) => {
                const { index } = item;
                const oppositeKey = oppositeNewKeyArray.find((oppositeItem) => oppositeItem.value === item.value);
                const isExist = !!oppositeKey;
                if (isExist && originalKeyArray[index] !== item.value && item.value?.length && !changedIndexesList.includes(index)) {
                    originalKeyArray[index] = item.value;
                    changedIndexesList.push(index);
                }
            });
        };

        changingUniqueKey(newLeftKeyArray, newRightKeyArray, leftKeyArray, keyArraysObject.leftChangedIndexesList);
        changingUniqueKey(newRightKeyArray, newLeftKeyArray, rightKeyArray, keyArraysObject.rightChangedIndexesList);
    });
}

DeepDiffMapper.prototype.doSmartComparison = function (leftKeyArray, rightKeyArray) {
    const leftObject = new Comparison(leftKeyArray);
    const rightObject = new Comparison(rightKeyArray);
    leftObject.init(rightKeyArray);
    rightObject.init(leftKeyArray);

    while (leftObject.item && rightObject.item) {
        //If the elements are not equal then we decide which components will be marked as non-existent
        if (leftObject.item.value !== rightObject.item.value) {
            //count the difference of the indices and choose the option in which we mark as few elements as possible as non-existent
            const leftDiffIndex = leftObject.compareList.slice(leftObject.item.index, rightObject.item.targetIndex).filter((item) => item.isExist).length;
            const rightDiffIndex = rightObject.compareList.slice(rightObject.item.index, leftObject.item.targetIndex).filter((item) => item.isExist).length;

            if (leftDiffIndex < rightDiffIndex) {
                changingComponents(leftObject, rightObject);
            } else {
                changingComponents(rightObject, leftObject);
            }

            function changingComponents(object, oppositeObject) {
                const nextSameItemIndex = object.keyArray.indexOf(object.item.value, oppositeObject.item.targetIndex + 1);
                if (nextSameItemIndex != -1) {
                    reassignItems(object.item.targetIndex,nextSameItemIndex,object.groupMap.get(object.item.value), oppositeObject.groupMap.get(object.item.value));
                    object.item.targetIndex = -1;
                }
                const itemsForChangeExistList = object.compareList.slice(object.item.index, oppositeObject.item.targetIndex);
                markingComponentsAsNotExist(itemsForChangeExistList, oppositeObject.compareList);
                object.setNextItem();
            }

            function reassignItems(oppositeIndex, nextSameItemIndex, duplicateArray, oppositeDuplicateArray) {
                const sliceIndex = duplicateArray.findIndex((item) => item.index === nextSameItemIndex);
                const oppositeSliceIndex = oppositeDuplicateArray.findIndex((item) => item.index === oppositeIndex);
                const sliceDuplicateArray = duplicateArray.slice(sliceIndex);
                const oppositeSliceDuplicateArray = oppositeDuplicateArray.slice(oppositeSliceIndex);
                sliceDuplicateArray.forEach((item, index) => {
                    const oppositeItem = oppositeSliceDuplicateArray[index];
                    if (oppositeItem) {
                        item.isExist = true;
                        item.targetIndex = oppositeItem.index;
                        oppositeItem.isExist = true;
                        oppositeItem.targetIndex = item.index;
                    } else {
                        item.isExist = false;
                    }
                });
                oppositeSliceDuplicateArray.slice(sliceDuplicateArray.length).forEach((item) => item.isExist = false);
            }

            function markingComponentsAsNotExist(array, oppositeCompareList) {
                array.forEach((item) => {
                    item.isExist = false;
                    if (item.targetIndex !== -1) {
                        oppositeCompareList[item.targetIndex].isExist = false;
                    }
                });
            }

        } else {
            leftObject.setNextItem();
            rightObject.setNextItem();
        }
    }

    if (leftObject.item || rightObject.item) {
        //After the while loop, both elements should be undefined.If the code has entered this condition, then some error has occurred
        console.error('Error during smart comparing', { leftObject, rightObject });
    }

    return { leftCompareList: leftObject.compareList, rightCompareList: rightObject.compareList };
};

class Comparison {
    constructor(keyArray) {
        this.compareList = [];
        this.groupMap = new Map();
        this.generator = {};
        this.keyArray = keyArray;
        this.item = {};
    }

    init(oppositeKeyArray) {
        this.formCompareList(oppositeKeyArray);
        this.formGroupMap();
        this.createGenerator(this.compareList);
        this.setNextItem();
    }

    formCompareList(oppositeKeyArray, isDuplicateNeed = false) {
        this.keyArray.forEach((item, index) => {
            let isExist = oppositeKeyArray.includes(item);
            let targetIndex = oppositeKeyArray.indexOf(item);

            const lastComponentWithSameTargetIndex = [...this.compareList].reverse().find((elem) => elem.value === item);
            if (targetIndex !== -1 && lastComponentWithSameTargetIndex && !isDuplicateNeed) {
                if (lastComponentWithSameTargetIndex.targetIndex === -1) {
                    isExist = false;
                    targetIndex = -1;
                } else {
                    isExist = oppositeKeyArray.includes(item, lastComponentWithSameTargetIndex.targetIndex + 1);
                    targetIndex = oppositeKeyArray.indexOf(item, lastComponentWithSameTargetIndex.targetIndex + 1);
                }
            }

            this.compareList.push({
                value: item,
                isExist,
                targetIndex,
                index,
            });
        });
    }

    formGroupMap() {
        this.compareList.forEach((item) => {
            const duplicateArray = this.groupMap.has(item.value) ? this.groupMap.get(item.value) : [];
            duplicateArray.push(item);
            this.groupMap.set(item.value, duplicateArray);
        });
    }

    createGenerator(arr) {
        this.generator = (function* () {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].isExist) {
                    yield arr[i];
                }
            }
        })();
    }

    setNextItem() {
        this.item = this.generator.next().value;
    }
}
//  /Created for case 6081

DeepDiffMapper.prototype.resetCounters = function(){
    this.leftLine = 0;
    this.rightLine = 0;
    this.changes = [];
    this.lastChange = 0;
};
/**
 *  Traverse all tree, return numb of elems on each level
 */
DeepDiffMapper.prototype.walkTree = function(o){
    var nodes = 0;
    if (o){
        if (this.isObject(o)){
            var keys = Object.keys(o);
            nodes += keys.length;/* add all keys as lines */
            for (var x = 0; x < keys.length; x++){
                /* check next level */
                nodes += this.walkTree(o[keys[x]]);
            }
        }else if (this.isArray(o)){
            nodes += o.length - 1;
            for (var x = 0; x < o.length; x++){
                /* check next level */
                nodes += this.walkTree(o[x]);
            }
        }
    }
    return nodes;// stop walk
};

DeepDiffMapper.prototype.getSize = function(obj){
    if (obj){
        return this.walkTree(obj);
    }
    return 0;
};
/**
 *
 */
DeepDiffMapper.prototype.createChanges = function(left,right){
    var id = 0;
    var lline = 0;
    var rline = 0;
    var len = left.length;
    while (id < len){
        var ltag = left[id];
        var rtag = right[id];
        var equalTag = '';
        if (ltag.op == 'updated'){
            var block = this.getBlock(lline, ltag.countLine, rline, rtag.countLine,[id], 'c');
            this.changes.push(block);

            id ++;
            lline += ltag.countLine;
            rline += rtag.countLine;
        }
        else if (ltag.placeholder || rtag.placeholder) {
            var isLtagPlaceholder = ltag.placeholder;
            var operation = isLtagPlaceholder ? 'a' : 'd';

            var block = this.getBlock(lline,ltag.countLine,rline,rtag.countLine,[id],operation);
            var level = isLtagPlaceholder ? ltag.level+0 : rtag.level+0;
            var ids =[];
            var isContinue = false;
            function getMaster(list,num) {
                let master;
                for (let i=0; i<list.length; i++){
                    if (list[i].num == num && list[i].name){
                        master = list[i];
                        return master
                    }
                }
                return null;
            }
            do {
                id++;
                ids.push(id);
                lline += ltag.countLine;
                rline += rtag.countLine;
                ltag = left[id];
                if (ltag && ltag.id && ExcludeSort[this.upperLevelTag]!=undefined){
                    let master = getMaster(left, ltag.master);
                    if(master!=null && master.name && ExcludeSort[this.upperLevelTag].includes(master.name))
                    {
                        if (LinkingDB[this.upperLevelTag][master.name].includes(ltag.name)){
                            if (this.upperLevelTag === 'Flow' && master.name === 'conditions' && master.master){
                                let upMaster = getMaster(left, master.master);
                                if (upMaster!=null && upMaster.name && upMaster.name === 'rules' && upMaster.value?.name){
                                    equalTag=upMaster.value.name+':'+master.name+':'+ltag.value;
                                } else {
                                    equalTag=master.name+':'+ltag.value;
                                }
                            } else {
                                equalTag=master.name+':'+ltag.value;
                            }

                        }

                    }
                }
                rtag = right[id];
                if (rtag && rtag.id  && ExcludeSort[this.upperLevelTag]!=undefined){
                    let master = getMaster(right, rtag.master);
                    if (master!=null && master.name && ExcludeSort[this.upperLevelTag].includes(master.name))
                    {
                        if (LinkingDB[this.upperLevelTag][master.name].includes(rtag.name)){
                            if (this.upperLevelTag === 'Flow' && master.name === 'conditions' && master.master){
                                let upMaster = getMaster(right, master.master);
                                if (upMaster!=null && upMaster.name && upMaster.name === 'rules' && upMaster.value?.name){
                                    equalTag=upMaster.value.name+':'+master.name+':'+rtag.value;
                                } else {
                                    equalTag=master.name+':'+rtag.value;
                                }
                            } else {
                                equalTag=master.name+':'+rtag.value;
                            }
                        }
                    }
                }
                if (isLtagPlaceholder) {
                    isContinue = id < len-1 && ltag.placeholder && level<ltag.level/*&&  rtag.leaf*/;
                } else {
                    isContinue = id < len-1 && rtag.placeholder && level<rtag.level/*&& ltag.leaf */;
                }
            }  while(isContinue);
            block['equalTag'] = equalTag;
            block['lhs-line-to'] = lline - left[id - 1].countLine;
            block['rhs-line-to'] = rline - right[id - 1].countLine;
            ids.pop();
            block['ids'] = block['ids'].concat(ids);
            this.changes.push(block);
        }
        else {
            id ++;
            lline += ltag.countLine;
            rline += rtag.countLine;
        }
    }
};

///////////////////// TRASH ////////////////////
// DeepDiffMapper.prototype.createChanges = function(left,right){
//     var line = 0;
//     var len = left.length;
//     console.log('left ', left);
//     console.log('right ',right);
//     while (line < len){
//         var ltag = left[line];
//         var rtag = right[line];
//         if (this.equal(ltag) && this.equal(rtag)){
//             line ++;
//         }else if (ltag.op == 'updated'){
//             var block = this.getBlock(line,line,'c');
//             this.changes.push(block);
//             line ++;
//         }else if (rtag.placeholder){
//             var block = this.getBlock(line,line,'d');
//             line ++;
//             ltag = left[line];
//             rtag = right[line];
//             while (line < len-1 && ltag.leaf && rtag.placeholder){
//                 line++;
//                 ltag = left[line];
//                 rtag = right[line];
//             }
//             block['lhs-line-to'] = line - 1;
//             block['rhs-line-to'] = line - 1;
//             this.changes.push(block);
//         }else if (ltag.placeholder){
//             var block = this.getBlock(line,line,'a');
//             line ++;
//             ltag = left[line];
//             rtag = right[line];
//             while (line < len-1 && ltag.placeholder &&  rtag.leaf){
//                 line++;
//                 ltag = left[line];
//                 rtag = right[line];
//             }
//             block['lhs-line-to'] = line - 1;
//             block['rhs-line-to'] = line - 1;
//             this.changes.push(block);
//         }else{// avoid infinity
//             line ++;
//         }
//     }
// };
///////////////////// TRASH ////////////////////

DeepDiffMapper.prototype.equal = function(tag){
    return tag.placeholder == undefined && (tag.op == undefined || tag.op == 'unchanged');
};

/**
 *  if node, start new block at this.lastChange
 *
 */
DeepDiffMapper.prototype.isChanged = function(token){
    return (token == 'updated' || token == 'deleted' || token == 'created')
};
/**
 *  patch is a structure like this:
 *  {"compare":"unchanged","key":"length","val":"16","newVal":"16","type":"value"}
 *  {"compare":"updated","key":"length","val":"16","newVal":"17","type":"value"}
 *  {"compare":"created","key":"length","val":"16","type":"value"}
 *  {"compare":"deleted","key":"fields","newVal":{"fullName":"Rider_Rating__c","label":"Rider Rating"},"type":"value"}
 *  this.removeAdded = {};// ids of elems in diff structure - subj to remove
 *  this.addDeleted = {};// ids of elems in diff structure -subj to add
 *  this.updated = {};// ids of changed elems, also left as is
 */
DeepDiffMapper.prototype.getValue = function(patch){
    var ret = {isEmpty: false};
    if (patch.compare == 'created'){
        if (this.removeAdded[patch.id]){
            ret.isEmpty = true;
        }else{
            ret.built = patch.val;
        }
    }else if (patch.compare == 'deleted'){
        if (this.addDeleted[patch.id]){
            ret.built = patch.newVal;
        }else{
            ret.isEmpty = true;
        }
    }else if (patch.compare == 'updated'){
        if (this.updated[patch.id]){
            ret.built = patch.newVal;
        }else{
            ret.built = patch.val;
        }
    }else if (patch.compare == 'unchanged'){
        ret.built = patch.val;
    }else{
        ret.isEmpty = true;
    }
    return ret;
};
/**
 *  returns: {builtObj: obj, isEmpty: true}
 *  isEmpty == true, if container obj is empty after processing
 */
DeepDiffMapper.prototype.getView = function(diff){
    var obj = {};
    if (this.isUndefined(diff)) return ret;
    if (this.isPatch(diff)){
        return this.getValue(diff);
    }else if (this.isObject(diff)){
        var ret = {built: obj, isEmpty: true};
        var isEmpty = true;
        for (var key in diff){
            if (diff.hasOwnProperty(key)){
                var r = this.getView(diff[key]);
                obj[key] = r.built;
                isEmpty = isEmpty && r.isEmpty;
            }
        }
        ret.isEmpty = isEmpty;
        return ret;
    }else if (this.isArray(diff)){
        var ret = {built: obj, isEmpty: true};
        var isEmpty = true;
        var left = [];
        for (var x = 0; x < diff.length; x++){
            var r = this.getView(diff[x]);
            if (r.isEmpty != true){
                left.push(r.built);
            }
            isEmpty = isEmpty && r.isEmpty;
        }
        if (left.length > 1){
            ret.built = left;
        }else if (left.length == 1){
            ret.built = left[0];
        }else {
            ret.built = '';
        }
        ret.isEmpty = isEmpty;
        return ret;
    }
};
/**
 * returns the number of  shared keys from arrays
 * if in both arrays present a Linking Key (f.e. fullName for array of fields),
 * then set the highest cost in the case of their equality
 */
DeepDiffMapper.prototype.cost = function(arr1,arr2,arrElem1,arrElem2,key) {
    var n = 0;
    for (var x = 0; x < arr1.length; x++){
        if ($.inArray(arr1[x], arr2) != -1){
            var field1 = arr1[x];/* detect the shared field */
            if ((field1 == 'fullName') && arrElem1[field1] == arrElem2[field1]){
                n = 500;/* found the tag with equal key */
                return n;
            }else{
                n++;
            }
        }
    }
    return n;
};

DeepDiffMapper.prototype.isPatch = function(obj) {
    return obj.compare != undefined;
};


DeepDiffMapper.prototype.isFunction = function(obj) {
    return {}.toString.apply(obj) === '[object Function]';
};

DeepDiffMapper.prototype.isArray = function(obj) {
    return (obj instanceof Array);
};

DeepDiffMapper.prototype.isObject = function(obj) {
    return (typeof obj == 'object') && !(obj instanceof Array);
};

DeepDiffMapper.prototype.isValue = function(obj) {
    return obj != undefined && obj != null && !this.isObject(obj) && !this.isArray(obj) ;
};


DeepDiffMapper.prototype.isUndefined = function(obj) {

    return obj == undefined || obj == null;// || obj =='';
};


DeepDiffMapper.prototype.escapeXmlChars = function(str) {
    if (str != undefined &&  str != '' && typeof(str) == "string"){
        var newStr = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        return newStr;
    }else{
        return str;
    }
};



function sortObject(object, LinkingDBKey){
    if (!object) return {};

    var sortedObj = {},
        keys = Object.keys(object);
    keys.sort(function(key1, key2){
        key1 = key1.toLowerCase(), key2 = key2.toLowerCase();
        if(key1 < key2) return -1;
        if(key1 > key2) return 1;
        return 0;
    });

    for(var index in keys){
        var key = keys[index];
        if(typeof object[key] == 'object' && !(object[key] instanceof Array)){
            sortedObj[key] = sortObject(object[key] , LinkingDBKey ? LinkingDB[key] : LinkingDB[key]);
        } else if (object[key] instanceof Array && LinkingDBKey && LinkingDBKey[key]) {
            sortedObj[key] = object[key].sort(sortByProperty(LinkingDBKey[key]));
        } else {
            sortedObj[key] = object[key];
        }
    }

    return sortedObj;
}

var sortByProperty = function (properties) {
    return function (x, y) {
        for(var i = 0 ; i <  properties.length; i++){
            const property = properties[i];
            if(x[property] > y[property]) return 1;
            if(x[property] < y[property]) return -1;
        }
        return 0;
    };
};

