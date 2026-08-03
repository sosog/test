/***
This is part of jsdifflib v1.0. <http://snowtide.com/jsdifflib>


Copyright (c) 2007, Snowtide Informatics Systems, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

	* Redistributions of source code must retain the above copyright notice, this
		list of conditions and the following disclaimer.
	* Redistributions in binary form must reproduce the above copyright notice,
		this list of conditions and the following disclaimer in the documentation
		and/or other materials provided with the distribution.
	* Neither the name of the Snowtide Informatics Systems nor the names of its
		contributors may be used to endorse or promote products derived from this
		software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
  Author: Chas Emerick <cemerick@snowtide.com> 
  Updated: Alexey Kalutov <k5771k@gmail.com>  added the function get_difference_array
***/

/*** 
  Copyright (c) 2016 by Jamie Peabody, http://www.mergely.com
  All rights reserved.
  Version: 3.4.3 2016-09-07
 ***/


var __whitespace = {" ":true, "\t":true, "\n":true, "\f":true, "\r":true};

var difflib = {
	defaultJunkFunction: function (c) {
		return __whitespace.hasOwnProperty(c);
	},
	
	stripLinebreaks: function (str) { return str.replace(/^[\n\r]*|[\n\r]*$/g, ""); },
	
	stringAsLines: function (str) {
		var lfpos = str.indexOf("\n");
		var crpos = str.indexOf("\r");
		var linebreak = ((lfpos > -1 && crpos > -1) || crpos < 0) ? "\n" : "\r";
		
		var lines = str.split(linebreak);
		for (var i = 0; i < lines.length; i++) {
			lines[i] = difflib.stripLinebreaks(lines[i]);
		}
		
		return lines;
	},
	
	// iteration-based reduce implementation
	__reduce: function (func, list, initial) {
		if (initial != null) {
			var value = initial;
			var idx = 0;
		} else if (list) {
			var value = list[0];
			var idx = 1;
		} else {
			return null;
		}
		
		for (; idx < list.length; idx++) {
			value = func(value, list[idx]);
		}
		
		return value;
	},
	
	// comparison function for sorting lists of numeric tuples
	__ntuplecomp: function (a, b) {
		var mlen = Math.max(a.length, b.length);
		for (var i = 0; i < mlen; i++) {
			if (a[i] < b[i]) return -1;
			if (a[i] > b[i]) return 1;
		}
		
		return a.length == b.length ? 0 : (a.length < b.length ? -1 : 1);
	},
	
	__calculate_ratio: function (matches, length) {
		return length ? 2.0 * matches / length : 1.0;
	},
	
	// returns a function that returns true if a key passed to the returned function
	// is in the dict (js object) provided to this function; replaces being able to
	// carry around dict.has_key in python...
	__isindict: function (dict) {
		return function (key) { return dict.hasOwnProperty(key); };
	},
	
	// replacement for python's dict.get function -- need easy default values
	__dictget: function (dict, key, defaultValue) {
		return dict.hasOwnProperty(key) ? dict[key] : defaultValue;
	},	
	
	SequenceMatcher: function (a, b, isjunk) {
		this.set_seqs = function (a, b) {
			this.set_seq1(a);
			this.set_seq2(b);
		}
		
		this.set_seq1 = function (a) {
			if (a == this.a) return;
			this.a = a;
			this.matching_blocks = this.opcodes = null;
		}
		
		this.set_seq2 = function (b) {
			if (b == this.b) return;
			this.b = b;
			this.matching_blocks = this.opcodes = this.fullbcount = null;
			this.__chain_b();
		}
		
		this.__chain_b = function () {
			var b = this.b;
			var n = b.length;
			var b2j = this.b2j = {};
			var populardict = {};
			for (var i = 0; i < b.length; i++) {
				var elt = b[i];
				if (b2j.hasOwnProperty(elt)) {
					var indices = b2j[elt];
					if (n >= 200 && indices.length * 100 > n) {
						populardict[elt] = 1;
						delete b2j[elt];
					} else {
						indices.push(i);
					}
				} else {
					b2j[elt] = [i];
				}
			}
	
			for (var elt in populardict) {
				if (populardict.hasOwnProperty(elt)) {
					delete b2j[elt];
				}
			}
			
			var isjunk = this.isjunk;
			var junkdict = {};
			if (isjunk) {
				for (var elt in populardict) {
					if (populardict.hasOwnProperty(elt) && isjunk(elt)) {
						junkdict[elt] = 1;
						delete populardict[elt];
					}
				}
				for (var elt in b2j) {
					if (b2j.hasOwnProperty(elt) && isjunk(elt)) {
						junkdict[elt] = 1;
						delete b2j[elt];
					}
				}
			}
	
			this.isbjunk = difflib.__isindict(junkdict);
			this.isbpopular = difflib.__isindict(populardict);
		}
		
		this.find_longest_match = function (alo, ahi, blo, bhi) {
			var a = this.a;
			var b = this.b;
			var b2j = this.b2j;
			var isbjunk = this.isbjunk;
			var besti = alo;
			var bestj = blo;
			var bestsize = 0;
			var j = null;
			var k;
	
			var j2len = {};
			var nothing = [];
			for (var i = alo; i < ahi; i++) {
				var newj2len = {};
				var jdict = difflib.__dictget(b2j, a[i], nothing);
				for (var jkey in jdict) {
					if (jdict.hasOwnProperty(jkey)) {
						j = jdict[jkey];
						if (j < blo) continue;
						if (j >= bhi) break;
						newj2len[j] = k = difflib.__dictget(j2len, j - 1, 0) + 1;
						if (k > bestsize) {
							besti = i - k + 1;
							bestj = j - k + 1;
							bestsize = k;
						}
					}
				}
				j2len = newj2len;
			}
	
			while (besti > alo && bestj > blo && !isbjunk(b[bestj - 1]) && a[besti - 1] == b[bestj - 1]) {
				besti--;
				bestj--;
				bestsize++;
			}
				
			while (besti + bestsize < ahi && bestj + bestsize < bhi &&
					!isbjunk(b[bestj + bestsize]) &&
					a[besti + bestsize] == b[bestj + bestsize]) {
				bestsize++;
			}
	
			while (besti > alo && bestj > blo && isbjunk(b[bestj - 1]) && a[besti - 1] == b[bestj - 1]) {
				besti--;
				bestj--;
				bestsize++;
			}
			
			while (besti + bestsize < ahi && bestj + bestsize < bhi && isbjunk(b[bestj + bestsize]) &&
					a[besti + bestsize] == b[bestj + bestsize]) {
				bestsize++;
			}
	
			return [besti, bestj, bestsize];
		}
		
		this.get_matching_blocks = function () {
			if (this.matching_blocks != null) return this.matching_blocks;
			var la = this.a.length;
			var lb = this.b.length;
	
			var queue = [[0, la, 0, lb]];
			var matching_blocks = [];
			var alo, ahi, blo, bhi, qi, i, j, k, x;
			while (queue.length) {
				qi = queue.pop();
				alo = qi[0];
				ahi = qi[1];
				blo = qi[2];
				bhi = qi[3];
				x = this.find_longest_match(alo, ahi, blo, bhi);
				i = x[0];
				j = x[1];
				k = x[2];
	
				if (k) {
					matching_blocks.push(x);
					if (alo < i && blo < j)
						queue.push([alo, i, blo, j]);
					if (i+k < ahi && j+k < bhi)
						queue.push([i + k, ahi, j + k, bhi]);
				}
			}
			
			matching_blocks.sort(difflib.__ntuplecomp);
	
			var i1 = 0, j1 = 0, k1 = 0, block = 0;
			var i2, j2, k2;
			var non_adjacent = [];
			for (var idx in matching_blocks) {
				if (matching_blocks.hasOwnProperty(idx)) {
					block = matching_blocks[idx];
					i2 = block[0];
					j2 = block[1];
					k2 = block[2];
					if (i1 + k1 == i2 && j1 + k1 == j2) {
						k1 += k2;
					} else {
						if (k1) non_adjacent.push([i1, j1, k1]);
						i1 = i2;
						j1 = j2;
						k1 = k2;
					}
				}
			}
			
			if (k1) non_adjacent.push([i1, j1, k1]);
	
			non_adjacent.push([la, lb, 0]);
			this.matching_blocks = non_adjacent;
			return this.matching_blocks;
		}
		
		this.get_opcodes = function () {
			if (this.opcodes != null) return this.opcodes;
			var i = 0;
			var j = 0;
			var answer = [];
			this.opcodes = answer;
			var block, ai, bj, size, tag;
			var blocks = this.get_matching_blocks();
			for (var idx in blocks) {
				if (blocks.hasOwnProperty(idx)) {
					block = blocks[idx];
					ai = block[0];
					bj = block[1];
					size = block[2];
					tag = '';
					if (i < ai && j < bj) {
						tag = 'replace';
					} else if (i < ai) {
						tag = 'delete';
					} else if (j < bj) {
						tag = 'insert';
					}
					if (tag) answer.push([tag, i, ai, j, bj]);
					i = ai + size;
					j = bj + size;
					
					if (size) answer.push(['equal', ai, i, bj, j]);
				}
			}
			
			return answer;
		}

		this.get_difference_array  = function() {
			var diff = [];
			var opcodes = this.get_opcodes();
			// a - old array, b - new array
			if (opcodes == undefined || opcodes.length == 0) return diff;
			for (var x = 0; x < opcodes.length; x++){
				var elem = opcodes[x];
				var compare = elem[0];
				var from0 = elem[1];
				var till0 = elem[2];
				var from = elem[3];
				var till = elem[4];
				if (compare == 'equal'){
					for (var i = from; i < till; i++){
						diff.push({"value":this.b[i]});
					}
				}else if (compare == 'replace'){
					var diffa = till0 - from0;
					var diffb = till - from;
					if (diffa > diffb){// some lines deleted
						for (var i = from; i < till; i++){// for update
							diff.push({"replaced":true,"oldValue":(from0 < till0)?this.a[from0++]:"","newValue":this.b[i]});
						}
						for (var i = from0; i < till0; i++){
							diff.push({"removed":true,"value":this.a[i]});
						}
					}else{// some lines added
						for (var i = from0; i < till0; i++){// for update
							diff.push({"replaced":true,"oldValue":this.a[i],"newValue":(from < till)?this.b[from++]:""});
						}
						for (var i = from; i < till; i++){
							diff.push({"added":true,"value":this.b[i]});
						}
					}
				}else if (compare == 'insert'){
					for (var i = from; i < till; i++){
						diff.push({"added":true,"value":this.b[i]});
					}
				}else if (compare == 'delete'){
					for (var i = from0; i < till0; i++){
						diff.push({"removed":true,"value":this.a[i]});
					}
				}

			}

			return diff;
		}
		
		// this is a generator function in the python lib, which of course is not supported in javascript
		// the reimplementation builds up the grouped opcodes into a list in their entirety and returns that.
		this.get_grouped_opcodes = function (n) {
			if (!n) n = 3;
			var codes = this.get_opcodes();
			if (!codes) codes = [["equal", 0, 1, 0, 1]];
			var code, tag, i1, i2, j1, j2;
			if (codes[0][0] == 'equal') {
				code = codes[0];
				tag = code[0];
				i1 = code[1];
				i2 = code[2];
				j1 = code[3];
				j2 = code[4];
				codes[0] = [tag, Math.max(i1, i2 - n), i2, Math.max(j1, j2 - n), j2];
			}
			if (codes[codes.length - 1][0] == 'equal') {
				code = codes[codes.length - 1];
				tag = code[0];
				i1 = code[1];
				i2 = code[2];
				j1 = code[3];
				j2 = code[4];
				codes[codes.length - 1] = [tag, i1, Math.min(i2, i1 + n), j1, Math.min(j2, j1 + n)];
			}
	
			var nn = n + n;
			var group = [];
			var groups = [];
			for (var idx in codes) {
				if (codes.hasOwnProperty(idx)) {
					code = codes[idx];
					tag = code[0];
					i1 = code[1];
					i2 = code[2];
					j1 = code[3];
					j2 = code[4];
					if (tag == 'equal' && i2 - i1 > nn) {
						group.push([tag, i1, Math.min(i2, i1 + n), j1, Math.min(j2, j1 + n)]);
						groups.push(group);
						group = [];
						i1 = Math.max(i1, i2-n);
						j1 = Math.max(j1, j2-n);
					}
					
					group.push([tag, i1, i2, j1, j2]);
				}
			}
			
			if (group && !(group.length == 1 && group[0][0] == 'equal')) groups.push(group)
			
			return groups;
		}
		
		this.ratio = function () {
			matches = difflib.__reduce(
							function (sum, triple) { return sum + triple[triple.length - 1]; },
							this.get_matching_blocks(), 0);
			return difflib.__calculate_ratio(matches, this.a.length + this.b.length);
		}
		
		this.quick_ratio = function () {
			var fullbcount, elt;
			if (this.fullbcount == null) {
				this.fullbcount = fullbcount = {};
				for (var i = 0; i < this.b.length; i++) {
					elt = this.b[i];
					fullbcount[elt] = difflib.__dictget(fullbcount, elt, 0) + 1;
				}
			}
			fullbcount = this.fullbcount;
	
			var avail = {};
			var availhas = difflib.__isindict(avail);
			var matches = numb = 0;
			for (var i = 0; i < this.a.length; i++) {
				elt = this.a[i];
				if (availhas(elt)) {
					numb = avail[elt];
				} else {
					numb = difflib.__dictget(fullbcount, elt, 0);
				}
				avail[elt] = numb - 1;
				if (numb > 0) matches++;
			}
			
			return difflib.__calculate_ratio(matches, this.a.length + this.b.length);
		}
		
		this.real_quick_ratio = function () {
			var la = this.a.length;
			var lb = this.b.length;
			return _calculate_ratio(Math.min(la, lb), la + lb);
		}
		
		this.isjunk = isjunk ? isjunk : difflib.defaultJunkFunction;
		this.a = this.b = null;
		this.set_seqs(a, b);
	}
};

