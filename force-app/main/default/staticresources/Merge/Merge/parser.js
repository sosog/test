
var JSONParser = function(json,opt){
	this.schema = {};
	this.levels = 0;
	this.tagsArray = [];
	this.tagsMap = {};
	this.emptyTagsMap = {};
	this.displayedNumber = 0;
	this.nTag = 0;
	this.mainTag;
	this.offSets = {};
	this.EMPTY = '\u00a0\u00a0\u00a0\u00a0';
	this.FORK = this.EMPTY+'├';
	this.CONT = this.EMPTY+'│';
	this.TERM = this.EMPTY+'└';
	this.jsonView;
	this.json = json;
	this.rootNode;

	this.updatedId = {};
	this.removeAdded = {};
	this.addDeleted = {};

	if (opt){
		this.immutable = opt.immutable;
	}
}

JSONParser.prototype.isUpdateNeeded = function() {
	if (this.immutable && this.updated){
		return false;
	}
	return true;
}

JSONParser.prototype.getMap = function() {
	var mapped = {};
	var displayN = 1;
	for (var x = 0; x < this.tagsArray.length; x++){
		if (this.emptyTagsMap[x] != undefined){
		}else{
			mapped[x+1] = displayN;
			displayN ++;
		}
	}
	return mapped;
}

JSONParser.prototype.initParser = function() {
	this.addLevel();
	var superTags = this.__keys(this.json);
	if (superTags.length > 0){
		console.log('init parser');
		this.tagsArray = [];
		this.tagsMap = {};
		this.emptyTagsMap = {};
		this.schema = {};
		this.levels = 0;
		this.nTag = 0;
		this.mainTag = superTags[0];
		var level = this.getLevel(0);
		this.rootNode = {node:true, name:this.mainTag, level:0, num:this.nTag};
		this.addTag(level,this.rootNode);
		this.tagsArray.push(this.rootNode);
		this.tagsMap[this.nTag] = this.rootNode;
		this.nTag++;
		this.updatedId = {};
		this.removeAdded = {};
		this.addDeleted = {};
	}
	this.updated = true;
}

JSONParser.prototype.applyChanges = function(diff) {
	var composite = this.getView(diff);
	this.compile(composite);
}

JSONParser.prototype.compile = function(composite) {
//	this.json = null;
	var final = {};
	if (this.mainTag && composite && composite.isEmpty == false){
		final[this.mainTag] = composite.built;
	}
	this.json = final;
	return true;
}

///////////////////// TRASH ////////////////////
// JSONParser.prototype.addChanges = function(change) {
// 	if (change){
// 		if (change.op == 'a' || change.op == 'd'){
// 			var start = change['lhs-line-from'];
// 			var end = change['lhs-line-to'];
// 			if (start != undefined && end != undefined){
// 				for (var i = start; i < end+1; i++){
// 					var tag = this.tagsArray[i];
// 					if (tag && tag.id != undefined){
// 						if (change.op == 'd'){
// 							this.removeAdded[tag.id] = true;
// 						}else if (change.op == 'a'){
// 							this.addDeleted[tag.id] = true;
// 						}
// 					}
// 				}
// 			}
// 		}else if (change.op == 'c'){
// 			var start = change['lhs-line-from'];
// 			if (start != undefined){
// 				var tag = this.tagsArray[start];
// 				if (tag && tag.id != undefined){
// 					this.updatedId[tag.id] = true;
// 				}
// 			}
// 		}
// 	}
// 	//console.log('change:'+JSON.stringify(change));
// }
///////////////////// TRASH ////////////////////
JSONParser.prototype.addChanges = function(change) {
	if (change){
		if (change.op == 'a' || change.op == 'd'){
			var ids = change['ids'];
			console.log('change:',change);
			if (ids.length > 0){
				ids.forEach(changeId => {
					var tag = this.tagsArray[changeId];
					if (tag && tag.id != undefined){
						if (change.op == 'd'){
							this.removeAdded[tag.id] = true;
						}else if (change.op == 'a'){
							this.addDeleted[tag.id] = true;
						}
					}
				});
			}
		}else if (change.op == 'c'){
			var changedId = change['ids'];
			if (changedId.length > 0){
				var tag = this.tagsArray[changedId[0]];
				if (tag && tag.id != undefined){
					this.updatedId[tag.id] = true;
				}
			}
		}
	}
	//console.log('change:'+JSON.stringify(change));
}

