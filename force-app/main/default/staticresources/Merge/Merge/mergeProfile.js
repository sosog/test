function mergeProfileAndPermissionSet (left, right) {
  let ObjectForVal,ObjectForValRight;
  if (left.Profile != undefined && right.Profile != undefined) {
    ObjectForVal = left.Profile;
    ObjectForValRight = right.Profile;
  } else if (left.PermissionSet != undefined && right.PermissionSet != undefined) {
    ObjectForVal = left.PermissionSet;
    ObjectForValRight = right.PermissionSet;
  }
  let NewArr =[];
  if (ObjectForValRight != null) {
    //APEX CLASS
    if (ObjectForValRight.classAccesses != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.classAccesses))
      {
        $.each(ObjectForValRight.classAccesses, function( paramKey, paramVal){
          if (ObjectForVal.classAccesses!=null){
            if (Array.isArray(ObjectForVal.classAccesses)){
              if(ObjectForVal.classAccesses.filter((item) => item.apexClass==paramVal.apexClass).length==0){
                ObjectForVal.classAccesses.push(paramVal);
              }
            } else {
              if(ObjectForVal.classAccesses.apexClass!=paramVal.apexClass){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.classAccesses = [];
            ObjectForVal.classAccesses.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.classAccesses);
          ObjectForVal.classAccesses = NewArr;
        }
      } else {
        if (ObjectForVal.classAccesses!=null){
          if (Array.isArray(ObjectForVal.classAccesses)){
            if(ObjectForVal.classAccesses.filter((item) => item.apexClass==ObjectForValRight.classAccesses.apexClass).length==0) {
              ObjectForVal.classAccesses.push(ObjectForValRight.classAccesses);
            }
          } else {
            if (ObjectForVal.classAccesses.apexClass != ObjectForValRight.classAccesses.apexClass){
              NewArr.push(ObjectForVal.classAccesses);
              NewArr.push(ObjectForValRight.classAccesses);
              ObjectForVal.classAccesses = NewArr;
            }
          }
        } else {
          ObjectForVal.classAccesses = ObjectForValRight.classAccesses;
        }
      }
    }

    //APEX PAGE
    if (ObjectForValRight.pageAccesses != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.pageAccesses))
      {
        $.each(ObjectForValRight.pageAccesses, function( paramKey, paramVal){
          if (ObjectForVal.pageAccesses!=null){
            if (Array.isArray(ObjectForVal.pageAccesses)){
              if(ObjectForVal.pageAccesses.filter((item) => item.apexPage==paramVal.apexPage).length==0){
                ObjectForVal.pageAccesses.push(paramVal);
              }
            } else {
              if(ObjectForVal.pageAccesses.apexPage!=paramVal.apexPage){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.pageAccesses = [];
            ObjectForVal.pageAccesses.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.pageAccesses);
          ObjectForVal.pageAccesses = NewArr;
        }
      } else {
        if (ObjectForVal.pageAccesses!=null){
          if (Array.isArray(ObjectForVal.pageAccesses)){
            if(ObjectForVal.pageAccesses.filter((item) => item.apexPage==ObjectForValRight.pageAccesses.apexPage).length==0) {
              ObjectForVal.pageAccesses.push(ObjectForValRight.pageAccesses);
            }
          } else {
            if (ObjectForVal.pageAccesses.apexPage != ObjectForValRight.pageAccesses.apexPage){
              NewArr.push(ObjectForVal.pageAccesses);
              NewArr.push(ObjectForValRight.pageAccesses);
              ObjectForVal.pageAccesses = NewArr;
            }
          }
        } else {
          ObjectForVal.pageAccesses = ObjectForValRight.pageAccesses;
        }
      }
    }

    //TAB permision
    if (ObjectForValRight.tabSettings != undefined && right.PermissionSet != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.tabSettings))
      {
        $.each(ObjectForValRight.tabSettings, function( paramKey, paramVal){
          if (ObjectForVal.tabSettings!=null){
            if (Array.isArray(ObjectForVal.tabSettings)){
              if(ObjectForVal.tabSettings.filter((item) => item.tab==paramVal.tab).length==0){
                ObjectForVal.tabSettings.push(paramVal);
              }
            } else {
              if(ObjectForVal.tabSettings.tab!=paramVal.tab){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.tabSettings = [];
            ObjectForVal.tabSettings.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.tabSettings);
          ObjectForVal.tabSettings = NewArr;
        }
      } else {
        if (ObjectForVal.tabSettings!=null){
          if (Array.isArray(ObjectForVal.tabSettings)){
            if(ObjectForVal.tabSettings.filter((item) => item.tab==ObjectForValRight.tabSettings.tab).length==0) {
              ObjectForVal.tabSettings.push(ObjectForValRight.tabSettings);
            }
          } else {
            if (ObjectForVal.tabSettings.tab != ObjectForValRight.tabSettings.tab){
              NewArr.push(ObjectForVal.tabSettings);
              NewArr.push(ObjectForValRight.tabSettings);
              ObjectForVal.tabSettings = NewArr;
            }
          }
        } else {
          ObjectForVal.tabSettings = ObjectForValRight.tabSettings;
        }
      }
    }

    //TAB Profile
    if (ObjectForValRight.tabVisibilities != undefined && right.Profile != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.tabVisibilities))
      {
        $.each(ObjectForValRight.tabVisibilities, function( paramKey, paramVal){
          if (ObjectForVal.tabVisibilities!=null){
            if (Array.isArray(ObjectForVal.tabVisibilities)){
              if(ObjectForVal.tabVisibilities.filter((item) => item.tab==paramVal.tab).length==0){
                ObjectForVal.tabVisibilities.push(paramVal);
              }
            } else {
              if(ObjectForVal.tabVisibilities.tab!=paramVal.tab){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.tabVisibilities = [];
            ObjectForVal.tabVisibilities.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.tabVisibilities);
          ObjectForVal.tabVisibilities = NewArr;
        }
      } else {
        if (ObjectForVal.tabVisibilities!=null){
          if (Array.isArray(ObjectForVal.tabVisibilities)){
            if(ObjectForVal.tabVisibilities.filter((item) => item.tab==ObjectForValRight.tabVisibilities.tab).length==0) {
              ObjectForVal.tabVisibilities.push(ObjectForValRight.tabVisibilities);
            }
          } else {
            if (ObjectForVal.tabVisibilities.tab != ObjectForValRight.tabVisibilities.tab){
              NewArr.push(ObjectForVal.tabVisibilities);
              NewArr.push(ObjectForValRight.tabVisibilities);
              ObjectForVal.tabVisibilities = NewArr;
            }
          }
        } else {
          ObjectForVal.tabVisibilities = ObjectForValRight.tabVisibilities;
        }
      }
    }

    //profileActionOverrides Profile
    if (ObjectForValRight.profileActionOverrides != undefined && right.Profile != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.profileActionOverrides))
      {
        $.each(ObjectForValRight.profileActionOverrides, function( paramKey, paramVal){
          if (ObjectForVal.profileActionOverrides!=null){
            if (Array.isArray(ObjectForVal.profileActionOverrides)){
              if(ObjectForVal.profileActionOverrides.filter((item) => item.content==paramVal.content).length==0){
                ObjectForVal.profileActionOverrides.push(paramVal);
              }
            } else {
              if(ObjectForVal.profileActionOverrides.content!=paramVal.content){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.profileActionOverrides = [];
            ObjectForVal.profileActionOverrides.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.profileActionOverrides);
          ObjectForVal.profileActionOverrides = NewArr;
        }
      } else {
        if (ObjectForVal.profileActionOverrides!=null){
          if (Array.isArray(ObjectForVal.profileActionOverrides)){
            if(ObjectForVal.profileActionOverrides.filter((item) => item.content==ObjectForValRight.profileActionOverrides.content).length==0) {
              ObjectForVal.profileActionOverrides.push(ObjectForValRight.profileActionOverrides);
            }
          } else {
            if (ObjectForVal.profileActionOverrides.content != ObjectForValRight.profileActionOverrides.content){
              NewArr.push(ObjectForVal.profileActionOverrides);
              NewArr.push(ObjectForValRight.profileActionOverrides);
              ObjectForVal.profileActionOverrides = NewArr;
            }
          }
        } else {
          ObjectForVal.profileActionOverrides = ObjectForValRight.profileActionOverrides;
        }
      }
    }

    //categoryGroupVisibilities Profile
    if (ObjectForValRight.categoryGroupVisibilities != undefined && right.Profile != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.categoryGroupVisibilities))
      {
        $.each(ObjectForValRight.categoryGroupVisibilities, function( paramKey, paramVal){
          if (ObjectForVal.categoryGroupVisibilities!=null){
            if (Array.isArray(ObjectForVal.categoryGroupVisibilities)){
              if(ObjectForVal.categoryGroupVisibilities.filter((item) => item.dataCategoryGroup==paramVal.dataCategoryGroup).length==0){
                ObjectForVal.categoryGroupVisibilities.push(paramVal);
              }
            } else {
              if(ObjectForVal.categoryGroupVisibilities.dataCategoryGroup!=paramVal.dataCategoryGroup){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.categoryGroupVisibilities = [];
            ObjectForVal.categoryGroupVisibilities.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.categoryGroupVisibilities);
          ObjectForVal.categoryGroupVisibilities = NewArr;
        }
      } else {
        if (ObjectForVal.categoryGroupVisibilities!=null){
          if (Array.isArray(ObjectForVal.categoryGroupVisibilities)){
            if(ObjectForVal.categoryGroupVisibilities.filter((item) => item.dataCategoryGroup==ObjectForValRight.categoryGroupVisibilities.dataCategoryGroup).length==0) {
              ObjectForVal.categoryGroupVisibilities.push(ObjectForValRight.categoryGroupVisibilities);
            }
          } else {
            if (ObjectForVal.categoryGroupVisibilities.dataCategoryGroup != ObjectForValRight.categoryGroupVisibilities.dataCategoryGroup){
              NewArr.push(ObjectForVal.categoryGroupVisibilities);
              NewArr.push(ObjectForValRight.categoryGroupVisibilities);
              ObjectForVal.categoryGroupVisibilities = NewArr;
            }
          }
        } else {
          ObjectForVal.categoryGroupVisibilities = ObjectForValRight.categoryGroupVisibilities;
        }
      }
    }

    //OBJECT
    if (ObjectForValRight.objectPermissions != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.objectPermissions))
      {
        $.each(ObjectForValRight.objectPermissions, function( paramKey, paramVal){
          if (ObjectForVal.objectPermissions!=null){
            if (Array.isArray(ObjectForVal.objectPermissions)){
              if(ObjectForVal.objectPermissions.filter((item) => item.object==paramVal.object).length==0){
                ObjectForVal.objectPermissions.push(paramVal);
              }
            } else {
              if(ObjectForVal.objectPermissions.object!=paramVal.object){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.objectPermissions = [];
            ObjectForVal.objectPermissions.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.objectPermissions);
          ObjectForVal.objectPermissions = NewArr;
        }
      } else {
        if (ObjectForVal.objectPermissions!=null){
          if (Array.isArray(ObjectForVal.objectPermissions)){
            if(ObjectForVal.objectPermissions.filter((item) => item.object==ObjectForValRight.objectPermissions.object).length==0) {
              ObjectForVal.objectPermissions.push(ObjectForValRight.objectPermissions);
            }
          } else {
            if (ObjectForVal.objectPermissions.object != ObjectForValRight.objectPermissions.object){
              NewArr.push(ObjectForVal.objectPermissions);
              NewArr.push(ObjectForValRight.objectPermissions);
              ObjectForVal.objectPermissions = NewArr;
            }
          }
        } else {
          ObjectForVal.objectPermissions = ObjectForValRight.objectPermissions;
        }
      }
    }

    //customMetadataTypeAccesses
    if (ObjectForValRight.customMetadataTypeAccesses != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.customMetadataTypeAccesses))
      {
        $.each(ObjectForValRight.customMetadataTypeAccesses, function( paramKey, paramVal){
          if (ObjectForVal.customMetadataTypeAccesses!=null){
            if (Array.isArray(ObjectForVal.customMetadataTypeAccesses)){
              if(ObjectForVal.customMetadataTypeAccesses.filter((item) => item.name==paramVal.name).length==0){
                ObjectForVal.customMetadataTypeAccesses.push(paramVal);
              }
            } else {
              if(ObjectForVal.customMetadataTypeAccesses.name!=paramVal.name){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.customMetadataTypeAccesses = [];
            ObjectForVal.customMetadataTypeAccesses.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.customMetadataTypeAccesses);
          ObjectForVal.customMetadataTypeAccesses = NewArr;
        }
      } else {
        if (ObjectForVal.customMetadataTypeAccesses!=null){
          if (Array.isArray(ObjectForVal.customMetadataTypeAccesses)){
            if(ObjectForVal.customMetadataTypeAccesses.filter((item) => item.name==ObjectForValRight.customMetadataTypeAccesses.name).length==0) {
              ObjectForVal.customMetadataTypeAccesses.push(ObjectForValRight.customMetadataTypeAccesses);
            }
          } else {
            if (ObjectForVal.customMetadataTypeAccesses.name != ObjectForValRight.customMetadataTypeAccesses.name){
              NewArr.push(ObjectForVal.customMetadataTypeAccesses);
              NewArr.push(ObjectForValRight.customMetadataTypeAccesses);
              ObjectForVal.customMetadataTypeAccesses = NewArr;
            }
          }
        } else {
          ObjectForVal.customMetadataTypeAccesses = ObjectForValRight.customMetadataTypeAccesses;
        }
      }
    }

    //customSettingAccesses
    if (ObjectForValRight.customSettingAccesses != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.customSettingAccesses))
      {
        $.each(ObjectForValRight.customSettingAccesses, function( paramKey, paramVal){
          if (ObjectForVal.customSettingAccesses!=null){
            if (Array.isArray(ObjectForVal.customSettingAccesses)){
              if(ObjectForVal.customSettingAccesses.filter((item) => item.name==paramVal.name).length==0){
                ObjectForVal.customSettingAccesses.push(paramVal);
              }
            } else {
              if(ObjectForVal.customSettingAccesses.name!=paramVal.name){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.customSettingAccesses = [];
            ObjectForVal.customSettingAccesses.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.customSettingAccesses);
          ObjectForVal.customSettingAccesses = NewArr;
        }
      } else {
        if (ObjectForVal.customSettingAccesses!=null){
          if (Array.isArray(ObjectForVal.customSettingAccesses)){
            if(ObjectForVal.customSettingAccesses.filter((item) => item.name==ObjectForValRight.customSettingAccesses.name).length==0) {
              ObjectForVal.customSettingAccesses.push(ObjectForValRight.customSettingAccesses);
            }
          } else {
            if (ObjectForVal.customSettingAccesses.name != ObjectForValRight.customSettingAccesses.name){
              NewArr.push(ObjectForVal.customSettingAccesses);
              NewArr.push(ObjectForValRight.customSettingAccesses);
              ObjectForVal.customSettingAccesses = NewArr;
            }
          }
        } else {
          ObjectForVal.customSettingAccesses = ObjectForValRight.customSettingAccesses;
        }
      }
    }

    //Layout
    if (ObjectForValRight.layoutAssignments != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.layoutAssignments))
      {
        $.each(ObjectForValRight.layoutAssignments, function( paramKey, paramVal){
          if (ObjectForVal.layoutAssignments!=null){
            if (Array.isArray(ObjectForVal.layoutAssignments)){
              if(paramVal.recordType != undefined) {
                if(ObjectForVal.layoutAssignments.filter((item) => item.layout==paramVal.layout && item.recordType && item.recordType==paramVal.recordType).length==0){
                  ObjectForVal.layoutAssignments.push(paramVal);
                }
              } else {
                if(ObjectForVal.layoutAssignments.filter((item) => item.layout==paramVal.layout).length==0){
                  ObjectForVal.layoutAssignments.push(paramVal);
                }
              }
            } else {
              if(paramVal.recordType != undefined) {
                if(ObjectForVal.layoutAssignments.layout!=paramVal.layout && ObjectForVal.layoutAssignments.recordType && ObjectForVal.layoutAssignments.recordType!=paramVal.recordType){
                  NewArr.push(paramVal);
                }
              } else {
                if(ObjectForVal.layoutAssignments.layout!=paramVal.layout){
                  NewArr.push(paramVal);
                }
              }
            }
          } else {
            ObjectForVal.layoutAssignments = [];
            ObjectForVal.layoutAssignments.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.layoutAssignments);
          ObjectForVal.layoutAssignments = NewArr;
        }
      } else {
        if (ObjectForVal.layoutAssignments!=null){
          if (Array.isArray(ObjectForVal.layoutAssignments)){
            if(ObjectForValRight.layoutAssignments.recordType != undefined) {
              if(ObjectForVal.layoutAssignments.filter((item) => item.layout==ObjectForValRight.layoutAssignments.layout && item.recordType && item.recordType==ObjectForValRight.layoutAssignments.recordType).length==0) {
                ObjectForVal.layoutAssignments.push(ObjectForValRight.layoutAssignments);
              }
            } else {
              if(ObjectForVal.layoutAssignments.filter((item) => item.layout==ObjectForValRight.layoutAssignments.layout).length==0) {
                ObjectForVal.layoutAssignments.push(ObjectForValRight.layoutAssignments);
              }
            }
          } else {
            if(ObjectForValRight.layoutAssignments.recordType != undefined) {
              if (ObjectForVal.layoutAssignments.layout != ObjectForValRight.layoutAssignments.layout && ObjectForVal.layoutAssignments.recordType && ObjectForVal.layoutAssignments.recordType!=ObjectForValRight.layoutAssignments.recordType){
                NewArr.push(ObjectForVal.layoutAssignments);
                NewArr.push(ObjectForValRight.layoutAssignments);
                ObjectForVal.layoutAssignments = NewArr;
              }
            } else {
              if (ObjectForVal.layoutAssignments.layout != ObjectForValRight.layoutAssignments.layout){
                NewArr.push(ObjectForVal.layoutAssignments);
                NewArr.push(ObjectForValRight.layoutAssignments);
                ObjectForVal.layoutAssignments = NewArr;
              }
            }
          }
        } else {
          ObjectForVal.layoutAssignments = ObjectForValRight.layoutAssignments;
        }
      }
    }

    //recordType
    if (ObjectForValRight.recordTypeVisibilities != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.recordTypeVisibilities))
      {
        $.each(ObjectForValRight.recordTypeVisibilities, function( paramKey, paramVal){
          if (ObjectForVal.recordTypeVisibilities!=null){
            if (Array.isArray(ObjectForVal.recordTypeVisibilities)){
              if(ObjectForVal.recordTypeVisibilities.filter((item) => item.recordType==paramVal.recordType).length==0){
                ObjectForVal.recordTypeVisibilities.push(paramVal);
              }
            } else {
              if(ObjectForVal.recordTypeVisibilities.recordType!=paramVal.recordType){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.recordTypeVisibilities = [];
            ObjectForVal.recordTypeVisibilities.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.recordTypeVisibilities);
          ObjectForVal.recordTypeVisibilities = NewArr;
        }
      } else {
        if (ObjectForVal.recordTypeVisibilities!=null){
          if (Array.isArray(ObjectForVal.recordTypeVisibilities)){
            if(ObjectForVal.recordTypeVisibilities.filter((item) => item.recordType==ObjectForValRight.recordTypeVisibilities.recordType).length==0) {
              ObjectForVal.recordTypeVisibilities.push(ObjectForValRight.recordTypeVisibilities);
            }
          } else {
            if (ObjectForVal.recordTypeVisibilities.recordType != ObjectForValRight.recordTypeVisibilities.recordType){
              NewArr.push(ObjectForVal.recordTypeVisibilities);
              NewArr.push(ObjectForValRight.recordTypeVisibilities);
              ObjectForVal.recordTypeVisibilities = NewArr;
            }
          }
        } else {
          ObjectForVal.recordTypeVisibilities = ObjectForValRight.recordTypeVisibilities;
        }
      }
    }

    //fieldPermissions
    if (ObjectForValRight.fieldPermissions != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.fieldPermissions))
      {
        $.each(ObjectForValRight.fieldPermissions, function( paramKey, paramVal){
          if (ObjectForVal.fieldPermissions!=null){
            if (Array.isArray(ObjectForVal.fieldPermissions)){
              if(ObjectForVal.fieldPermissions.filter((item) => item.field==paramVal.field).length==0){
                ObjectForVal.fieldPermissions.push(paramVal);
              }
            } else {
              if(ObjectForVal.fieldPermissions.field!=paramVal.field){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.fieldPermissions = [];
            ObjectForVal.fieldPermissions.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.fieldPermissions);
          ObjectForVal.fieldPermissions = NewArr;
        }
      } else {
        if (ObjectForVal.fieldPermissions!=null){
          if (Array.isArray(ObjectForVal.fieldPermissions)){
            if(ObjectForVal.fieldPermissions.filter((item) => item.field==ObjectForValRight.fieldPermissions.field).length==0) {
              ObjectForVal.fieldPermissions.push(ObjectForValRight.fieldPermissions);
            }
          } else {
            if (ObjectForVal.fieldPermissions.field != ObjectForValRight.fieldPermissions.field){
              NewArr.push(ObjectForVal.fieldPermissions);
              NewArr.push(ObjectForValRight.fieldPermissions);
              ObjectForVal.fieldPermissions = NewArr;
            }
          }
        } else {
          ObjectForVal.fieldPermissions = ObjectForValRight.fieldPermissions;
        }
      }
    }

    //applicationVisibilities
    if (ObjectForValRight.applicationVisibilities != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.applicationVisibilities))
      {
        $.each(ObjectForValRight.applicationVisibilities, function( paramKey, paramVal){
          if (ObjectForVal.applicationVisibilities!=null){
            if (Array.isArray(ObjectForVal.applicationVisibilities)){
              if(ObjectForVal.applicationVisibilities.filter((item) => item.application==paramVal.application).length==0){
                ObjectForVal.applicationVisibilities.push(paramVal);
              }
            } else {
              if(ObjectForVal.applicationVisibilities.application!=paramVal.application){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.applicationVisibilities = [];
            ObjectForVal.applicationVisibilities.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.applicationVisibilities);
          ObjectForVal.applicationVisibilities = NewArr;
        }
      } else {
        if (ObjectForVal.applicationVisibilities!=null){
          if (Array.isArray(ObjectForVal.applicationVisibilities)){
            if(ObjectForVal.applicationVisibilities.filter((item) => item.application==ObjectForValRight.applicationVisibilities.application).length==0) {
              ObjectForVal.applicationVisibilities.push(ObjectForValRight.applicationVisibilities);
            }
          } else {
            if (ObjectForVal.applicationVisibilities.application != ObjectForValRight.applicationVisibilities.application){
              NewArr.push(ObjectForVal.applicationVisibilities);
              NewArr.push(ObjectForValRight.applicationVisibilities);
              ObjectForVal.applicationVisibilities = NewArr;
            }
          }
        } else {
          ObjectForVal.applicationVisibilities = ObjectForValRight.applicationVisibilities;
        }
      }
    }

    //externalDataSourceAccesses
    if (ObjectForValRight.externalDataSourceAccesses != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.externalDataSourceAccesses))
      {
        $.each(ObjectForValRight.externalDataSourceAccesses, function( paramKey, paramVal){
          if (ObjectForVal.externalDataSourceAccesses!=null){
            if (Array.isArray(ObjectForVal.externalDataSourceAccesses)){
              if(ObjectForVal.externalDataSourceAccesses.filter((item) => item.externalDataSource==paramVal.externalDataSource).length==0){
                ObjectForVal.externalDataSourceAccesses.push(paramVal);
              }
            } else {
              if(ObjectForVal.externalDataSourceAccesses.externalDataSource!=paramVal.externalDataSource){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.externalDataSourceAccesses = [];
            ObjectForVal.externalDataSourceAccesses.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.externalDataSourceAccesses);
          ObjectForVal.externalDataSourceAccesses = NewArr;
        }
      } else {
        if (ObjectForVal.externalDataSourceAccesses!=null){
          if (Array.isArray(ObjectForVal.externalDataSourceAccesses)){
            if(ObjectForVal.externalDataSourceAccesses.filter((item) => item.externalDataSource==ObjectForValRight.externalDataSourceAccesses.externalDataSource).length==0) {
              ObjectForVal.externalDataSourceAccesses.push(ObjectForValRight.externalDataSourceAccesses);
            }
          } else {
            if (ObjectForVal.externalDataSourceAccesses.externalDataSource != ObjectForValRight.externalDataSourceAccesses.externalDataSource){
              NewArr.push(ObjectForVal.externalDataSourceAccesses);
              NewArr.push(ObjectForValRight.externalDataSourceAccesses);
              ObjectForVal.externalDataSourceAccesses = NewArr;
            }
          }
        } else {
          ObjectForVal.externalDataSourceAccesses = ObjectForValRight.externalDataSourceAccesses;
        }
      }
    }

    //customPermissions
    if (ObjectForValRight.customPermissions != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.customPermissions))
      {
        $.each(ObjectForValRight.customPermissions, function( paramKey, paramVal){
          if (ObjectForVal.customPermissions!=null){
            if (Array.isArray(ObjectForVal.customPermissions)){
              if(ObjectForVal.customPermissions.filter((item) => item.name==paramVal.name).length==0){
                ObjectForVal.customPermissions.push(paramVal);
              }
            } else {
              if(ObjectForVal.customPermissions.name!=paramVal.name){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.customPermissions = [];
            ObjectForVal.customPermissions.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.customPermissions);
          ObjectForVal.customPermissions = NewArr;
        }
      } else {
        if (ObjectForVal.customPermissions!=null){
          if (Array.isArray(ObjectForVal.customPermissions)){
            if(ObjectForVal.customPermissions.filter((item) => item.name==ObjectForValRight.customPermissions.name).length==0) {
              ObjectForVal.customPermissions.push(ObjectForValRight.customPermissions);
            }
          } else {
            if (ObjectForVal.customPermissions.name != ObjectForValRight.customPermissions.name){
              NewArr.push(ObjectForVal.customPermissions);
              NewArr.push(ObjectForValRight.customPermissions);
              ObjectForVal.customPermissions = NewArr;
            }
          }
        } else {
          ObjectForVal.customPermissions = ObjectForValRight.customPermissions;
        }
      }
    }

    //flowAccesses
    if (ObjectForValRight.flowAccesses != undefined) {
      NewArr =[];
      if(Array.isArray(ObjectForValRight.flowAccesses))
      {
        $.each(ObjectForValRight.flowAccesses, function( paramKey, paramVal){
          if (ObjectForVal.flowAccesses!=null){
            if (Array.isArray(ObjectForVal.flowAccesses)){
              if(ObjectForVal.flowAccesses.filter((item) => item.flow==paramVal.flow).length==0){
                ObjectForVal.flowAccesses.push(paramVal);
              }
            } else {
              if(ObjectForVal.flowAccesses.flow!=paramVal.flow){
                NewArr.push(paramVal);
              }
            }
          } else {
            ObjectForVal.flowAccesses = [];
            ObjectForVal.flowAccesses.push(paramVal);
          }
        });
        if (NewArr.length > 0) {
          NewArr.push(ObjectForVal.flowAccesses);
          ObjectForVal.flowAccesses = NewArr;
        }
      } else {
        if (ObjectForVal.flowAccesses!=null){
          if (Array.isArray(ObjectForVal.flowAccesses)){
            if(ObjectForVal.flowAccesses.filter((item) => item.flow==ObjectForValRight.flowAccesses.flow).length==0) {
              ObjectForVal.flowAccesses.push(ObjectForValRight.flowAccesses);
            }
          } else {
            if (ObjectForVal.flowAccesses.flow != ObjectForValRight.flowAccesses.flow){
              NewArr.push(ObjectForVal.flowAccesses);
              NewArr.push(ObjectForValRight.flowAccesses);
              ObjectForVal.flowAccesses = NewArr;
            }
          }
        } else {
          ObjectForVal.flowAccesses = ObjectForValRight.flowAccesses;
        }
      }
    }

  }
}