var oldLine = '', newLine = '', bEmpty = true;
// converts the diff structure from google lib to inner format
function convertDiff(diff){
	var result = [];
	if (diff == undefined) return result;
	for (var i = 0; i < diff.length; i++){
		var part = diff[i];
		if (part != undefined && part[1] != undefined && part[1] != ''){// ignore empty snippets
			var line = part[1];
			if (line.indexOf('\n') > -1){//multi-lines, extract and add to result with necessary flag, left the tail (if exist) in line
				var tmpArray = line.split('\n');
				line = addLines(tmpArray,result,part[0]);
				if (line === '' || line == undefined) continue;
			}
			// line contains partial snippet - add it to oldLine (if flag = -1), to newLine (if flag = 1), or both (flag = 0)
			updateBufferLine(part[0], line);
		}
	}
	if (bEmpty !== true){
		insertBufferLine(result);
	}
	return result;	
}

function addLines(src,dst,flag){
	var x = 0;
	if (!bEmpty){// stitch the 1st line with buffer if not empty
		updateBufferLine(flag, src[0]);
		insertBufferLine(dst);
		x = 1;
	}
	while (x < src.length - 1){
		if (flag === 0){
			insertEqualLine(dst, src[x]);
		}else if (flag === -1){
			insertDelLine(dst, src[x]);
		}else if (flag === 1){
			insertAddLine(dst, src[x]);
		}
		x++;
	}
	return src[x];
}

