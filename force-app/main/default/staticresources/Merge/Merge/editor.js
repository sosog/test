    const  FORK_SYM = '\u2520';
    const  FINAL_SYM = '\u2516';
    const  CONTINUE_SYM = '\u2503';
    const  WHITESPACE = '\u00a0\u00a0\u00a0\u00a0';
    const  ONESPACE = '\u00a0\u00a0';
    const  nbl = '\u21B5';
    const  XMLNS = '_xmlns';
    const  ENDOFLINE = '\n';
    const  XML = 'XML';
    const  NONXML = 'NONXML';
    const  DELETED = 'deleted';
    const  CREATED = 'created';
    const  UPDATED = 'updated'
    const  UNCHANGED = 'unchanged';

    const  KEY_SIZE = 40;  
    const  topPercent = 0.95;  

    /**
     *  2-params Constructor
     *  editorObj is a pointer to obj which in further will be used for displaying data
     */

    var Editor = function(editorObj, isXml, superTag){
        this._initArray();
        this._linkView(editorObj);
        this._init(isXml,superTag);
        this.isEmpty = false;
    }

        /**
         *  Init the main array to hold linearized diff structure
         *  (Called once per editor instance)
         */
        Editor.prototype._initArray = function (soft){
	    this.rowCollection = [];
            this.viewCollection = [];
	    if (soft == undefined){
	            this.VALUE_SIZE = 80; // max width for the value before  cut operation triggered (all the rest symbols are truncated)
        	    this.XML_VALUE_SIZE = 80; // max width for the value before  cut operation triggered (all the rest symbols are truncated)
	            this.SYM_W = 8.75;
	    }
	}

        Editor.prototype._init = function(bXml,superTag){
	    this.indexMap = [];// array as linearized map index=>real_index of the first line
            this.deltaMap = {};// maps id to number of changes - used in xml editor
	    this.lineSizes = [];
	    this.maxLineSize = 0;
            this.superTag = superTag;

    	    this.counter = 0;
            this.nCounter = 0;
            this.lCounter = 0;
            this.rCounter = 0;
            this.guidCounter = 0;
            this.index = 0;

            this.xml = '';
            this.txt = '';
            this.mainTag = '';
            this.xmlnsParam = '';
	    if (bXml != undefined){ //hard reset
	            this.editor.copyAllFlag = false;
        	    this.editor.isEquivalent = false; // set initial value to false, if obj are not different, this value will be reset
	            this.isEqual = false;
        	    this.isXml = bXml;
	            this.fileType = bXml ? XML: NONXML;
	    }
	}

        Editor.prototype.initVars = function(){
                this.index = 0;
                if (this.rowCollection.length > 0) this.mainTag = this.rowCollection[0].parentTag;
        }

        Editor.prototype.resetVars = function(soft){
            this._init();
        }
        
	Editor.prototype.resetArrays = function(soft){
	    this.rowCollection = [];
            this.viewCollection = [];
	}
        /**
         *  Links external obj  to inner var 
         */
        Editor.prototype._linkView = function (editor){
		this.editor = editor; // use this variable to update external (view) array and handler vars
	}

        /**
         *  Copies scope vars to and from
         */

        Editor.prototype.getVarsAsPack = function(){
                var arch = {};
                arch.isEmpty = this.isEmpty;
                arch.rowCollection = this.rowCollection;
                arch.counter = this.counter;
                arch.nCounter = this.nCounter;
                arch.copyAllFlag =  this.editor.copyAllFlag;
                arch.changesOnly =  this.editor.changesOnly;
                arch.ignoreWS = this.editor.ignoreWS;
                arch.indexMap = this.indexMap;
                arch.fileType = this.fileType;
                arch.maxLineSize = this.maxLineSize; 
                arch.VALUE_SIZE = this.VALUE_SIZE;
                arch.SYM_W = this.SYM_W;   
                if (this.fileType === XML){
                    arch.deltaMap = this.deltaMap;
                    arch.isEquivalent = this.editor.isEquivalent;// scope variable
                }else if (this.fileType === NONXML){
                }
                return arch;
        }

        Editor.prototype.setVarsFromPack = function(pack){
                if (pack != undefined){
                    this.fileType = pack.fileType;
                    if (this.fileType === XML){
                        this.deltaMap = pack.deltaMap;
                        this.editor.isEquivalent = pack.isEquivalent;
                    }
  		    this.isEmpty = pack.isEmpty;
                    this.rowCollection = pack.rowCollection;
                    this.counter = pack.counter;
                    this.nCounter = pack.nCounter;  
                    this.editor.copyAllFlag = pack.copyAllFlag;
                    this.editor.changesOnly = pack.changesOnly;
                    this.editor.ignoreWS = pack.ignoreWS;
                    this.indexMap = pack.indexMap;
                    this.maxLineSize = pack.maxLineSize;
                    this.VALUE_SIZE = pack.VALUE_SIZE;
                    this.SYM_W = pack.SYM_W;
                }
                this.initVars();
                this.updateList(!this.editor.changesOnly);
//                setWindowParams(fileType == XML); //call fuction for setting windows params outside object
        }


        Editor.prototype._getValue = function(row){
            if (row.parts != undefined){
                return row.DiffAction ? row.FullOldData : row.FullNewData;
            }else{
                return row.DiffViewValue;
            }
        }


        Editor.prototype.buildText = function (){
                var txt = '';
                for (var x = 0; x < this.indexMap.length; x++){// iterate over all lines; this.indexMap: not-cutted line's this.index => in-memory array lines this.index
                    var row = this.rowCollection[this.indexMap[x]];
                    if (row.DiffAction){
                        if (row.DiffType != CREATED){
                            txt +=  ((row.parts != undefined)? row.FullOldData : row.FullOldData) + ENDOFLINE;
                        }
                    }else{
                        if (row.DiffType != DELETED){
                            txt +=  ((row.parts != undefined)? row.FullNewData : row.FullNewData) +  ENDOFLINE;
                        }
                    }
                }
                if (txt  != ''){
                    return txt.slice(0,txt.length - 1);
                }else{
                    return txt;
                }
        }

        Editor.prototype.buildObjXml = function (){
                var xml2return = '';

                if (this.index >= this.nCounter) return '';
                var row = this.rowCollection[this.indexMap[this.index]];// get the 1st record of the object; (it can be a key record)
                var exit = false;
                var next;
                var guid = row.guid;
                var level = row.level;
                var first = true;

                next = (row.guid === guid); //process while guid the same
                next = true;

                if (first){ next = true;}

                while (this.index < this.nCounter && row.level >= level){
                // iterage over all obj rows,the tags which must be on the same level for the same object

                    // analyse the type of tag
                    if (row.isKey != undefined){// process key tags
                        	//check is key tag empty
                        	if (this.indexMap[this.index+1] !=undefined){
                        		var nextRow = this.rowCollection[this.indexMap[this.index+1]];
                        		if (nextRow != undefined && nextRow.guid == guid){//conditions for empty tag
                        			this.index++;
                        			xml2return += this._addEmptyTag(row.parentTag);
                				    row = nextRow;
                    				continue;
                        		}
                        	}
                            this.index++;
                            xml2return +=  this._addTagWithValue(row.parentTag, this.buildObjXml());
                    }else{// value tag
                        this.index++;
                        xml2return += this._addTagWithValue(row.tag, this._getValue(row));
                    }
					if (this.indexMap[this.index] != undefined){
                    	row = this.rowCollection[this.indexMap[this.index]];
                    }else{
                    	break;
                    }

                }
                return  xml2return;
        }

        Editor.prototype._addTagWithValue = function(tag, value){
            if (tag === XMLNS){
                this.xmlnsParam = value;
                return '';
            }else{
                if (value == undefined || value == ''){// do not add empty tags
                    return '';
                }
                return  ('<' + tag + '>' + value+ '</' +tag + '>');
            }
        }

            
        Editor.prototype._addEmptyTag = function( tag ){
            	return '<' + tag + '/>';
            }

        Editor.prototype.buildObj = function (){
                var json2return = {};

                if (this.index >= this.nCounter) return '';
                var row = this.rowCollection[this.indexMap[this.index]];// get the 1st record of the object; (it can be a key record)
                var exit = false;
                var next;
                var guid = row.guid;
                var level = row.level;
                var first = true;

                next = (row.guid === guid); //process while guid the same
                next = true;

                if (first){ next = true;}

                while (this.index < this.nCounter && row.level >= level){
                // iterage over all obj rows,the tags which must be on the same level for the same object

                    // analyse the type of tag
                    if (row.isKey != undefined){// process key tags
                            //check is key tag empty
                            if (this.indexMap[this.index+1] !=undefined){
                                var nextRow = this.rowCollection[this.indexMap[this.index+1]];
                                if (nextRow != undefined && nextRow.guid == guid){//conditions for empty tag - do nothing
                                    this.index++;
                                    row = nextRow;
                                    continue;
                                }
                            }
                            this.index++;
                            this._addValue(json2return, row.parentTag, this.buildObj());
                    }else{// value tag
                        this.index++;
                        this._addValue(json2return, row.tag, this._getValue(row));
                    }
                    if (this.indexMap[this.index] != undefined){
                        row = this.rowCollection[this.indexMap[this.index]];
                    }else{
                        break;
                    }

                }
		if (Object.keys(json2return).length === 0 && json2return.constructor === Object) return;// return undefined for the case of empty object
                return  json2return;
        }

        Editor.prototype._addValue = function(json, tag, value){
            if (value == undefined || value == ''){// do not add empty tags
                return;
            }
            // verify does json already contains tag
            // true: verify is array : if true - push(value), else create array as replacement
            // false: add as obj first
            if (json[tag] == undefined){
                json[tag] = value;     
            }else if (isArray(json[tag])){
                json[tag].push(value);
            }else{
                var newArray = [];
                newArray.push(json[tag]);// add old
                newArray.push(value);// add new
                json[tag] = newArray;
            }

            function isArray(obj) {
                return {}.toString.apply(obj) === '[object Array]';
            }

        }

        Editor.prototype._getMargin = function(level){
                if (level == 0 || level == 1) return ONESPACE
                var init = '';
                for( var x = 0 ; x < level-1; x++){
                    init += ONESPACE+CONTINUE_SYM;
                }
                return init;
            }
 
        Editor.prototype.createWrapperItem = function(name, treeSymb, level, guid, margin){
                var margin = (level == 0)? ONESPACE: (margin + treeSymb);
                var id = this._getId();
	            this.rowCollection.push({id: id, isKey: true, guid: guid, number: (this.nCounter+1), level: level, parentTag: name, margin: margin, displayedKey: name});
    
                this.indexMap.push(this.counter);
                this.counter++;
                this.nCounter++;
                return id;
        }

        Editor.prototype.createItem = function(name, obj, treeSymb, level, guid, margin){
            
            if (obj.NewData == null && obj.OldData == null) return 0;// do not add empty tags
                if (treeSymb == FORK_SYM){
                    var multi_margin = (level == 0)? ONESPACE: (margin + CONTINUE_SYM + WHITESPACE );
                }else if (treeSymb == FINAL_SYM){
                    var multi_margin = (level == 0)? ONESPACE: (margin + WHITESPACE );
                }else{
                    var multi_margin = (level == 0)? ONESPACE: (margin + WHITESPACE );
                }
                var margin = (level == 0)? ONESPACE: (margin + treeSymb);
                var displayedKey = name;
                var fullValueR = obj.DiffViewValue;
                var fullValueL = obj.OldData;
 
                // truncated key if needed
                if (displayedKey != undefined && displayedKey.length > KEY_SIZE){
                    displayedKey = displayedKey.slice(0,KEY_SIZE) + '...:';
                }else{
                    displayedKey = displayedKey + ':';
                }
                this.XML_VALUE_SIZE = this.VALUE_SIZE - displayedKey.length;

                // cut value on parts (multiply lines), if length > this.VALUE_SIZE
                var partsL = [];
                var partsR = [];
		var LEFT_CORRECTION = 5;
		if ((this.XML_VALUE_SIZE - LEFT_CORRECTION)  < 0){
			LEFT_CORRECTION = 0;
		}
                if (fullValueL != undefined && fullValueL.length > this.XML_VALUE_SIZE - LEFT_CORRECTION){
                    nPartsL = Math.floor(fullValueL.length/(this.XML_VALUE_SIZE - LEFT_CORRECTION)) + 1;
                    for (var x = 0; x < nPartsL; x++){
                        partsL.push(fullValueL.slice((this.XML_VALUE_SIZE - LEFT_CORRECTION)*x, (this.XML_VALUE_SIZE - LEFT_CORRECTION)*(x+1)));
                    }
                }else{
                    partsL.push(fullValueL);
                }

                if (fullValueR != undefined && fullValueR.length > this.XML_VALUE_SIZE){
                    nPartsR = Math.floor(fullValueR.length/this.XML_VALUE_SIZE) + 1;
                    for (var x = 0; x < nPartsR; x++){
                        partsR.push(fullValueR.slice(this.XML_VALUE_SIZE*x,this.XML_VALUE_SIZE*(x+1)));
                    }
                }else{
                    partsR.push(fullValueR);
                }
                
                var nParts = Math.max(partsL.length,partsR.length);

                if (nParts == 1){// process short lines in separate block for optimization
                    this.indexMap.push(this.counter);
                    // add only 1 obj to rowCollection
                    this.rowCollection.push({number:        this.nCounter+1,
                                            level:          level,
                                            guid:           guid,
                                            margin:         margin,
                                            tag:            name,
                                            displayedKey:   displayedKey,
                                            DiffType:       obj.DiffType,
                                            NewData:        obj.NewData,// newdata used as bkup
                                            OldData:        fullValueL,
                                            DiffAction:     obj.DiffAction,
                                            DiffViewValue:  fullValueR,
                                            Diffstyle:      obj.Diffstyle} );
                    this.counter++;
                    this.nCounter++;
                }else{// at least 1 line is long

                     for (var x = 0; x < nParts; x++){
                        // form data for left and right lines
                        var partNewData = (x >= partsR.length) ? undefined : partsR[x];
                        var partOldData = (x >= partsL.length) ? undefined : partsL[x];
                        if (x < partsR.length - 1) partNewData += nbl;
                        if (x < partsL.length - 1) partOldData += nbl;

                        var partDiffViewValue = obj.DiffAction ? partOldData : partNewData;

                        if (x == 0){// push the 1st row with all needed info about next parts
                            this.indexMap.push(this.counter);
                            this.rowCollection.push({number:  this.nCounter+1,
                                                    level:    level,
                                                    guid:     guid,
                                                    margin:   margin,
                                                    tag:      name,
                                                    displayedKey: displayedKey,
                                                    parts:     nParts,
                                                    DiffType:  obj.DiffType,
                                                    NewData:   partNewData,// newdata used as bkup
                                                    OldData:   partOldData,
                                                    DiffAction:obj.DiffAction,
                                                    DiffViewValue:partDiffViewValue,
                                                    FullNewData:  obj.NewData,
                                                    FullOldData:  fullValueL,
                                                    FullDiffViewValue: fullValueR,
                                                    Diffstyle:    obj.Diffstyle} );
                        }else{// form continuos line with margin
                            this.rowCollection.push({level:    level,
                                                    guid:      guid,
                                                    margin:    multi_margin,
                                                    displayedKey: '',
                                                    DiffType:  obj.DiffType,
                                                    NewData:   partNewData,
                                                    OldData:   partOldData,
                                                    DiffViewValue: partDiffViewValue,
                                                    DiffAction:    obj.DiffAction,
                                                    Diffstyle:     obj.Diffstyle} );
                        }
                        this.counter++;
                    }
                    this.nCounter++;
                }
                return (obj.DiffType === UNCHANGED)? 0 : 1;
        }
            
        const LENGTH_DEVIATION = 10;

        Editor.prototype._splitByLength = function(parts, str, size){// length of str always >= size
            	const STRSIZE = str.length;
            	// get the partial line
            	var cutPoint = 0;
            	var endPoint = 0;
            	var isNext = true;
            	while (isNext ){
            		endPoint = (cutPoint+size > STRSIZE)? STRSIZE : (cutPoint+size);
            		isNext = (endPoint < STRSIZE);// if not a last line, add a nbl 
            		var part = str.slice(cutPoint, endPoint) + (isNext ? nbl:'');
            		
            		var correctedEndPoint =  this._getNearsetSpace(part, size);
            		if (correctedEndPoint != -1){// found a space|comma, do not add nbl
            			part = str.slice(cutPoint, cutPoint + correctedEndPoint);	
            			cutPoint = 	cutPoint + correctedEndPoint;
            		}else{
            			cutPoint = endPoint;
            		}
            		parts.push(part);
 
            	}
        }
            
        Editor.prototype._getNearsetSpace = function(part, size){// return this.index, if exist, else -1
            	if (part == undefined || part == '') return -1;
            	var i = part.lastIndexOf(' ');
            	var i1 = part.lastIndexOf(',');
            	if (i != -1){
            		if ((size - i) < LENGTH_DEVIATION) return i+1;
            	}
            	if (i1 != -1){
            		if ((size - i1) < LENGTH_DEVIATION) return i1+1;
            	}
            	return -1;
        }

        Editor.prototype._getMaxSize = function(line, compareValue){
                if (line != undefined){
                    return line.length > compareValue? line.length:compareValue;
                }else{
                    return compareValue;
                }
        }

        Editor.prototype._getDoubleMaxSize = function(line1, line2, compareValue){
                if (line1 != undefined && line2 != undefined){
		    var len = Math.max(line1.length, line2.length);		
                    return len > compareValue? len : compareValue;
                }else{
                    return compareValue;
                }
        }

        Editor.prototype._MaxSize = function(line1, line2, compareValue){
                if (line1 != undefined && line2 != undefined){
			
                    return line.length > compareValue? line.length:compareValue;
                }else{
                    return compareValue;
                }
        }

            
        Editor.prototype.createItemTxtLine  = function(obj){
                var DiffType;
                var fullValueR;
                var fullValueL;
                var displayedR;
                var displayedL;
		var left, right;

                if (obj.removed != undefined){
                    DiffType = 'deleted';
                    Diffstyle = {'background-color':COLOR_DELETED};
                    fullValueL = obj.value;
		    this.lCounter ++;
		    left = this.lCounter;
                    this.maxLineSize = this._getMaxSize(obj.value, this.maxLineSize);// calc the max value of wide for display full-length in 1 line
                }else if ( obj.added != undefined){
                    DiffType = 'created';
                    Diffstyle = {'background-color':COLOR_CREATED};
                    fullValueR = obj.value;
		    this.rCounter ++;
		    right = this.rCounter;
                    this.maxLineSize = this._getMaxSize(obj.value, this.maxLineSize);
                }else if ( obj.replaced != undefined){
                    DiffType = 'updated';
                    Diffstyle = {'background-color':COLOR_UPDATED};
                    fullValueL = obj.oldValue;
                    fullValueR = obj.newValue;
                    this.maxLineSize = this._getMaxSize(obj.newValue, this.maxLineSize);
                }else {
                    DiffType = 'unchanged';
                    Diffstyle = {};
                    fullValueR = obj.valuer;
                    fullValueL = obj.valuel;
		    this.lCounter ++;
		    this.rCounter ++;
		    left = this.lCounter;
		    right = this.rCounter;
                    this.maxLineSize = this._getDoubleMaxSize(obj.valuer, obj.valuel, this.maxLineSize);
                }

                if (fullValueR != undefined) displayedR = this._normalizeString(fullValueR);
                if (fullValueL != undefined) displayedL = this._normalizeString(fullValueL);
                
                // cut value on parts (multiply lines), if length > this.VALUE_SIZE
                var partsL = [];
                var partsR = [];

                if (displayedL != undefined && displayedL.length > this.VALUE_SIZE){
                    this._splitByLength(partsL, displayedL, this.VALUE_SIZE);
                    nPartsL = partsL.length;
                }

                if (displayedR != undefined && displayedR.length > this.VALUE_SIZE){
                    this._splitByLength(partsR, displayedR, this.VALUE_SIZE);
                    nPartsR = partsR.length;
                }
                
                var nParts = Math.max(partsL.length, partsR.length);
                if (nParts == 0){// process short lines in separate block for optimization

                    this.indexMap.push(this.counter);
                    this.rowCollection.push({number:  this.nCounter+1,
					    number1:  left,
					    number2:  right,	
                                            guid:     this.nCounter,
                                            DiffType: DiffType,
                                            NewData:  displayedR,// newdata used as bkup
                                            OldData:  displayedL,
                                            DiffViewValue: displayedR,
                                            FullNewData:   fullValueR,// newdata used as bkup
                                            FullOldData:   fullValueL,
                                            DiffAction:    false,
                                            FullDiffViewValue: fullValueR,
                                            Diffstyle: Diffstyle} );
                    this.counter++;
                    this.nCounter++;
                }else{
                     for (var x = 0; x < nParts; x++){
                        // form data for left and right lines
                        var partNewData, partOldData;
                        if (x == 0 && partsR.length == 0){
                            partNewData = displayedR;
                        }else{
                            partNewData = (x >= partsR.length) ? undefined : partsR[x];// nullify all strings with number > another side array length
                        }
                        if (x == 0 && partsL.length == 0){
                            partOldData = displayedL;
                        }else{
                            partOldData = (x >= partsL.length) ? undefined : partsL[x];
                        }
                        
                        var partDiffViewValue = obj.DiffAction ? partOldData : partNewData;

                        if (x == 0){// push the 1st row with all needed info about next parts
                            this.indexMap.push(this.counter);
                            this.rowCollection.push({number:    this.nCounter+1,
						    number1:   left,
						    number2:   right,	
                                                    guid:       this.nCounter,
                                                    parts:      nParts,
                                                    DiffType:   DiffType,
                                                    NewData:    partNewData,// newdata used as bkup
                                                    OldData:    partOldData,
                                                    DiffViewValue: partDiffViewValue,
                                                    FullNewData:   fullValueR,// newdata used as bkup
                                                    FullOldData:   fullValueL,
                                                    DiffAction:    false,
                                                    FullDiffViewValue: fullValueR,
                                                    Diffstyle:         Diffstyle} );
                        }else{// form continuos line (without number and parts fields )
                            this.rowCollection.push({
                                            DiffType:   DiffType,
                                            NewData:    partNewData,// newdata used as bkup
                                            OldData:    partOldData,
                                            DiffAction: false,
                                            DiffViewValue:  partDiffViewValue,
                                            Diffstyle:      Diffstyle} );
                        }
                        this.counter++;
                    }
                    this.nCounter++;
                }
        }

			            
        Editor.prototype._normalizeString = function(str){
            	return str.replace(new RegExp('\t', 'g'),' ');
        }
            
                 

        Editor.prototype._getId = function(){
                this.guidCounter++;
                return (this.guidCounter - 1);
        }

        Editor.prototype._isAttr = function(arrayKeys){
		if (arrayKeys == undefined) return false;
		for (var x  = 0; x < arrayKeys.length; x++){
			if (arrayKeys[x] != undefined && arrayKeys[x].charAt(0) !== '_' ) return false;
		}
		return true;
        }


        Editor.prototype._verifyEmptiness = function(obj4analysis){
//                this.isEmpty = false;
		if (this.superTag && obj4analysis[this.superTag]){
			var keySet = Object.keys(obj4analysis[this.superTag]);
			if (keySet == undefined || keySet.length == 0 || (keySet.length > 0 && this._isAttr(keySet)) ){
				this.isEmpty = true;
			}
		}
        }


        Editor.prototype.linearize = function(obj4analysis, margin, level, guid, isFinal){
            	if (obj4analysis == undefined) return 0;
            	this._verifyEmptiness(obj4analysis);
                var keys = [];
                for (var key in obj4analysis) {
                	if (obj4analysis.hasOwnProperty(key)){
                    		keys.push(key);
                        }
                }

                var delta = 0;
                for (var x = 0; x < keys.length; x++) {
                    var key = keys[x];
                    var ob = obj4analysis[key];
                    var symb = (x == keys.length-1) ? FINAL_SYM:FORK_SYM;
                    var nextMargin = (x == keys.length-1) ?  ONESPACE:  CONTINUE_SYM;

                    if (isObject(ob)){
                        if (ob['DiffType'] != undefined){// a leaf is found
                            delta += this.createItem(key,ob,symb,level,guid,margin);
                            if (ob.DiffType != UNCHANGED){
                            	this.isEqual = false;
                            }
                        }else{// push to array a key record, parse next level with increased margin
                            var id = this.createWrapperItem(key, symb, level, guid, margin);
                            var nChanges = this.linearize(ob, margin+nextMargin, level+1, guid+1, x == keys.length-1);
                            this.deltaMap[id] = nChanges;//collects changes for all lower levels entries - used to hide/show modefied
                            delta += nChanges;
                        }
                    }

                    if (isArray(ob)){
                        var counter = 0;
                        for (var i = 0; i < ob.length; i++){
                        	var symb = (i == ob.length-1 && x == keys.length-1) ? FINAL_SYM : FORK_SYM;
                            var nextMargin = (i == ob.length-1 && x == keys.length-1) ?  ONESPACE :  CONTINUE_SYM;
                            var obj = ob[i];
                            if (obj['DiffType'] != undefined){// a leaf is found
                            	var id = this.createItem(key, obj, symb, level, guid, margin);
                            	if (obj.DiffType != UNCHANGED){
                            		this.isEqual = false;
                            	}
                            }else{
	                        	var id = this.createWrapperItem(key, symb, level, guid, margin);
    	                        var nChanges =  this.linearize(obj, margin+nextMargin, level+1, (guid + '#' + counter++), i == ob.length-1 && x == keys.length-1);// for every elems of array set a different guid
        	                    this.deltaMap[id] = nChanges; 
            	                delta += nChanges;
                            }
                        }
                    }
                }

                return delta;

                function isFunction(obj) {
                    return {}.toString.apply(obj) === '[object Function]';
                }
                function isArray(obj) {
                    return {}.toString.apply(obj) === '[object Array]';
                }
                function isObject(obj) {
                    return {}.toString.apply(obj) === '[object Object]';
                }
                function isValue(obj) {
                    return !isObject(obj) && !isArray(obj);
                }
    
        }
            
        Editor.prototype.linearizeText = function(array4analysis){
                if (array4analysis != null && array4analysis.length > 0){
                    for (var x = 0; x < array4analysis.length; x++){
                        this.createItemTxtLine(array4analysis[x]);
                    }
                }
        }
		
		Editor.prototype.updateRow = function(id){
                var index = this.indexMap[id];
                var rec = this.rowCollection[index];
                var rows = rec.parts;
                if (rows == undefined){// short line case
                    rec.DiffViewValue = rec.DiffAction ? rec.NewData : rec.OldData;
                    rec.DiffAction = rec.DiffAction ? false : true;
                }else{// update row # this.indexMap[id] + parts
                    for (var i = 0; i < rows; i++ ){
                        rec = this.rowCollection[index + i];
                        rec.DiffViewValue = rec.DiffAction ? rec.NewData : rec.OldData;
                        rec.DiffAction = rec.DiffAction ? false : true;
                    }
                }
        }

        Editor.prototype.calculateTopMedian = function(diff1){
                if (diff1 == undefined) return 0;

                for (var x = 0; x < diff1.length; x++){
                	this.lineSizes.push(diff1[x].value ? diff1[x].value.length: diff1[x].newValue ? diff1[x].newValue.length : 0);
                }
                if (this.lineSizes.length == 0) return 0;
                this.lineSizes.sort();
                var topIndex = Math.floor(this.lineSizes.length*topPercent);
                var mSize = this.lineSizes[topIndex];
        }
            

        /**
         *  Updates all rows data, if clicked by copyall button
         */
        Editor.prototype.updateAll = function(direct){
                    for (var i = 0; i < this.rowCollection.length; i++){
                        var rec = this.rowCollection[i];
                        if (rec.DiffType != undefined && rec.DiffType != UNCHANGED){

                            rec.DiffViewValue = direct ? rec.OldData : rec.NewData;
                            rec.DiffAction = direct ? true:false;
                        }
                    }
                    this.editor.copyAllFlag = this.editor.copyAllFlag ? false:true;
        }

        Editor.prototype.copyAll = function(directCopy) {
                this.updateAll(directCopy);
        }


        /**
         *  algorithm = 1: if show all/changed box clicked, 
         *              2: if ignore WS box clicked, correct type & style for each related row 
         */
        Editor.prototype.updateList = function(showAll){
                this.viewCollection = [];
                // accumulative map to 
                var displayBlocksMap = {};

                if (showAll == true){
                    for (var i = 0; i < this.rowCollection.length; i++){
                    	var row = this.rowCollection[i];
                    	this.viewCollection.push(row); 
                    }
                }else{// only key rows with non-zero deltas and rows with changed values
                    // only key rows with non-zero deltas and rows with changed values
                    if (this.fileType === XML){
                        var bShow = undefined;
                        var importantTags = (typeSupertagMap[this.superTag] && LinkingDB[typeSupertagMap[this.superTag]])? LinkingDB[typeSupertagMap[this.superTag]].keySet : {}; 

                        for (var i = 0; i < this.rowCollection.length; i++){
                            var row = this.rowCollection[i]; // get pointer to rowCollection elements
                            // form access key
                            var displayKey = row.guid+'@'+row.level;
                            if (bShow != undefined){
                                // remove key from display map if it was put earlier
                                if (displayBlocksMap[displayKey] != undefined){
                                    delete displayBlocksMap[displayKey];
                                }
                                displayBlocksMap[displayKey] = bShow;
                                bShow = undefined;
                            }

                            if (row.isKey){
                                if (this.deltaMap[row.id] > 0){
                                    this.viewCollection.push(row);
                                    bShow = true;// set flag to show elems on the row.guid@row.level
                                }else{
                                    bShow = false;
                                }
                            }else if (displayBlocksMap[displayKey]){
                                if (row.level == 1){// top level
                                    if (row.DiffType != UNCHANGED){
                                        this.viewCollection.push(row);
                                    }
                                }else{
                                    if (row.DiffType != UNCHANGED || importantTags[row.tag])
                                        this.viewCollection.push(row);
                                }
                            }else if (row.tag === XMLNS && !this.isEqual){// always show parameters in list
                                this.viewCollection.push(row);
                            }
                        }
                        
                    }else if (this.fileType === NONXML){// truncated for texts
                        if (this.rowCollection.length == 0) return;
                    
                        for (var i = 0; i < this.rowCollection.length; i++){
                            var row = this.rowCollection[i];
                            if (row.DiffType != UNCHANGED){
                                this.viewCollection.push(row);
                            }
                        }
                    }

                }
                this._updateExt();
        }
            
        Editor.prototype.correctList = function(ignoreWS){// correct DiffType field in accordance with flag yes/no  (for white spaces)
            	// correcting the rows according to chosen algorithm
            	for (var i = 0; i < this.rowCollection.length; i++){
                    var row = this.rowCollection[i];
                    if (ignoreWS == false){//
            			if (row.DiffTypeBk != undefined){// restore only _changed_ values
            				row.DiffType = row.DiffTypeBk;
            				row.Diffstyle = row.DiffstyleBk; 
            			}
	            	}else { // correct  type & style for each updated row  [not] taking in account WS
           		 	if (row.DiffType == UPDATED){
					if (row.NewData != undefined && row.OldData != undefined){
	            				if (row.NewData.replace(/\s/g,'') == row.OldData.replace(/\s/g,'')){
        	    					row.DiffstyleBk = row.Diffstyle;
			            			row.DiffTypeBk = row.DiffType;
            						row.DiffType = UNCHANGED;
	            					row.Diffstyle = {};
    	        				}
					}
        	    		}
            		}
            	}

        }
            
        Editor.prototype.correctXmlMargines = function(bChangesOnly){
                var bChangesOnly = this.editor.changesOnly;
                if (bChangesOnly){
                    var  mArray = this._generateArrayOfMargins();
                    
                    for (var i = 1; i < this.viewCollection.length; i++){
                        var row = this.viewCollection[i]; // get pointer to [displayed] row
                        var curMargin = row.margin;
                        if (curMargin != undefined  && curMargin.length > 0){
                            row.oldMargin = curMargin;
                            row.margin = this._createMargin(mArray[i-1]);
                        }
                    }
                }else{
                    for (var i = 0; i < this.rowCollection.length; i++){
                        var row = this.rowCollection[i];
                        if (row.oldMargin != undefined){
                            row.margin = row.oldMargin;
                        }
                    }
                }
                this._updateExt();
        }

        Editor.prototype._updateExt = function(){
            this.editor.viewCollection = this.viewCollection;
        }

        Editor.prototype.updateView = function($scope,$timeout){
		$timeout(function() {
	        	 $scope.editor.viewCollection = this.viewCollection;
		}, 8);
        }
            
        Editor.prototype._generateArrayOfMargins =    function(){
                var mArray = [];
                var maxdeep = 0;
                for (var i = 1; i < this.viewCollection.length; i++){
                    var mStr = this.viewCollection[i].margin;// every line has a margin
                    var line = [];
                    if (mStr != undefined && mStr !=''){
                        for (var j = 2; j < mStr.length; j ++){
                            line.push(this._getToken(mStr[j]));   
                        }
                    }
                    mArray.push(line);
                    maxdeep = (maxdeep < line.length)? line.length: maxdeep;
                }

                for (var j = 1 ; j < maxdeep; j++){//iterate over all levels, except 0; j == (index in each array)
                    var start = 100000;
                    // in each cycle iterate over all lines
                    for (var i = 0; i < mArray.length; i++){
                        //check is current line include j-level
                        if (mArray[i].length < j+1){//end of sequence
                            if (i-start > 1){//replace symbol@start, delete all from (start+1, i)
                                this._updateArray(mArray,start,i,j);
                                start = 100000;
                            }
                        }
                        if (mArray[i].length > j){
                            if (mArray[i][j] == 2 || mArray[i][j] == 3){// check is analysed symbol fork
                                start = i;
                            }
                        }
                    }
                }
                return mArray;
        }
            
        const SYMBOLS = [ONESPACE, CONTINUE_SYM, FORK_SYM, FINAL_SYM];
            
        Editor.prototype._createMargin =    function(marginAsArray){
                if (marginAsArray == undefined) return '';
                var margin = ONESPACE;
                for (var x = 0; x < marginAsArray.length; x++){
                    margin += SYMBOLS[marginAsArray[x]];
                }
                return margin;
        }
            
        Editor.prototype._updateArray =     function (array, start, end, level){
                if (array[ start + 1][level] == 1) array[start][level] = 3;// replace with end sym only if next is continues
                for(var x = start + 1; x < end; x++){
                    if (array[x][level] == 1) array[x][level] = 0;
                }
        }
            
            
        Editor.prototype._getToken =     function (token){
                if (token === FINAL_SYM)  return 3 ;
                if (token === FORK_SYM) return  2;
                if (token === CONTINUE_SYM) return 1;
                return 0;
        }