JSONParser.prototype.getValue = function(patch){
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
            if (this.updatedId[patch.id]){
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
    }


JSONParser.prototype.getView = function(diff){
        var obj = {};
        if (this.__isUndefined(diff)) return ret;
        if (this.__isPatch(diff)){
            return this.getValue(diff); 
        }else if (this.__isObject(diff)){
            var ret = {built: obj, isEmpty: true};
            var isEmpty = true;
            for (var key in diff){
                if (diff.hasOwnProperty(key)){
                    var r = this.getView(diff[key]);
                    if (r.isEmpty == false){// do not add key at all
                    	obj[key] = r.built;
                	}
                    isEmpty = isEmpty && r.isEmpty;
                }
            }
            ret.isEmpty = isEmpty;
            return ret;
        }else if (this.__isArray(diff)){
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
    }



/**
 * curObj - ref to processed object
 * masterTagElem - ref to linked parent tag in this.tagsArray
 * 
 *
 */
JSONParser.prototype.addTagElem = function(name, l, masterTagElem, curObj) {
	var elem;
	var masterRef = 0;
	if (masterTagElem){
		masterRef = masterTagElem.num;
	}
	if (this.__isValue(curObj)){
		elem = {leaf:true, value: curObj, name:name, level: l+1, num:this.nTag, master:masterRef};
	}else{
		elem = {node:true, value: curObj, name:name, level: l+1, num:this.nTag, master:masterRef};
	}
	var level = this.getLevel(l);
	this.addTag(level,elem);
	this.tagsArray.push(elem);
	this.tagsMap[this.nTag] = elem;
	this.nTag ++;
	this.displayedNumber ++;
	return elem;
}

/**
 * Add only empty tag, containing all info about linked object to make changes
 */
JSONParser.prototype.addEmptyTagElem = function(name, level, masterTagElem) {
	var masterRef = 0;
	if (masterTagElem){
		masterRef = masterTagElem.num;
	}
	var elem = {placeholder:true, level: level+1, num:this.nTag, master:masterRef};
	this.tagsArray.push(elem);
	this.emptyTagsMap[this.displayedNumber] = true;
	this.displayedNumber ++;
	return elem;	
}

/**
 *	Levels methods
 */



JSONParser.prototype.getLevel = function(level) {
	return (this.schema[level] != undefined) ? this.schema[level] : this.addLevel();
}

JSONParser.prototype.addLevel = function() {
	var level = {};
	level.tags = [];
	level.index = -1;// points at last elem on the level 
	level.counter = 0;

	this.schema[this.levels] = level;
	this.levels ++;
	return level;
}


JSONParser.prototype.addTag = function(level,tag) {
	tag.numOnLevel = level.counter++;
	level.tags.push(tag);
	level.index = tag.num;
}

JSONParser.prototype.getLastTag = function(level) {
	var lev = this.schema[level];
	if (lev){
		if (lev.index > -1){
			return lev.tags[lev.index];
		}
	}
}


JSONParser.prototype.getTree = function() {

	var tree = '';
	this.initOffsets();

	var l = -1;// always contains last processed level	
	for (var x = 0; x < this.tagsArray.length; x++){
		var tag = this.tagsArray[x];
		tag.countLine = 1;
		if (tag.placeholder){
			tree += '\n';
		 	continue;
		}
		if (tag.level > l){//a new branch of tree has been opened - update 
			this.offSets[l] = (this.offSets[l] == this.TERM) ? this.EMPTY : this.CONT;// previous changed
		}else if (tag.level < l){// level has been closed - emptify all on interval [tag.level,level]
			this.emptifyRange(tag.level,l);
		}
		this.offSets[tag.level] = (this.isTerminal(tag) == true) ? this.TERM : this.FORK;
		l = tag.level;
		var line = this.getOffset(tag.level) + tag.name;
		if (tag.leaf == true){
			///////////////////// TRASH ////////////////////
			//line += ': ' + this.exludeEOL(tag.value);
			///////////////////// TRASH ////////////////////
			var lineWithTabs = tag.value.split('\n').join('\n'+this.CONT.repeat(tag.level)+this.EMPTY);
			line += ': ' + lineWithTabs;
			tag.countLine = tag.value.split('\n').length;
		}
		tree += line + '\n';
	}
	return tree;
}

JSONParser.prototype.initOffsets = function() {
	this.offSets = {};
}

JSONParser.prototype.getLine = function(lineNumber) {
	return this.tagsMap[lineNumber];
}

/**
 *	Merge line from Right panel to Left at point atLineNumber
 *	Operation type:
 *	c - replace
 *	a - add to json
 *	d - remove from json
 * {"lhs-line-from":21,"lhs-line-to":21,"rhs-line-from":21,"rhs-line-to":21,"op":"c","lhs-y-start":382.5,"lhs-y-end":400.5,"rhs-y-start":382.5,"rhs-y-end":400.5}
 */
JSONParser.prototype.mergeLine = function(change, line) {
	var op = change.op;
	var isSynced = false;

	/* sync changes from view layer if needed */
	if (isSynced == false){
//		this.json = this.jsonView;
	}	

}


/**
 *	Removing elem from arr
 */
JSONParser.prototype.mergeArray = function(arr, index) {
	if (arr != undefined && index != undefined){
		var newArr = [];
		if (arr[index] != undefined){
			arr.splice(index, 1);
			return;
		}
	}
}

/**
 *	if level: 3->1, then erase #3 & #2
 */
JSONParser.prototype.emptifyRange = function(start,end) {
	for (var x = start+1; x < end+1; x++){
		this.offSets[x] = this.EMPTY;
	}
}

JSONParser.prototype.getOffset = function(level) {
	var offset = '';
	for (var x = 1; x < level + 1 ; x ++){
		offset += this.offSets[x];
	}
	return offset;
}

/**
 *	Check that the current tag is last on the Block by 2 criterias:
 *	1) the current tag is the last one on the level
 *	2) they both have the same master
 */
JSONParser.prototype.isTerminal = function(tag) {
//	console.log('isTerminal? '+JSON.stringify(tag));
	if (tag && tag.placeholder) return false;
	var level = this.schema[tag.level-1];
	if (level){
		if (level.index == tag.num){// true if the current tag is the last one on the level
			return true;
		}else{// pick up next tag and verify they both have the same master
			var nextTag = level.tags[tag.numOnLevel+1];
			if (nextTag){
				return (tag.master != nextTag.master);
			}else{
				// algorithm should not go here
				return true;
			}
		}
	}
	return false;
}


JSONParser.prototype.exludeEOL = function(subObj){
	if (subObj){
		return subObj.replace(/(\r\n|\n|\r)/g,"\\n");
	}
	return subObj;
}




JSONParser.prototype.__keys = function(obj) {
	return Object.keys(obj);
}

JSONParser.prototype.__isPatch = function(obj) {
            return obj.compare != undefined;
        },


JSONParser.prototype.__isArray = function(obj) {
                                return {}.toString.apply(obj) === '[object Array]';
}
JSONParser.prototype.__isObject = function(obj) {
                                return {}.toString.apply(obj) === '[object Object]';
}
JSONParser.prototype.__isValue = function(obj) {
                                return !this.__isObject(obj) && !this.__isArray(obj);
}
JSONParser.prototype.__isUndefined = function(obj) {
                               return obj === undefined || obj === null || obj === '';
}