function updateBufferLine(flag, partialLine){
	bEmpty = false;
	if (flag === 0){
		oldLine += partialLine;
		newLine += partialLine;
	}else if (flag === -1){
		oldLine += partialLine;
	}else if (flag === 1){
		newLine += partialLine;
	}
}

function insertEqualLine(dst, val){
	dst.push({value:val});
} 

function insertDelLine(dst, val){
	dst.push({removed:true, value:val});
} 

function insertAddLine(dst, val){
	dst.push({added:true, value:val});
} 

function insertChangedLine(dst, val1, val2){
	dst.push({replaced:true, oldValue:val1, newValue:val2});
} 

function insertBufferLine(dst){
		if (oldLine == '' && newLine != ''){
			insertAddLine(dst, newLine);
		}else if (oldLine != '' && newLine == ''){
			insertDelLine(dst, oldLine);
		}else if (oldLine != '' && newLine != '' && oldLine === newLine){
			insertEqualLine(dst, newLine);
		}else if (oldLine != '' && newLine != '' && oldLine !== newLine){
			insertChangedLine(dst, oldLine, newLine);
		}
		oldLine = '';
		newLine = '';
		bEmpty = true;
}


var Mgly = {};

Mgly.Timer = function(){
	var self = this;
	self.start = function() { self.t0 = new Date().getTime(); };
	self.stop = function() {
		var t1 = new Date().getTime();
		var d = t1 - self.t0;
		self.t0 = t1;
		return d;
	};
	self.start();
};

Mgly.ChangeExpression = new RegExp(/(^(?![><\-])*\d+(?:,\d+)?)([acd])(\d+(?:,\d+)?)/);

Mgly.DiffParser = function(diff) {
	var changes = [];
	var change_id = 0;
	// parse diff
	var diff_lines = diff.split(/\n/);
	for (var i = 0; i < diff_lines.length; ++i) {
		if (diff_lines[i].length == 0) continue;
		var change = {};
		var test = Mgly.ChangeExpression.exec(diff_lines[i]);
		if (test == null) continue;
		// lines are zero-based
		var fr = test[1].split(',');
		change['lhs-line-from'] = fr[0] - 1;
		if (fr.length == 1) change['lhs-line-to'] = fr[0] - 1;
		else change['lhs-line-to'] = fr[1] - 1;
		var to = test[3].split(',');
		change['rhs-line-from'] = to[0] - 1;
		if (to.length == 1) change['rhs-line-to'] = to[0] - 1;
		else change['rhs-line-to'] = to[1] - 1;
		change['op'] = test[2];
		changes[change_id++] = change;
	}
	return changes;
};

Mgly.sizeOf = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

Mgly.LCS = function(x, y) {
	this.x = x.replace(/[ ]{1}/g, '\n');
	this.y = y.replace(/[ ]{1}/g, '\n');
};

jQuery.extend(Mgly.LCS.prototype, {
	clear: function() { this.ready = 0; },
	diff: function(added, removed) {
		var d = new Mgly.diff(this.x, this.y, {ignorews: false});
		var changes = Mgly.DiffParser(d.normal_form());
		var li = 0, lj = 0;
		for (var i = 0; i < changes.length; ++i) {
			var change = changes[i];
			if (change.op != 'a') {
				// find the starting index of the line
				li = d.getLines('lhs').slice(0, change['lhs-line-from']).join(' ').length;
				// get the index of the the span of the change
				lj = change['lhs-line-to'] + 1;
				// get the changed text
				var lchange = d.getLines('lhs').slice(change['lhs-line-from'], lj).join(' ');
				if (change.op == 'd') lchange += ' ';// include the leading space
				else if (li > 0 && change.op == 'c') li += 1; // ignore leading space if not first word
				// output the changed index and text
				removed(li, li + lchange.length);
			}
			if (change.op != 'd') {
				// find the starting index of the line
				li = d.getLines('rhs').slice(0, change['rhs-line-from']).join(' ').length;
				// get the index of the the span of the change
				lj = change['rhs-line-to'] + 1;
				// get the changed text
				var rchange = d.getLines('rhs').slice(change['rhs-line-from'], lj).join(' ');
				if (change.op == 'a') rchange += ' ';// include the leading space
				else if (li > 0 && change.op == 'c') li += 1; // ignore leading space if not first word
				// output the changed index and text
				added(li, li + rchange.length);
			}
		}
	}
});

Mgly.CodeifyText = function(settings) {
    this._max_code = 0;
    this._diff_codes = {};
	this.ctxs = {};
	this.options = settings.options != undefined ? settings.options : {ignorews: false};
	jQuery.extend(this, settings);
	this.lhs = settings.lhs.split('\n');
	this.rhs = settings.rhs.split('\n');
	this.org_lhs = [];
	this.org_rhs = [];
};

jQuery.extend(Mgly.CodeifyText.prototype, {
	getCodes: function(side) {
		if (!this.ctxs.hasOwnProperty(side)) {
			var ctx = this._diff_ctx(this[side]);
			this.ctxs[side] = ctx;
			ctx.codes.length = Object.keys(ctx.codes).length;
		}
		return this.ctxs[side].codes;
	},
	getLines: function(side) {
		return this.ctxs[side].lines;
	},
	getOrigLines: function(side) {
		return this.ctxs[side].origs;
	},
	_diff_ctx: function(lines) {
		var ctx = {i: 0, codes: {}, lines: lines, origs:[]};
		this._codeify(lines, ctx);
		return ctx;
	},
	_codeify: function(lines, ctx) {
		var code = this._max_code;
		for (var i = 0; i < lines.length; ++i) {
			var line = lines[i];
			ctx.origs.push(line);
			if (this.options.ignorews == true) {
				line = line.replace(/\s+/g, '');
			}
			if (this.options.ignorecase == true) {
				line = line.toLowerCase();
			}
			var aCode = this._diff_codes[line];
			if (aCode != undefined) {
				ctx.codes[i] = aCode;
			}
			else {
				this._max_code++;
				this._diff_codes[line] = this._max_code;
				ctx.codes[i] = this._max_code;
			}
		}
	}
});

Mgly.diff = function(lhs, rhs, options) {
	var opts = options != undefined ? options : {};
	if (opts.ignorews == undefined){
		opts.ignorews = false;
	}
	this.codeify = new Mgly.CodeifyText({
		lhs: lhs,
		rhs: rhs,
		options: opts
	});
	var lhs_ctx = {
		codes: this.codeify.getCodes('lhs'),
		modified: {}
	};
	var rhs_ctx = {
		codes: this.codeify.getCodes('rhs'),
		modified: {}
	};
	var max = (lhs_ctx.codes.length + rhs_ctx.codes.length + 1);
	var vector_d = [];
	var vector_u = [];
	this._lcs(lhs_ctx, 0, lhs_ctx.codes.length, rhs_ctx, 0, rhs_ctx.codes.length, vector_u, vector_d);
	this._optimize(lhs_ctx);
	this._optimize(rhs_ctx);
	this.items = this._create_diffs(lhs_ctx, rhs_ctx);
};

jQuery.extend(Mgly.diff.prototype, {
	changes: function() { return this.items; },
	getLines: function(side) {
		return this.codeify.getLines(side);
	},
	getOrigLines: function(side) {
		return this.codeify.getOrigLines(side);
	},
	get_difference_array: function() {
		var diffArray = [];
		var lhs_lines = this.getLines('lhs');
		var rhs_lines = this.getLines('rhs');
		var org_lhs_lines = this.getOrigLines('lhs');
		var org_rhs_lines = this.getOrigLines('rhs');
		var left_idx = 0, right_idx = 0;
		if (rhs_lines && lhs_lines) {
			for (var index = 0; index < this.items.length; index++) {
				var item = this.items[index];
				while(right_idx < item.rhs_start){// compose equal lines from right panel (if needed)
					diffArray.push({"valuer":org_rhs_lines[right_idx],"valuel":org_lhs_lines[left_idx]});
					right_idx++;
					if (left_idx < item.lhs_start) left_idx++;
				}
				while(left_idx < item.lhs_start){
					diffArray.push({"valuer":org_rhs_lines[right_idx],"valuel":org_lhs_lines[left_idx]});// important! use right panel
					left_idx++;
					if (right_idx < item.rhs_start) right_idx++;
				}
				//insert added and deleted rows
				for (i = item.lhs_start; i < item.lhs_start + item.lhs_deleted_count; i++) {
					diffArray.push({"removed":true,"value":org_lhs_lines[i]});
				}
				for (i = item.rhs_start; i < item.rhs_start + item.rhs_inserted_count; i++) {
					diffArray.push({"added":true,"value":org_rhs_lines[i]});
				}
				left_idx += item.lhs_deleted_count;
				right_idx += item.rhs_inserted_count;
			}
			// add the tail if needed
			while(right_idx < rhs_lines.length){// compose equal lines from right panel (if needed)
				diffArray.push({"valuer":org_rhs_lines[right_idx],"valuel":org_lhs_lines[left_idx]});
				right_idx++;
				if (left_idx < org_lhs_lines.length) left_idx++;
			}
			while(left_idx < lhs_lines.length){
				diffArray.push({"valuer":org_rhs_lines[right_idx],"valuel":org_lhs_lines[left_idx]});
				left_idx++;
				if (right_idx < org_rhs_lines.length) right_idx++;
			}
		}
		return diffArray;
	},
	normal_form: function() {
		var nf = '';
		for (var index = 0; index < this.items.length; ++index) {
			var item = this.items[index];
			var lhs_str = '';
			var rhs_str = '';
			var change = 'c';
			if (item.lhs_deleted_count == 0 && item.rhs_inserted_count > 0) change = 'a';
			else if (item.lhs_deleted_count > 0 && item.rhs_inserted_count == 0) change = 'd';

			if (item.lhs_deleted_count == 1) lhs_str = item.lhs_start + 1;
			else if (item.lhs_deleted_count == 0) lhs_str = item.lhs_start;
			else lhs_str = (item.lhs_start + 1) + ',' + (item.lhs_start + item.lhs_deleted_count);

			if (item.rhs_inserted_count == 1) rhs_str = item.rhs_start + 1;
			else if (item.rhs_inserted_count == 0) rhs_str = item.rhs_start;
			else rhs_str = (item.rhs_start + 1) + ',' + (item.rhs_start + item.rhs_inserted_count);
			nf += lhs_str + change + rhs_str + '\n';

			var lhs_lines = this.getLines('lhs');
			var rhs_lines = this.getLines('rhs');
			if (rhs_lines && lhs_lines) {
				var i;
				// if rhs/lhs lines have been retained, output contextual diff
				for (i = item.lhs_start; i < item.lhs_start + item.lhs_deleted_count; ++i) {
					nf += '< ' + lhs_lines[i] + '\n';
				}
				if (item.rhs_inserted_count && item.lhs_deleted_count) nf += '---\n';
				for (i = item.rhs_start; i < item.rhs_start + item.rhs_inserted_count; ++i) {
					nf += '> ' + rhs_lines[i] + '\n';
				}
			}
		}
		return nf;
	},
	_lcs: function(lhs_ctx, lhs_lower, lhs_upper, rhs_ctx, rhs_lower, rhs_upper, vector_u, vector_d) {
		while ( (lhs_lower < lhs_upper) && (rhs_lower < rhs_upper) && (lhs_ctx.codes[lhs_lower] == rhs_ctx.codes[rhs_lower]) ) {
			++lhs_lower;
			++rhs_lower;
		}
		while ( (lhs_lower < lhs_upper) && (rhs_lower < rhs_upper) && (lhs_ctx.codes[lhs_upper - 1] == rhs_ctx.codes[rhs_upper - 1]) ) {
			--lhs_upper;
			--rhs_upper;
		}
		if (lhs_lower == lhs_upper) {
			while (rhs_lower < rhs_upper) {
				rhs_ctx.modified[ rhs_lower++ ] = true;
			}
		}
		else if (rhs_lower == rhs_upper) {
			while (lhs_lower < lhs_upper) {
				lhs_ctx.modified[ lhs_lower++ ] = true;
			}
		}
		else {
			var sms = this._sms(lhs_ctx, lhs_lower, lhs_upper, rhs_ctx, rhs_lower, rhs_upper, vector_u, vector_d);
			this._lcs(lhs_ctx, lhs_lower, sms.x, rhs_ctx, rhs_lower, sms.y, vector_u, vector_d);
			this._lcs(lhs_ctx, sms.x, lhs_upper, rhs_ctx, sms.y, rhs_upper, vector_u, vector_d);
		}
	},
	_sms: function(lhs_ctx, lhs_lower, lhs_upper, rhs_ctx, rhs_lower, rhs_upper, vector_u, vector_d) {
		var max = lhs_ctx.codes.length + rhs_ctx.codes.length + 1;
		var kdown = lhs_lower - rhs_lower;
		var kup = lhs_upper - rhs_upper;
		var delta = (lhs_upper - lhs_lower) - (rhs_upper - rhs_lower);
		var odd = (delta & 1) != 0;
		var offset_down = max - kdown;
		var offset_up = max - kup;
		var maxd = ((lhs_upper - lhs_lower + rhs_upper - rhs_lower) / 2) + 1;
		vector_d[ offset_down + kdown + 1 ] = lhs_lower;
		vector_u[ offset_up + kup - 1 ] = lhs_upper;
		var ret = {x:0,y:0}, d, k, x, y;
		for (d = 0; d <= maxd; ++d) {
			for (k = kdown - d; k <= kdown + d; k += 2) {
				if (k == kdown - d) {
					x = vector_d[ offset_down + k + 1 ];//down
				}
				else {
					x = vector_d[ offset_down + k - 1 ] + 1;//right
					if ((k < (kdown + d)) && (vector_d[ offset_down + k + 1 ] >= x)) {
						x = vector_d[ offset_down + k + 1 ];//down
					}
				}
				y = x - k;
				// find the end of the furthest reaching forward D-path in diagonal k.
				while ((x < lhs_upper) && (y < rhs_upper) && (lhs_ctx.codes[x] == rhs_ctx.codes[y])) {
					x++; y++;
				}
				vector_d[ offset_down + k ] = x;
				// overlap ?
				if (odd && (kup - d < k) && (k < kup + d)) {
					if (vector_u[offset_up + k] <= vector_d[offset_down + k]) {
						ret.x = vector_d[offset_down + k];
						ret.y = vector_d[offset_down + k] - k;
						return (ret);
					}
				}
			}
			// Extend the reverse path.
			for (k = kup - d; k <= kup + d; k += 2) {
				// find the only or better starting point
				if (k == kup + d) {
					x = vector_u[offset_up + k - 1]; // up
				} else {
					x = vector_u[offset_up + k + 1] - 1; // left
					if ((k > kup - d) && (vector_u[offset_up + k - 1] < x))
						x = vector_u[offset_up + k - 1]; // up
				}
				y = x - k;
				while ((x > lhs_lower) && (y > rhs_lower) && (lhs_ctx.codes[x - 1] == rhs_ctx.codes[y - 1])) {
					// diagonal
					x--;
					y--;
				}
				vector_u[offset_up + k] = x;
				// overlap ?
				if (!odd && (kdown - d <= k) && (k <= kdown + d)) {
					if (vector_u[offset_up + k] <= vector_d[offset_down + k]) {
						ret.x = vector_d[offset_down + k];
						ret.y = vector_d[offset_down + k] - k;
						return (ret);
					}
				}
			}
		}
		throw "the algorithm should never come here.";
	},
	_optimize: function(ctx) {
		var start = 0, end = 0;
		while (start < ctx.codes.length) {
			while ((start < ctx.codes.length) && (ctx.modified[start] == undefined || ctx.modified[start] == false)) {
				start++;
			}
			end = start;
			while ((end < ctx.codes.length) && (ctx.modified[end] == true)) {
				end++;
			}
			if ((end < ctx.codes.length) && (ctx.codes[start] == ctx.codes[end])) {
				ctx.modified[start] = false;
				ctx.modified[end] = true;
			}
			else {
				start = end;
			}
		}
	},
	_create_diffs: function(lhs_ctx, rhs_ctx) {
		var items = [];
		var lhs_start = 0, rhs_start = 0;
		var lhs_line = 0, rhs_line = 0;

		while (lhs_line < lhs_ctx.codes.length || rhs_line < rhs_ctx.codes.length) {
			if ((lhs_line < lhs_ctx.codes.length) && (!lhs_ctx.modified[lhs_line])
				&& (rhs_line < rhs_ctx.codes.length) && (!rhs_ctx.modified[rhs_line])) {
				// equal lines
				lhs_line++;
				rhs_line++;
			}
			else {
				// maybe deleted and/or inserted lines
				lhs_start = lhs_line;
				rhs_start = rhs_line;

				while (lhs_line < lhs_ctx.codes.length && (rhs_line >= rhs_ctx.codes.length || lhs_ctx.modified[lhs_line]))
					lhs_line++;

				while (rhs_line < rhs_ctx.codes.length && (lhs_line >= lhs_ctx.codes.length || rhs_ctx.modified[rhs_line]))
					rhs_line++;

				if ((lhs_start < lhs_line) || (rhs_start < rhs_line)) {
					// store a new difference-item
					items.push({
						lhs_start: lhs_start,
						rhs_start: rhs_start,
						lhs_deleted_count: lhs_line - lhs_start,
						rhs_inserted_count: rhs_line - rhs_start
					});
				}
			}
		}
		return items;
	}
});


