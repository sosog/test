

"use strict";

(function( window, document, jQuery, CodeMirror ){

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
		this.options = {ignorews: false};
		jQuery.extend(this, settings);
		this.lhs = settings.lhs.split('\n');
		this.rhs = settings.rhs ? settings.rhs.split("\n") : [];

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
		_diff_ctx: function(lines) {
			var ctx = {i: 0, codes: {}, lines: lines};
			this._codeify(lines, ctx);
			return ctx;
		},
		_codeify: function(lines, ctx) {
			var code = this._max_code;
			for (var i = 0; i < lines.length; ++i) {
				var line = lines[i];
				if (this.options.ignorews) {
					line = line.replace(/&nbsp;|\u00a0/g," ");
					line = line.replace(/\s+/g, '');
				}
				if (this.options.ignorecase) {
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
		var opts = jQuery.extend({ignorews: false}, options);
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
		var blset = options.blocklines;
		var max = (lhs_ctx.codes.length + rhs_ctx.codes.length + 1);
		var vector_d = [];
		var vector_u = [];
		this._lcs(lhs_ctx, 0, lhs_ctx.codes.length, rhs_ctx, 0, rhs_ctx.codes.length, vector_u, vector_d);
		this._optimize(lhs_ctx);
		this._optimize(rhs_ctx);
		this.items = this._create_diffs(lhs_ctx, rhs_ctx, blset);
	};

	jQuery.extend(Mgly.diff.prototype, {
		changes: function() { return this.items; },
		getLines: function(side) {
			return this.codeify.getLines(side);
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
		_create_diffs: function(lhs_ctx, rhs_ctx, blset) {
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

					// select block or line by line merge
					if (blset)
					{
						if (lhs_line < lhs_ctx.codes.length && (rhs_line >= rhs_ctx.codes.length || lhs_ctx.modified[lhs_line]))
							lhs_line++;

						if (rhs_line < rhs_ctx.codes.length && (lhs_line >= lhs_ctx.codes.length || rhs_ctx.modified[rhs_line]))
							rhs_line++;
					}
					else
					{
						while (lhs_line < lhs_ctx.codes.length && (rhs_line >= rhs_ctx.codes.length || lhs_ctx.modified[lhs_line]))
							lhs_line++;

						while (rhs_line < rhs_ctx.codes.length && (lhs_line >= lhs_ctx.codes.length || rhs_ctx.modified[rhs_line]))
							rhs_line++;
					}



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

	Mgly.mergely = function(el, options) {
		if (el) {
			this.init(el, options);
		}
	};

	jQuery.extend(Mgly.mergely.prototype, {
		name: 'mergely',
		//http://jupiterjs.com/news/writing-the-perfect-jquery-plugin
		init: function(el, options) {
			this.diffView = new Mgly.CodeMirrorDiffView(el, options);
			this.bind(el);
		},
		bind: function(el) {
			this.diffView.bind(el);
		}
	});

	Mgly.CodeMirrorDiffView = function(el, options) {
		CodeMirror.defineExtension('centerOnCursor', function() {
			var coords = this.cursorCoords(null, 'local');
			this.scrollTo(null,
				(coords.y + coords.yBot) / 2 - (this.getScrollerElement().clientHeight / 2));
		});
		this.init(el, options);
	};

	jQuery.extend(Mgly.CodeMirrorDiffView.prototype, {
		init: function(el, options) {
			this.settings = {
				autoupdate: true,
				autoresize: true,
				rhs_margin: 'right',
				wrap_lines: false,
				line_numbers: true,
				lcs: true,
				sidebar: true,
				viewport: true,
				ignorews: false,
				ignorecase: false,
				blocklines: false,
				fadein: 'fast',
				editor_width: '750px',
				editor_height: '500px',
				resize_timeout: 500,
				change_timeout: 150,
				fgcolor: {a:'#ff7f7f',c:'#a3a3a3',d:'#7bff7b',  // color for differences (soft color)
					ca:'#4b73ff',cc:'#434343',cd:'#ff4f4f'},    // color for currently active difference (bright color)
				bgcolor: '#eee',
				vpcolor: 'rgba(255, 255, 255, 0.1)',
				license: 'gpl',
				lhs: function(setValue) { },
				rhs: function(setValue) { },
				loaded: function() { },
				_auto_width: function(w) { return w; },
				resize: function(init) {
					var scrollbar = init ? 16 : 0;
					var w = jQuery(el).parent().width() + scrollbar, h = 0;
					if (this.width == 'auto') {
						w = this._auto_width(w);
					}
					else {
						w = this.width;
						this.editor_width = w;
					}
					if (this.height == 'auto') {
						//h = this._auto_height(h);
						h = jQuery(el).parent().height();
					}
					else {
						h = this.height;
						this.editor_height = h;
					}
					/* max height of editor*/
					h = 500;
					if (options && options.editor_max_height){
						h = options.editor_max_height;
					}
					var content_width = w / 2.0 - 2 * 8 - 8;

					var content_height = h;
					var self = jQuery(el);
					self.find('.mergely-column').css({ width: content_width + 'px' });
					self.find('.mergely-column, .mergely-canvas, .mergely-margin, .mergely-column textarea, .CodeMirror-scroll, .cm-s-default').css({ height: content_height + 'px' });
					self.find('.mergely-canvas').css({ height: content_height + 'px' });
					self.find('.mergely-column textarea').css({ width: content_width + 'px' });
					self.css({ width: w, height: h, clear: 'both' });
					if (self.css('display') == 'none') {
						if (this.fadein != false) self.fadeIn(this.fadein);
						else self.show();
						if (this.loaded) this.loaded();
					}
					if (this.resized) this.resized();
				},
				_debug: '', //scroll,draw,calc,diff,markup,change
				resized: function() { }
			};
			var cmsettings = {
				//mode: 'text/plain',
				readOnly: false,
				lineWrapping: this.settings.wrap_lines,
				lineNumbers: this.settings.line_numbers,
				lineSeparator: '\n',

				gutters: ['merge', 'CodeMirror-linenumbers'],
				foldOptions: {
					rangeFinder: (cm, start) => {

						if (this.changes && this.changes.length > 0) {
							const lineMarginsFromChanges = 3;
							const startLine = start.line
							const lastLine = cm.lastLine()

							const linesToCollapse = () => {
								const lastIndex = this.changes.length-1;
								const collapseMap = {};
								collapseMap[0] = [0, this.changes[0]['lhs-line-from'] - lineMarginsFromChanges];

								for (let i = 0; i < this.changes.length; i++) {
									const changeTo = this.changes[i]['lhs-line-to'] + lineMarginsFromChanges;
									if (lastIndex == i) {
										collapseMap[changeTo] = [changeTo, lastLine];
									} else {
										const changeFrom = this.changes[i+1]['lhs-line-from'] - lineMarginsFromChanges;
										const numberOfChangedRows = (changeTo) - (changeFrom);
										 if (numberOfChangedRows < 1) {
											 collapseMap[changeTo] = [changeTo, changeFrom];
										 }
									}
								}
								return collapseMap;
							}

							const collapseMap = linesToCollapse();
							if (collapseMap && collapseMap[startLine]) {
								const textLine = cm.getLine(collapseMap[startLine][1]);
								let timer = new Mgly.Timer();
								this.trace('change', 'scroll_to_change time', timer.stop());
								this._markup_changes(this.id + '-lhs', this.id + '-rhs', this.changes);
								this.trace('change', 'markup time', timer.stop());
								return {
									from: CodeMirror.Pos(collapseMap[startLine][0], 0),
									to: CodeMirror.Pos(collapseMap[startLine][1], textLine ? textLine.length : 0)
								};
							}
						}
					},
					widget: `\u21A4 ... \u21A6`,
					minFoldSize: 0,
					scanUp: true,
				}
			};
			this.lhs_cmsettings = {};
			this.rhs_cmsettings = {};

			// save this element for faster queries
			this.element = jQuery(el);

			// save options if there are any
			if (options && options.cmsettings) jQuery.extend(this.lhs_cmsettings, cmsettings, options.cmsettings, options.lhs_cmsettings);
			if (options && options.cmsettings) jQuery.extend(this.rhs_cmsettings, cmsettings, options.cmsettings, options.rhs_cmsettings);
			// set right panel read-only
			this.rhs_cmsettings.readOnly = true;

			//if (options) jQuery.extend(this.settings, options);

			// bind if the element is destroyed
			this.element.bind('destroyed', jQuery.proxy(this.teardown, this));

			// save this instance in jQuery data, binding this view to the node
			jQuery.data(el, 'mergely', this);

			this._setOptions(options);
		},
		unbind: function() {
			if (this.changed_timeout != null) clearTimeout(this.changed_timeout);
			this.editor[this.id + '-lhs'].toTextArea();
			this.editor[this.id + '-rhs'].toTextArea();
			jQuery(window).off('.mergely');
		},
		destroy: function() {
			this.element.unbind('destroyed', this.teardown);
			this.teardown();
		},
		teardown: function() {
			this.unbind();
		},
		ljson: function(jsonl) {
			this.parserL = new JSONParser(jsonl);
		},
		rjson: function(jsonr) {
			this.parserR = new JSONParser(jsonr,{immutable:true});
		},
		/* mode = {XML,TXT} */
		setMode: function(mode) {
			this.mode = mode;
			/* always set this flag when there are changes in this.jsonl */
			this.leftSideChanged = true;
			if (mode == 'RAWTXT' || mode == 'RAWXML' || mode == 'RAWJSON' ){
				this._setOptions({cmsettings:{readOnly: false}});
			}else if (mode == 'XML' || mode == 'TXT' || mode == 'TXTXML' || mode == 'XMLTXT' || mode == 'JSON'){
				this._setOptions({cmsettings:{readOnly: true}});
				this.rhs_cmsettings.readOnly = true;
			}
			this.update();
			this.differentiator = new Differentiator(mode);
		},
		lhs: function(text,numbersMap) {
			this.changes = [];
			this.editor[this.id + '-lhs'].setValue(text);
		},
		rhs: function(text,numbersMap) {
			this.changes = [];
			this.editor[this.id + '-rhs'].setValue(text);
		},
		lorigjson: function(text){
			this.isVlocityJson = true;
			this.leftOrig = text ? this.parseJSONFile(text) : text;
		},
		rorigjson: function(text){
			this.rightOrig = text ? this.parseJSONFile(text) : text;
		},
		lorig: function(text){
			this.leftOrig = text;
		},
		rorig: function(text){
			this.rightOrig = text;
		},
		parseJSONFile: function(text) {
			const parseText = JSON.parse(text);
			const replacer = (key, value) => {
				return value instanceof Object && !(value instanceof Array) ?
					Object.keys(value)
						.sort()
						.reduce((sorted, key) => {
							sorted[key] = value[key];
							return sorted
						}, {}) : value;
			}

			return JSON.stringify(parseText, replacer, "\t");
		},
		undo: function(text){
			if (this.differentiator.isEmpty()) return;
			if (this.mode == 'XML'){
				this.parserL.json = this.differentiator.pop();
				this.updateXml();
			}else if (this.mode == 'TXT' || this.mode == 'JSON'){
				this.leftOrig = this.differentiator.pop();
				this.update();
			}
		},
		update: function() {
			console.log('update');
			this._spinner(true);
			this._changing(this.id + '-lhs', this.id + '-rhs');
		},
		/* generates trees */
		updateXml: function() {
			this.savePos('updateXml');
			this._spinner(true);

			this.diff = null;
			deepDiffMapper.initCompare();
			var jsonl = this.parserL.json;
			var jsonr = this.parserR.json;
			this.parserL.initParser();
			this.parserR.initParser();


			/*
            1) calc diff object, update
            2) update parser.jsonView
            3) update parser.tagsArray, parser.tagsMap
            4) collect changes between comparable trees
            */
			this.diff = deepDiffMapper.diff(this.parserL,this.parserR,this.settings.ignorews);


			deepDiffMapper.resetCounters();

			this.lhs(this.parserL.getTree(),false);
			this.rhs(this.parserR.getTree(),false);

			deepDiffMapper.createChanges(this.parserL.tagsArray,this.parserR.tagsArray);

			for (let i=0; i<deepDiffMapper.changes.length-1;i++){
				let current = deepDiffMapper.changes[i];
				let next = deepDiffMapper.changes[i+1];
				if (current.equalTag && current.equalTag!='' && current.equalTag == next.equalTag && current.op!=next.op && (current['lhs-line-to']==next['lhs-line-from']-1)){
					deepDiffMapper.changes.splice(i,2);
					i=0;
				}
			}

			this.changes = deepDiffMapper.changes;

			this.updateChangeCounters();

			this.restorePos();

			this._changing(this.id + '-lhs', this.id + '-rhs');
		},
		unescapeXmlChars: function(str) {
			return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&apos;/g, "'").replace(/&amp;/g, '&');
		},
		restoreXML: function(json){
			var x2js = new X2JS({useDoubleQuotes : true, stripWhitespaces : false, escapeMode: true, enableToStringFunc:false});
			var lhsResponse = '<?xml version="1.0" encoding="UTF-8"?>\n' + this.unescapeXmlChars(vkbeautify.xml(x2js.json2xml_str(json), 4 ));
			var tr = this.unescapeXmlChars(lhsResponse);
			return tr;
		},
		updateChangeCounters: function(){
			var n, msg;

			if (this.mode != 'XML' && this.mode !='XMLTXT'){
				n = (this.changesOrig) ? this.changesOrig.length : 0;
			}else{
				n = (this.changes) ? this.changes.length : 0;
			}
			msg = 'Components are identical';
			if (n > 0){
				if (n == 1){
					msg = 'Found 1 difference';
				}else{
					msg = 'Found ' + n + ' differences';
				}
				if (!this.rightOrig){
					msg = 'New component';
				}
			} else if (this.mode == 'XML' && n == 0 && this.restoreXML(this.parserL.json)!=this.restoreXML(this.parserR.json)){
				msg = "Components are identical, but the tag order is different. Click 'Edit as text' button to view the difference.";
				showToast(msg);
			} else if (this.mode == 'XMLTXT' && n == 0 && this.restoreXML(this.parserL.json)!=this.restoreXML(this.parserR.json)){
				msg = "Components are identical, but the tag order is different.";
				showToast(msg);
			} else if (this.mode == 'XML' && n == 0 && this.leftOrig!=this.rightOrig){
				msg = "Components are identical, the differences are in the spaces and line breaks. Click 'Edit as text' button to view the difference.";
				showToast(msg);
			} else if (this.mode == 'XMLTXT' && n == 0 && this.leftOrig!=this.rightOrig){
				msg = "Components are identical, the differences are in the spaces and line breaks.";
				showToast(msg);
			} else if (this.isVlocityJson && n == 0) {
				msg = 'Components are identical, but the order is different.';
				showToast(msg);
			}
			this.settings.changeCountersMsg = msg;
			$("#changes").text(msg);
		},
		command: function(cmd){
			var newTag = $('#tag').val();
			var newTagValue = $('#tagValue').val();
			this.parserL.mergeChanges(cmd, this.lineToEdit-1, newTag, newTagValue);
			this.savePos();
			this.updateXml();
			this.restorePos();
		},
		unmarkup: function() {
			this._clear();
		},
		/* markSpan    */
		mark: function() {
			var le = this.editor[this.id + '-lhs'];
			var re = this.editor[this.id + '-rhs'];
			var marker = le.markText({line: 1, ch: 0}, {line: 1}, {readOnly: false, collapsed: false, inclusiveRight: true, placeholder:true});
		},
		scrollToDiff: function(direction, val) {
			if (!this.changes.length) return;
			this.settings.collapseAll = false;
			if (val==undefined || (val['new']=='true' && val['change']=='true' && val['remove']=='true')){
				if (direction == 'next') {
					if (this._current_diff >= this.changes.length -1 && !this._merge_diff) {
						this._current_diff = 0;
					} else if (this._current_diff == this._merge_diff){
						this._merge_diff = null;
					} else {
						this._current_diff = Math.min(++this._current_diff, this.changes.length - 1);
					}
				}
				else if (direction == 'prev') {
					if (this._current_diff == 0 && !this._merge_diff) {
						this._current_diff = this.changes.length - 1;
					} else if (this._current_diff == this._merge_diff){
						this._merge_diff = null;
						this._current_diff = this.changes.length - 1;
					} else {
						this._current_diff = Math.max(--this._current_diff, 0);
					}
				}
				this._scroll_to_change(this.changes[this._current_diff]);
				if (this.mode == 'TXT' || this.mode == 'TXTXML' || this.mode == 'JSON'){
					this._changed(this.id + '-lhs', this.id + '-rhs');
				}else if (this.mode == 'XML'|| this.mode == 'XMLTXT'){
					this._changedXml(this.id + '-lhs', this.id + '-rhs');
				}
			}
			else {
				var curr_diff = this._current_diff;
				var new_curr_diff = -1;
				var mass = [];
				var i, change;
				for (i = 0; i < this.changes.length; i++) {
					change = this.changes[i];
					if (val['new']=='true' && change.op == 'a'){
						mass.push(i);
						if (i==curr_diff){
							new_curr_diff = mass.length-1;
						}
					}
					if (val['change']=='true' && change.op == 'c'){
						mass.push(i);
						if (i==curr_diff){
							new_curr_diff = mass.length-1;
						}
					}
					if (val['remove']=='true' && change.op == 'd'){
						mass.push(i);
						if (i==curr_diff){
							new_curr_diff = mass.length-1;
						}
					}

				}
				if (direction == 'next') {
					if (mass.length>1 && new_curr_diff<mass.length-1){
						this._current_diff = mass[new_curr_diff+1];
					} else if (mass.length>0){
						this._current_diff = mass[0];
					} else {
						return;
					}
				}
				else if (direction == 'prev') {
					if (mass.length>0 && new_curr_diff==0){
						this._current_diff = mass[mass.length-1];
					} else if (mass.length>0 && new_curr_diff==-1){
						this._current_diff = mass[0];
					} else if (mass.length>1){
						this._current_diff = mass[new_curr_diff-1];
					} else {
						return;
					}
				}
				this._scroll_to_change(this.changes[this._current_diff]);
				if (this.mode == 'TXT' || this.mode == 'TXTXML' || this.mode == 'JSON'){
					this._changed(this.id + '-lhs', this.id + '-rhs');
				}else if (this.mode == 'XML'|| this.mode == 'XMLTXT'){
					this._changedXml(this.id + '-lhs', this.id + '-rhs');
				}


			}


		},
		scrollTo: function(side, num) {
			var le = this.editor[this.id + '-lhs'];
			var re = this.editor[this.id + '-rhs'];
			if (side == 'lhs') {
				le.setCursor(num);
				le.centerOnCursor();
			}
			else {
				re.setCursor(num);
				re.centerOnCursor();
			}
		},
		_setOptions: function(opts) {
			jQuery.extend(this.settings, opts);

			if (this.settings.hasOwnProperty('rhs_margin')) {
				// dynamically swap the margin
				if (this.settings.rhs_margin == 'left') {
					this.element.find('.mergely-margin:last-child').insertAfter(
						this.element.find('.mergely-canvas'));
				}
				else {
					var target = this.element.find('.mergely-margin').last();
					target.appendTo(target.parent());
				}
			}
			if (this.settings.hasOwnProperty('sidebar')) {
				// dynamically enable sidebars
				if (this.settings.sidebar) {
					this.element.find('.mergely-margin').css({display: 'block'});
				}
				else {
					this.element.find('.mergely-margin').css({display: 'none'});
				}
			}
			var le, re;
			if (this.settings.hasOwnProperty('wrap_lines')) {
				if (this.editor) {
					le = this.editor[this.id + '-lhs'];
					re = this.editor[this.id + '-rhs'];
					le.setOption('lineWrapping', this.settings.wrap_lines);
					re.setOption('lineWrapping', this.settings.wrap_lines);
				}
			}
			if (this.settings.hasOwnProperty('line_numbers')) {
				if (this.editor) {
					le = this.editor[this.id + '-lhs'];
					re = this.editor[this.id + '-rhs'];
					le.setOption('lineNumbers', this.settings.line_numbers);
					re.setOption('lineNumbers', this.settings.line_numbers);
				}
			}
			if (this.settings.hasOwnProperty('readOnlyWholePanel')) {
				this.settings.readOnlyWholePanel = readOnlyWholePanel;
			}
		},
		options: function(opts) {
			if (opts) {
				this._setOptions(opts);
				if (this.settings.autoresize) this.resize();
				if (this.settings.autoupdate) this.update();
			}
			else {
				return this.settings;
			}
		},
		swap: function() {
			if (this.lhs_cmsettings.readOnly || this.rhs_cmsettings.readOnly) return;
			var le = this.editor[this.id + '-lhs'];
			var re = this.editor[this.id + '-rhs'];
			var tmp = re.getValue();
			re.setValue(le.getValue());
			le.setValue(tmp);
		},
		merge: function(side) {
			var le = this.editor[this.id + '-lhs'];
			var re = this.editor[this.id + '-rhs'];
			if (side == 'lhs') le.setValue(re.getValue());
			else if (!this.rhs_cmsettings.readOnly) re.setValue(le.getValue());
		},
		get: function(side) {
			if (this.mode == 'XML' || this.mode == 'XMLTXT'){
				return (this.parserL) ? this.parserL.json :  null;
			}else if(this.mode == 'RAWTXT' || this.mode == 'RAWXML'){
				var ed = this.editor[this.id + '-' + side];
				var t = ed.getValue();
				if (t == undefined) return '';
				return t;
			}else {
				var t;
				if (side == 'lhs') {
					if (this.leftArray == undefined) return '';
					t = this.leftArray.join('\n');
				}
				if (side == 'rhs') {
					if (this.rightArray == undefined) return '';
					t = this.rightArray.join('\n');
				}
				if (t == undefined) return '';
				return t;
			}

		},
		clear: function(side) {
			if (side == 'lhs' && this.lhs_cmsettings.readOnly) return;
			if (side == 'rhs' && this.rhs_cmsettings.readOnly) return;
			var ed = this.editor[this.id + '-' + side];
			ed.setValue('');
		},
		cm: function(side) {
			return this.editor[this.id + '-' + side];
		},
		search: function(side, query, direction) {
			var le = this.editor[this.id + '-lhs'];
			var re = this.editor[this.id + '-rhs'];
			var editor;
			if (side == 'lhs') editor = le;
			else editor = re;
			direction = (direction == 'prev') ? 'findPrevious' : 'findNext';
			if ((editor.getSelection().length == 0) || (this.prev_query[side] != query)) {
				this.cursor[this.id] = editor.getSearchCursor(query, { line: 0, ch: 0 }, false);
				this.prev_query[side] = query;
			}
			var cursor = this.cursor[this.id];

			if (cursor[direction]()) {
				editor.setSelection(cursor.from(), cursor.to());
			}
			else {
				cursor = editor.getSearchCursor(query, { line: 0, ch: 0 }, false);
			}
		},
		savePos: function(text){
			// save the current scroll position of the editor
			this.saveYl = this.editor[this.id + '-lhs'].getScrollInfo().top;
			this.saveYr = this.editor[this.id + '-rhs'].getScrollInfo().top;
		},
		restorePos: function(){
			// restore editor's scroll position
			this.editor[this.id + '-lhs'].scrollTo(null, this.saveYl);
			this.editor[this.id + '-rhs'].scrollTo(null, this.saveYr);
		},
		resize: function() {
			this.settings.resize();
			this._changing(this.id + '-lhs', this.id + '-rhs');
			this._set_top_offset(this.id + '-lhs');
		},
		diff: function() {
			var lhs = this.editor[this.id + '-lhs'].getValue();
			var rhs = this.editor[this.id + '-rhs'].getValue();
			var d = new Mgly.diff(lhs, rhs, this.settings);
			return d.normal_form();
		},
		bind: function(el) {
			var self = this;
			this.element.hide();//hide
			this.id = jQuery(el).attr('id');
			this.changed_timeout = null;
			this.chfns = {};
			this.chfns[this.id + '-lhs'] = [];
			this.chfns[this.id + '-rhs'] = [];
			this.prev_query = [];
			this.cursor = [];
			this._skipscroll = {};
			this.change_exp = new RegExp(/(\d+(?:,\d+)?)([acd])(\d+(?:,\d+)?)/);
			var merge_lhs_button;
			var merge_rhs_button;
			if (jQuery.button != undefined) {
				//jquery ui
				merge_lhs_button = '<button title="Remove"></button>';
				merge_rhs_button = '<button title="Add/Merge line"></button>';
			} else {
				// homebrew
				/*
                            var style = 'opacity:0.4;width:10px;height:15px;background-color:#888;cursor:pointer;text-align:center;color:#1114de;border:1px solid #222;margin-right:5px;margin-top: -2px;';
                */
				var style = 'width:10px;height:15px;cursor:pointer;text-align:center;color:#170c0c;border:1px solid #222;margin-right:5px;margin-top: -2px;';
				merge_lhs_button = '<div style="' + style + '" title="Remove">&lt;</div>';
				merge_rhs_button = '<div style="' + style + '" title="Add/Merge line">&gt;</div>';
			}
			this.merge_rhs_button = jQuery(merge_rhs_button);
			this.merge_lhs_button = jQuery(merge_lhs_button);

			// create the textarea and canvas elements
			var height = this.settings.editor_height;
			var width = this.settings.editor_width;
			this.element.append(jQuery('<div class="mergely-margin" style="height: ' + height + '"><canvas id="' + this.id + '-lhs-margin" width="8px" height="' + height + '"></canvas></div>'));
			this.element.append(jQuery('<div style="position:relative;width:' + width + '; height:' + height + '" id="' + this.id + '-editor-lhs" class="mergely-column"><textarea style="" id="' + this.id + '-lhs"></textarea></div>'));
			this.element.append(jQuery('<div class="mergely-canvas" style="height: ' + height + '"><canvas id="' + this.id + '-lhs-' + this.id + '-rhs-canvas" style="width:28px" width="28px" height="' + height + '"></canvas></div>'));
			var rmargin = jQuery('<div class="mergely-margin" style="height: ' + height + '"><canvas id="' + this.id + '-rhs-margin" width="8px" height="' + height + '"></canvas></div>');
			if (!this.settings.sidebar) {
				this.element.find('.mergely-margin').css({display: 'none'});
			}
			if (this.settings.rhs_margin == 'left') {
				this.element.append(rmargin);
			}
			this.element.append(jQuery('<div style="width:' + width + '; height:' + height + '" id="' + this.id + '-editor-rhs" class="mergely-column"><textarea style="" id="' + this.id + '-rhs"></textarea></div>'));
			if (this.settings.rhs_margin != 'left') {
				this.element.append(rmargin);
			}

			// get current diff border color
			var color = jQuery('<div style="display:none" class="mergely current start" />').appendTo('body').css('border-top-color');
			this.current_diff_color = color;

			// codemirror
			var cmstyle = '#' + this.id + ' .CodeMirror-gutter-text { padding: 5px 0 0 0; }' +
				'#' + this.id + ' .CodeMirror-lines pre, ' + '#' + this.id + ' .CodeMirror-gutter-text pre { line-height: 18px; }' +
				'.CodeMirror-linewidget { position: static; padding-left: 0 !important; };';
			if (this.settings.autoresize) {
				cmstyle += this.id + ' .CodeMirror-scroll { height: 100%; overflow: auto; }';
			}
			// adjust the margin line height
			cmstyle += '\n.CodeMirror { line-height: 18px; }';
			jQuery('<style type="text/css">' + cmstyle + '</style>').appendTo('head');

			//bind
			var rhstx = this.element.find('#' + this.id + '-rhs').get(0);
			if (!rhstx) {
				console.error('rhs textarea not defined - Mergely not initialized properly');
				return;
			}
			var lhstx = this.element.find('#' + this.id + '-lhs').get(0);
			if (!rhstx) {
				console.error('lhs textarea not defined - Mergely not initialized properly');
				return;
			}
			var self = this;
			this.editor = [];
			this.editor[this.id + '-lhs'] = CodeMirror.fromTextArea(lhstx, this.lhs_cmsettings);
			this.editor[this.id + '-rhs'] = CodeMirror.fromTextArea(rhstx, this.rhs_cmsettings);
			this.editor[this.id + '-lhs'].on('change', function () {
//			if (self.settings.autoupdate)
				if (false)
					self._changing(self.id + '-lhs', self.id + '-rhs');
			});
			this.editor[this.id + '-lhs'].on('scroll', function () {
				self._scrolling(self.id + '-lhs');
			});
			this.editor[this.id + '-rhs'].on('change', function () {
//			if (self.settings.autoupdate)
				if (false)
					self._changing(self.id + '-lhs', self.id + '-rhs');
			});
			this.editor[this.id + '-rhs'].on('scroll', function () {
				self._scrolling(self.id + '-rhs');
			});
			// resize
			if (this.settings.autoresize) {
				var sz_timeout1 = null;
				var sz = function (init) {
					//self.em_height = null; //recalculate
					if (self.settings.resize) self.settings.resize(init);
					self.editor[self.id + '-lhs'].refresh();
					self.editor[self.id + '-rhs'].refresh();
					if (self.settings.autoupdate) {
						self._changing(self.id + '-lhs', self.id + '-rhs');
					}
				};
				jQuery(window).on('resize.mergely',
					function () {
						//console.log('call resize');
						if (sz_timeout1) clearTimeout(sz_timeout1);
						sz_timeout1 = setTimeout(sz, self.settings.resize_timeout);
					}
				);

				jQuery('#cloneBtn').on('click',
					function () {
						//console.log('cloneBtn');
						var toSave = self.lhs(xmlTextLeft2);
						self.update();
					}
				);
				jQuery('#update1Btn').on('click',
					function () {
						//console.log('update1Btn');
						var toSave = self.lhs(xmlTextLeft1);
						self.update();
					}
				);
				sz(true);
			}

			// scrollToDiff() from gutter
			function gutterClicked(side, line, ev) {
				//console.log('gutterClicked');
				// The "Merge left/right" buttons are also located in the gutter.
				// Don't interfere with them:
				if (ev.target && (jQuery(ev.target).closest('.merge-button').length > 0)) {
					return;
				}
				// See if the user clicked the line number of a difference:
				var i, change;
				for (i = 0; i < this.changes.length; i++) {
					change = this.changes[i];
					if (line >= change[side + '-line-from'] && line <= change[side + '-line-to']) {
						this._current_diff = i;
						// I really don't like this here - something about gutterClick does not
						// like mutating editor here.  Need to trigger the scroll to diff from
						// a timeout.
						setTimeout(function () {
							this.scrollToDiff();
						}.bind(this), 10);
						break;
					}
				}
			}
			/**
			 *     new functions for XML editor
			 *     bind click event listener for left panel
			 *     temporary excluded due to low reliability
			 */
			if (self.mode == 'TXT' || self.mode == 'XML' || self.mode == 'RAWXML' || self.mode == 'RAWTXT' || self.mode == 'JSON' || self.mode == 'RAWJSON') {
				var base = document.querySelector('#' + self.id + '-editor-lhs');
				var selector = '.CodeMirror-line';

				// detect the line has been clicked
				// show the context menu with available options
				base.addEventListener('click', function (event) {
					if (true) return;
					//console.log('contextmenu');
					// find the closest parent of the event target that
					// matches the selector
					var closest = event.target.closest(selector);
					if (closest && base.contains(closest)) {
						// handle class event
						event.target.classList.add('visibility');

						self.lineToEdit = self._getLineNumber(event.target.parentNode);
						//console.log('number:'+self.lineToEdit);
						if (self.lineToEdit) {
							var line = self.parserL.getLine(self.lineToEdit - 1);
							//console.log('line:'+JSON.stringify(line));
							if (line && line.node == true) return;
							var tag = line.name;
							var tagVal = '';
							if (line.leaf == true) {
								tagVal = line.value;
							}
							self._updateTagFields(tag, tagVal);
							// Avoid the real event propagation
							event.preventDefault();

							// Show contextmenu
							$(".custom-menu").finish().toggle(100).// In the right position (the mouse)
							css({
								top: event.pageY + "px",
								left: event.pageX + "px"
							});
						}
					}
				});


				this.editor[this.id + '-lhs'].on('gutterClick', function (cm, n, gutterClass, ev) {
					gutterClicked.call(this, 'lhs', n, ev);
				}.bind(this));

				this.editor[this.id + '-rhs'].on('gutterClick', function (cm, n, gutterClass, ev) {
					gutterClicked.call(this, 'rhs', n, ev);
				}.bind(this));
			}
			//bind
			var setv;
			if (this.settings.lhs) {
				setv = this.editor[this.id + '-lhs'].getDoc().setValue;
				this.settings.lhs(setv.bind(this.editor[this.id + '-lhs'].getDoc()));
			}
			if (this.settings.rhs) {
				setv = this.editor[this.id + '-rhs'].getDoc().setValue;
				this.settings.rhs(setv.bind(this.editor[this.id + '-rhs'].getDoc()));
			}
		},
		_updateTagFields: function(tag,value){
			if (value){
				document.getElementById("tagValue").value = value;
				$("#tagValue").prop("disabled", false);
			}else{
				document.getElementById("tagValue").value = '';
				$("#tagValue").prop("disabled", true);
			}
			document.getElementById("tag").value = tag;

		},
		/**
		 *	Returns line's number
		 */
		_getLineNumber : function(node){
			if (node){
				// find CodeMirror-line node
				var nodeLine = node;// = node.parentNode;
				if (node && !this._contains(node.className,'CodeMirror-line')){// get 1 level up
					nodeLine = node.parentNode;
					if (nodeLine && !this._contains(nodeLine.className,'CodeMirror-line')) return;
				}
				if (nodeLine.parentNode){
					var childs = nodeLine.parentNode.childNodes;
					if (childs && childs.length > 0){
						for (var x = 0; x < childs.length; x ++){
							if (this._contains(childs[x].className,'CodeMirror-gutter-wrapper')) return childs[x].innerText;
						}
					}
				}
			}
		},
		_contains : function(str,token){
			if (str && token){
				return str.indexOf(token) > -1;
			}
			return false;
		},
		_scroll_to_change : function(change) {
			if (!change) return;
			var self = this;
			self.scrollToChange = true;
			var led = self.editor[self.id+'-lhs'];
			var red = self.editor[self.id+'-rhs'];
			// set cursors
			led.setCursor(Math.max(change["lhs-line-from"],0), 0); // use led.getCursor().ch ?
			red.setCursor(Math.max(change["rhs-line-from"],0), 0);
			if (change["lhs-line-to"] >= 0) {
				const countChangeLine = change["lhs-line-to"] - change["lhs-line-from"];
				let lineNumber;
				let wrapper = led.getWrapperElement();
				let height = wrapper.clientHeight;
				let lineHeight = parseFloat(getComputedStyle(wrapper.querySelector(".CodeMirror-code > div")).lineHeight);
				let visibleLines = Math.floor(height / lineHeight);
				if (countChangeLine <= visibleLines) {
					lineNumber = Math.floor((change["lhs-line-from"] + change["lhs-line-to"])/2) + Math.floor(visibleLines / 2);
					if (lineNumber > led.doc.size){
						lineNumber = led.doc.size - 1;
					}
				} else {
					lineNumber = change["lhs-line-from"] + Math.floor(visibleLines / 2);
				}
				if (this.settings.sidebar) {
					led.scrollIntoView({line: lineNumber}, height);
				}
			}
		},
		_scrolling: function(editor_name) {

			if (this._skipscroll[editor_name] === true) {
				// scrolling one side causes the other to event - ignore it
				this._skipscroll[editor_name] = false;
				return;
			}
			var scroller = jQuery(this.editor[editor_name].getScrollerElement());
			if (this.midway == undefined) {
				this.midway = (scroller.height() / 2.0 + scroller.offset().top).toFixed(2);
			}
			// balance-line
			var midline = this.editor[editor_name].coordsChar({left:0, top:this.midway});
			var top_to = scroller.scrollTop() + 1;
			var left_to = scroller.scrollLeft();

			this.trace('scroll', 'side', editor_name);
			this.trace('scroll', 'midway', this.midway);
			this.trace('scroll', 'midline', midline);
			this.trace('scroll', 'top_to', top_to);
			this.trace('scroll', 'left_to', left_to);

			var editor_name1 = this.id + '-lhs';
			var editor_name2 = this.id + '-rhs';

			for (var name in this.editor) {
				if (!this.editor.hasOwnProperty(name)) continue;
				if (editor_name == name) continue; //same editor
				var this_side = editor_name.replace(this.id + '-', '');
				var other_side = name.replace(this.id + '-', '');
				var top_adjust = 0;

				// find the last change that is less than or within the midway point
				// do not move the rhs until the lhs end point is >= the rhs end point.
				var last_change = null;
				var force_scroll = false;

				var vp = this.editor[name].getViewport();
				var scroll = true;
				if (last_change) {
					this.trace('scroll', 'last change before midline', last_change);
					if (midline.line >= vp.from && midline <= vp.to) {
						scroll = false;
					}
				}
				this.trace('scroll', 'scroll', scroll);
				if (scroll || force_scroll) {
					// scroll the other side
					this.trace('scroll', 'scrolling other side', top_to - top_adjust);
					this._skipscroll[name] = true;//disable next event
					this.editor[name].scrollTo(left_to, top_to - top_adjust);
				}
				else this.trace('scroll', 'not scrolling other side');

				if (this.settings.autoupdate && (this.mode == 'TXT' || this.mode == 'XML' || this.mode == 'RAWXML' || this.mode == 'TXTXML' || this.mode == 'XMLTXT' || this.mode == 'JSON' || this.mode == 'RAWJSON')) {
					var timer = new Mgly.Timer();
					this._calculate_offsets(editor_name1, editor_name2, this.changes);
					this.trace('change', 'offsets time', timer.stop());
					this._markup_changes(editor_name1, editor_name2, this.changes);
					this.trace('change', 'markup time', timer.stop());
					this._draw_diff(editor_name1, editor_name2, this.changes);
					this.trace('change', 'draw time', timer.stop());
				}
				this.trace('scroll', 'scrolled');
			}
		},
		_changing: function(editor_name1, editor_name2) {
//		if (this.changes == undefined) return;
			this.trace('change', 'changing-timeout', this.changed_timeout);
			var self = this;
			if (this.changed_timeout != null) clearTimeout(this.changed_timeout);
			this.changed_timeout = setTimeout(function(){
				var timer = new Mgly.Timer();
				if (self.mode == 'RAWXML' || self.mode == 'TXT' || self.mode == 'RAWTXT' || self.mode == 'TXTXML' || self.mode == 'JSON' || self.mode == 'RAWJSON'){
					self._changed(editor_name1, editor_name2);
				}else if (self.mode == 'XML' || self.mode == 'XMLTXT'){
					self._changedXml(editor_name1, editor_name2, true);
				}
				self.trace('change', 'total time', timer.stop());
			}, this.settings.change_timeout);
		},
		_changed: function(editor_name1, editor_name2) {
			console.log('_changed ');
			this._clear();
			this._diff(editor_name1, editor_name2);
		},
		_changedXml: function(editor_name1, editor_name2, restore) {
//		this._clear();
			var timer = new Mgly.Timer();
//		this.savePos();
			if (this.changes == undefined) return;
			this.trace('change', 'parse time', timer.stop());
			if (this.settings.collapseAll === true) {
            	if (this.changes.length) {
			    	this._scroll_to_change(this.changes[0]);
                }
				this.restorePos();
			} else if (this._current_diff === undefined && this.changes.length) {
				// go to first difference on start-up
				this._current_diff = 0;
				this._scroll_to_change(this.changes[0]);
			}
			this.trace('change', 'scroll_to_change time', timer.stop());
			this._markup_changes(editor_name1, editor_name2, this.changes);
			this.trace('change', 'markup time', timer.stop());

			//locks scroll to first change
			//if (restore) {
			//	this.restorePos();
			//}
			this._spinner(false);
		},
		_clear: function() {
			var self = this, name, editor, fns, timer, i, change, l;

			var clear_changes = function() {
				timer = new Mgly.Timer();
				for (i = 0, l = editor.lineCount(); i < l; ++i) {
					editor.removeLineClass(i, 'background');
				}
				for (i = 0; i < fns.length; ++i) {
					//var edid = editor.getDoc().id;
					change = fns[i];
					//if (change.doc.id != edid) continue;
					if (change.lines.length) {
						self.trace('change', 'clear text', change.lines[0].text);
					}
					change.clear();
				}
				editor.clearGutter('merge');
				self.trace('change', 'clear time', timer.stop());
			};

			for (name in this.editor) {
				if (!this.editor.hasOwnProperty(name)) continue;
				editor = this.editor[name];
				fns = self.chfns[name];
				// clear editor changes
				editor.operation(clear_changes);
			}
			self.chfns[name] = [];

			var ex = this._draw_info(this.id + '-lhs', this.id + '-rhs');
			var ctx_lhs = ex.clhs.get(0).getContext('2d');
			var ctx_rhs = ex.crhs.get(0).getContext('2d');
			var ctx = ex.dcanvas.getContext('2d');

			ctx_lhs.beginPath();
			ctx_lhs.fillStyle = this.settings.bgcolor;
			ctx_lhs.strokeStyle = '#888';
			ctx_lhs.fillRect(0, 0, 6.5, ex.visible_page_height);
			ctx_lhs.strokeRect(0, 0, 6.5, ex.visible_page_height);

			ctx_rhs.beginPath();
			ctx_rhs.fillStyle = this.settings.bgcolor;
			ctx_rhs.strokeStyle = '#888';
			ctx_rhs.fillRect(0, 0, 6.5, ex.visible_page_height);
			ctx_rhs.strokeRect(0, 0, 6.5, ex.visible_page_height);

			ctx.beginPath();
			ctx.fillStyle = '#fff';
			ctx.fillRect(0, 0, this.draw_mid_width, ex.visible_page_height);
		},
		_spinner: function(start){
			console.log('spinner:'+start);
			if (start == true){
				document.getElementById("loader").style.display = "block";
			}else{
				document.getElementById("loader").style.display = "none";
			}
		},
		_diff: function(editor_name1, editor_name2) {
			this._spinner(true);
			/*if (this.lhs_cmsettings.mode == 'RAWXML' || this.lhs_cmsettings.mode == 'RAWTXT'){
				this.editor[editor_name1].setValue(this.leftOrig);
				this.editor[editor_name2].setValue(this.rightOrig);
				this._spinner(false);
				return;
			}*/

			var timer = new Mgly.Timer();
			var d = new Mgly.diff(this.leftOrig, this.rightOrig, this.settings);
			this.trace('change', 'diff time', timer.stop());
			this.changesOrig = Mgly.DiffParser(d.normal_form());
			this.changes = [];
			this.updateChangeCounters();
			this.leftArray  = this.leftOrig.split('\n');
			this.rightArray = this.rightOrig ? this.rightOrig.split("\n") : [];
			var newLeftArray = [], newRightArray = [];
			var lLine = 0, rLine = 0;
			var lCount = 0, rCount = 0;
			var lExcess = 0, rExcess = 0;
			//changes:[
			//	{"lhs-line-from":7,"lhs-line-to":7,"rhs-line-from":6,"rhs-line-to":6,"op":"d"},
			//	{"lhs-line-from":14,"lhs-line-to":22,"rhs-line-from":13,"rhs-line-to":13,"op":"c"}
			//]
			var leftMap = {}, rightMap = {};
			for (var i = 0; i < this.changesOrig.length; i++){
				var change = this.changesOrig[i];
				var newChange = {};

				if (change['op'] == 'd'){
					for (var j = lLine; j < change['lhs-line-from']; j++){
						newLeftArray.push(this.leftArray[j]);
						leftMap[lCount++] = j;
					}
					for (var j = rLine; j < change['rhs-line-from']+1; j++){
						newRightArray.push(this.rightArray[j]);
						rightMap[rCount++] = j;
					}
					var from = change['lhs-line-from'];
					for (var j = from; j < change['lhs-line-to']+1; j++){
						newLeftArray.push(this.leftArray[j]);
						leftMap[lCount++] = j;
						newRightArray.push('');
						rCount++;
					}
					var size = change['lhs-line-to']-from+1;
					rExcess += size;
					lLine = change['lhs-line-to']+1;
					rLine = change['rhs-line-to']+1;
					newChange['lhs-line-from'] = change['lhs-line-from'] + lExcess;
					newChange['rhs-line-from'] = newChange['lhs-line-from'];
					newChange['lhs-line-to'] = change['lhs-line-from'] +lExcess+ size - 1;
					newChange['rhs-line-to'] = newChange['lhs-line-to'];
					newChange['op'] = 'd';
				}else if (change['op'] == 'a'){
					for (var j = lLine; j < change['lhs-line-from']+1; j++){
						newLeftArray.push(this.leftArray[j]);
						leftMap[lCount++] = j;
					}
					for (var j = rLine; j < change['rhs-line-from']; j++){
						newRightArray.push(this.rightArray[j]);
						rightMap[rCount++] = j;
					}
					var from = change['rhs-line-from'];
					for (var j = from; j < change['rhs-line-to']+1; j++){
						newRightArray.push(this.rightArray[j]);
						rightMap[rCount++] = j;
						newLeftArray.push('');
						lCount++;
					}
					var size = change['rhs-line-to']-from+1;
					lExcess += size;
					lLine = change['lhs-line-to']+1;
					rLine = change['rhs-line-to']+1;
					newChange['rhs-line-from'] = change['rhs-line-from'] + rExcess;
					newChange['lhs-line-from'] = newChange['rhs-line-from'];
					newChange['rhs-line-to'] = change['rhs-line-from'] +rExcess+ size - 1;
					newChange['lhs-line-to'] = newChange['rhs-line-to'];
					newChange['op'] = 'a';
				}else if (change['op'] == 'c'){
					for (var j = lLine; j < change['lhs-line-from']; j++){
						newLeftArray.push(this.leftArray[j]);
						leftMap[lCount++] = j;
					}
					for (var j = rLine; j < change['rhs-line-from']; j++){
						newRightArray.push(this.rightArray[j]);
						rightMap[rCount++] = j;
					}
					var froml = change['lhs-line-from'];
					for (var j = froml; j < change['lhs-line-to']+1; j++){
						newLeftArray.push(this.leftArray[j]);
						leftMap[lCount++] = j;
					}
					var fromr = change['rhs-line-from'];
					for (var j = fromr; j < change['rhs-line-to']+1; j++){
						newRightArray.push(this.rightArray[j]);
						rightMap[rCount++] = j;
					}
					// add a  tail
					var sizel = change['lhs-line-to']-froml+1;
					var sizer = change['rhs-line-to']-fromr+1;
					var size = Math.max(sizel,sizer);
					lLine = change['lhs-line-to']+1;
					rLine = change['rhs-line-to']+1;
					newChange['lhs-line-from'] = change['lhs-line-from'] + lExcess;
					newChange['rhs-line-from'] = newChange['lhs-line-from'];
					newChange['lhs-line-to'] = change['lhs-line-from'] +lExcess+ size - 1;
					newChange['rhs-line-to'] = newChange['lhs-line-to'];
					newChange['op'] = 'c';
					if (sizel > sizer){
						rExcess += (sizel-sizer);
						for (var x = 0; x < sizel-sizer; x++){
							newRightArray.push('');
							rCount++;
						}
					}else if (sizel < sizer){
						lExcess += (sizer-sizel);
						for (var x = 0; x < sizer-sizel; x++){
							newLeftArray.push('');
							lCount++;
						}
					}
				}
				this.changes.push(newChange);
			}
			newLeftArray = newLeftArray.concat(this.leftArray.slice(lLine));
			newRightArray = newRightArray.concat(this.rightArray.slice(rLine));
			for (var j = lLine; j < this.leftArray.length; j++){
				leftMap[lCount++] = j;
			}
			for (var j = rLine; j < this.rightArray.length; j++){
				rightMap[rCount++] = j;
			}

			var left = newLeftArray.join('\n');
			var right = newRightArray.join('\n');
			this.editor[editor_name1].setNumberMap(leftMap);
			this.editor[editor_name2].setNumberMap(rightMap);
			this.editor[editor_name1].setValue(left);
			this.editor[editor_name2].setValue(right);

			this.trace('change', 'parse time', timer.stop());
			if (this._current_diff === undefined && this.changes.length && this.settings.collapseAll === true) {
				this.restorePos();
			} else if (this._current_diff === undefined && this.changes.length) {
				// go to first difference on start-up
				this._current_diff = 0;
				this._scroll_to_change(this.changes[0]);
			} else {
				if (this.settings.collapseAll === true){
					this._scroll_to_change(this.changes[this._current_diff]);
					this.settings.collapseAll = false;
				} else if (this.scrollToChange === true){
					this._scroll_to_change(this.changes[this._current_diff]);
					this.scrollToChange = false;
				} else {
					this.restorePos();
				}
			}

			this.trace('change', 'scroll_to_change time', timer.stop());
			this._calculate_offsets(editor_name1, editor_name2, this.changes);
			this.trace('change', 'offsets time', timer.stop());
			this._markup_changes(editor_name1, editor_name2, this.changes);
			this.trace('change', 'markup time', timer.stop());
			this._draw_diff(editor_name1, editor_name2, this.changes);
			this.trace('change', 'draw time', timer.stop());
			if (this.lhs_cmsettings.mode == 'XMLTXT' || this.lhs_cmsettings.mode == 'TXTXML' || this.lhs_cmsettings.mode == 'RAWXML') {
				this.element.find('.merge-button').remove();
			}
			this._spinner(false);
		},

		_parse_diff: function (editor_name1, editor_name2, diff) {
			this.trace('diff', 'diff results:\n', diff);
			var changes = [];
			var change_id = 0;
			// parse diff
			var diff_lines = diff.split(/\n/);
			for (var i = 0; i < diff_lines.length; ++i) {
				if (diff_lines[i].length == 0) continue;
				var change = {};
				var test = this.change_exp.exec(diff_lines[i]);
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
				// TODO: optimize for changes that are adds/removes
				if (change['lhs-line-from'] < 0) change['lhs-line-from'] = 0;
				if (change['lhs-line-to'] < 0) change['lhs-line-to'] = 0;
				if (change['rhs-line-from'] < 0) change['rhs-line-from'] = 0;
				if (change['rhs-line-to'] < 0) change['rhs-line-to'] = 0;
				change['op'] = test[2];
				changes[change_id++] = change;
				this.trace('diff', 'change', change);
			}
			return changes;
		},

		_get_viewport_side: function(editor_name) {
			return this.editor[editor_name].getViewport();
		},
		_get_viewport: function(editor_name1, editor_name2) {
			var lhsvp = this.editor[editor_name1].getViewport();
			var rhsvp = this.editor[editor_name2].getViewport();
			return {from: Math.min(lhsvp.from, rhsvp.from), to: Math.max(lhsvp.to, rhsvp.to)};
		},
		_is_change_in_view: function(side, vp, change) {
			return (change[side+'-line-from'] >= vp.from && change[side+'-line-from'] <= vp.to) ||
				(change[side+'-line-to'] >= vp.from && change[side+'-line-to'] <= vp.to) ||
				(vp.from >= change[side+'-line-from'] && vp.to <= change[side+'-line-to']);
		},
		/*_is_change_in_view: function(vp, change) {
			if (!this.settings.viewport) return true;
			if ((change['lhs-line-from'] < vp.from && change['lhs-line-to'] < vp.to) ||
				(change['lhs-line-from'] > vp.from && change['lhs-line-to'] > vp.to) ||
				(change['rhs-line-from'] < vp.from && change['rhs-line-to'] < vp.to) ||
				(change['rhs-line-from'] > vp.from && change['rhs-line-to'] > vp.to)) {
				// if the change is outside the viewport, skip
				return false;
			}
			return true;
		},*/
		_set_top_offset: function (editor_name1) {
			// save the current scroll position of the editor
			var saveY = this.editor[editor_name1].getScrollInfo().top;
			// temporarily scroll to top
			this.editor[editor_name1].scrollTo(null, 0);

			// this is the distance from the top of the screen to the top of the
			// content of the first codemirror editor
			var topnode = this.element.find('.CodeMirror-measure').first();
			var top_offset = topnode.offset().top - 4;
			if(!top_offset) return false;

			// restore editor's scroll position
			this.editor[editor_name1].scrollTo(null, saveY);

			this.draw_top_offset = 0.5 - top_offset;
			return true;
		},
		_calculate_offsets: function (editor_name1, editor_name2, changes) {
			if (this.em_height == null) {
				if(!this._set_top_offset(editor_name1)) return; //try again
				this.em_height = this.editor[editor_name1].defaultTextHeight();
				if (!this.em_height) {
					console.warn('Failed to calculate offsets, using 18 by default');
					this.em_height = 18;
				}
				this.draw_lhs_min = 0.5;
				var c = jQuery('#' + editor_name1 + '-' + editor_name2 + '-canvas');
				if (!c.length) {
					console.error('failed to find canvas', '#' + editor_name1 + '-' + editor_name2 + '-canvas');
				}
				if (!c.width()) {
					console.error('canvas width is 0');
					return;
				}
				this.draw_mid_width = jQuery('#' + editor_name1 + '-' + editor_name2 + '-canvas').width();
				this.draw_rhs_max = this.draw_mid_width - 0.5; //24.5;
				this.draw_lhs_width = 5;
				this.draw_rhs_width = 5;
				this.trace('calc', 'change offsets calculated', {top_offset: this.draw_top_offset, lhs_min: this.draw_lhs_min, rhs_max: this.draw_rhs_max, lhs_width: this.draw_lhs_width, rhs_width: this.draw_rhs_width});
			}
			var lhschc = this.editor[editor_name1].charCoords({line: 0});
			var rhschc = this.editor[editor_name2].charCoords({line: 0});
			var vp = this._get_viewport(editor_name1, editor_name2);
			var lhsvp = this._get_viewport_side(editor_name1);
			var rhsvp = this._get_viewport_side(editor_name2);

			for (var i = 0; i < changes.length; ++i) {
				var change = changes[i];

				if (!this.settings.sidebar && !this._is_change_in_view(lhsvp, 'lhs', change) &&
					!this._is_change_in_view(rhsvp, 'rhs', change)) {
					// if the change is outside the viewport, skip
					delete change['lhs-y-start'];
					delete change['lhs-y-end'];
					delete change['rhs-y-start'];
					delete change['rhs-y-end'];
					continue;
				}
				var llf = change['lhs-line-from'] >= 0 ? change['lhs-line-from'] : 0;
				var llt = change['lhs-line-to'] >= 0 ? change['lhs-line-to'] : 0;
				var rlf = change['rhs-line-from'] >= 0 ? change['rhs-line-from'] : 0;
				var rlt = change['rhs-line-to'] >= 0 ? change['rhs-line-to'] : 0;

				var ls, le, rs, re, tls, tle, lhseh, lhssh, rhssh, rhseh;
				if (this.editor[editor_name1].getOption('lineWrapping') || this.editor[editor_name2].getOption('lineWrapping')) {
					// If using line-wrapping, we must get the height of the line
					tls = this.editor[editor_name1].cursorCoords({line: llf, ch: 0}, 'page');
					lhssh = this.editor[editor_name1].getLineHandle(llf);
					ls = { top: tls.top, bottom: tls.top + lhssh.height };

					tle = this.editor[editor_name1].cursorCoords({line: llt, ch: 0}, 'page');
					lhseh = this.editor[editor_name1].getLineHandle(llt);
					le = { top: tle.top, bottom: tle.top + lhseh.height };

					tls = this.editor[editor_name2].cursorCoords({line: rlf, ch: 0}, 'page');
					rhssh = this.editor[editor_name2].getLineHandle(rlf);
					rs = { top: tls.top, bottom: tls.top + rhssh.height };

					tle = this.editor[editor_name2].cursorCoords({line: rlt, ch: 0}, 'page');
					rhseh = this.editor[editor_name2].getLineHandle(rlt);
					re = { top: tle.top, bottom: tle.top + rhseh.height };
				}
				else {
					// If not using line-wrapping, we can calculate the line position
					ls = {
						top: lhschc.top + llf * this.em_height,
						bottom: lhschc.bottom + llf * this.em_height + 2
					};
					le = {
						top: lhschc.top + llt * this.em_height,
						bottom: lhschc.bottom + llt * this.em_height + 2
					};
					rs = {
						top: rhschc.top + rlf * this.em_height,
						bottom: rhschc.bottom + rlf * this.em_height + 2
					};
					re = {
						top: rhschc.top + rlt * this.em_height,
						bottom: rhschc.bottom + rlt * this.em_height + 2
					};
				}

				if (change['op'] == 'a') {
					// adds (right), normally start from the end of the lhs,
					// except for the case when the start of the rhs is 0
					if (rlf > 0) {
						ls.top = ls.bottom;
						ls.bottom += this.em_height;
						le = ls;
					}
				}
				else if (change['op'] == 'd') {
					// deletes (left) normally finish from the end of the rhs,
					// except for the case when the start of the lhs is 0
					if (llf > 0) {
						rs.top = rs.bottom;
						rs.bottom += this.em_height;
						re = rs;
					}
				}
				change['lhs-y-start'] = this.draw_top_offset + ls.top;
				if (change['op'] == 'c' || change['op'] == 'd') {
					change['lhs-y-end'] = this.draw_top_offset + le.bottom;
				}
				else {
					change['lhs-y-end'] = this.draw_top_offset + le.top;
				}
				change['rhs-y-start'] = this.draw_top_offset + rs.top;
				if (change['op'] == 'c' || change['op'] == 'a') {
					change['rhs-y-end'] = this.draw_top_offset + re.bottom;
				}
				else {
					change['rhs-y-end'] = this.draw_top_offset + re.top;
				}
				this.trace('calc', 'change calculated', i, change);
			}
			return changes;
		},
		_markup_changes: function (editor_name1, editor_name2, changes) {
			this.element.find('.merge-button').remove(); //clear

			var self = this;
			var led = this.editor[editor_name1];
			var red = this.editor[editor_name2];
			var current_diff = this._current_diff;

			var vp = this._get_viewport(editor_name1, editor_name2);
			var lhsvp = this._get_viewport_side(editor_name1);
			var rhsvp = this._get_viewport_side(editor_name2);
			var timer = new Mgly.Timer();

			led.operation(function () {
				for (var i = 0; i < changes.length; ++i) {
					var change = changes[i];
					if (!self._is_change_in_view('lhs', lhsvp, change)) {
						// if the change is outside the viewport, skip
						console.log('not in view change');
						continue;
					}
					var llf = change['lhs-line-from'] >= 0 ? change['lhs-line-from'] : 0;
					var llt = change['lhs-line-to'] >= 0 ? change['lhs-line-to'] : 0;
					var rlf = change['rhs-line-from'] >= 0 ? change['rhs-line-from'] : 0;
					var rlt = change['rhs-line-to'] >= 0 ? change['rhs-line-to'] : 0;


					/*if (self.mode == 'TXTXML' || self.mode == 'XMLTXT')
					{
						var clazz = ['mergely', 'lhs', 'd', 'cid-' + i];
					}
					else
					{*/
					var clazz = ['mergely', 'lhs', change['op'], 'cid-' + i];
					//}
					led.addLineClass(llf, 'background', 'start');
					led.addLineClass(llt, 'background', 'end');
					if (change['lhs-line-from'] < 0) {
						clazz.push('empty');
					}

					if (current_diff == i) {
						if (llf != llt) {
							led.addLineClass(llf, 'background', 'current');
						}
						led.addLineClass(llt, 'background', 'current');
					}
					if (llf == 0 && llt == 0 && rlf == 0) {
						led.addLineClass(llf, 'background', clazz.join(' '));
						led.addLineClass(llf, 'background', 'first');
					}
					else {
						// apply change for each line in-between the changed lines
						for (var j = llf; j <= llt; ++j) {
							led.addLineClass(j, 'background', clazz.join(' '));
							led.addLineClass(j, 'background', clazz.join(' '));
						}
					}
					// use this to make editor read-only
					if (!red.getOption('readOnly')) {
						// add widgets to lhs, if rhs is not read only
						var rhs_button = self.merge_rhs_button.clone();
						if (rhs_button.button) {
							//jquery-ui support
						}
						rhs_button.addClass('merge-button');
						rhs_button.attr('id', 'merge-rhs-' + i);
						led.setGutterMarker(llf, 'merge', rhs_button.get(0));
					}
				}
			});

			this.trace('change', 'markup lhs-editor time', timer.stop());

			red.operation(function () {
				for (var i = 0; i < changes.length; ++i) {
					var change = changes[i];
					if (!self._is_change_in_view('rhs', rhsvp, change)) {
						// if the change is outside the viewport, skip
						continue;
					}
					var llf = change['lhs-line-from'] >= 0 ? change['lhs-line-from'] : 0;
					var llt = change['lhs-line-to'] >= 0 ? change['lhs-line-to'] : 0;
					var rlf = change['rhs-line-from'] >= 0 ? change['rhs-line-from'] : 0;
					var rlt = change['rhs-line-to'] >= 0 ? change['rhs-line-to'] : 0;


					/*if (self.mode == 'TXTXML' || self.mode == 'XMLTXT')
					{
						var clazz = ['mergely', 'rhs', 'a', 'cid-' + i];
					}
					else
					{*/
					var clazz = ['mergely', 'rhs', change['op'], 'cid-' + i];
					//}
					red.addLineClass(rlf, 'background', 'start');
					red.addLineClass(rlt, 'background', 'end');
					if (change['rhs-line-from'] < 0) {
						clazz.push('empty');
					}

					if (current_diff == i) {
						if (rlf != rlt) {
							red.addLineClass(rlf, 'background', 'current');
						}
						red.addLineClass(rlt, 'background', 'current');
					}
					if (rlf == 0 && rlt == 0 && llf == 0) {
						red.addLineClass(rlf, 'background', clazz.join(' '));
						red.addLineClass(rlf, 'background', 'first');
					}
					else {
						// apply change for each line in-between the changed lines
						for (var j = rlf; j <= rlt; ++j) {
							red.addLineClass(j, 'background', clazz.join(' '));
							red.addLineClass(j, 'background', clazz.join(' '));
						}
					}
					//if (sel.readOnlyWholePanel == true) continue;
					// add widgets to rhs, if lhs is not read only
					var merge_button;

					//jquery-ui support
					if (change.op == 'a' || change.op == 'c') {
						merge_button = self.merge_rhs_button.clone();
						if (merge_button.button) {
							merge_button.button({icons: {primary: 'ui-icon-triangle-1-w'}, text: false});
						}
					} else {
						merge_button = self.merge_lhs_button.clone();
						if (merge_button.button) {
							merge_button.button({icons: {primary: 'ui-icon-triangle-1-e'}, text: false});
						}
					}
					merge_button.addClass('merge-button');

					merge_button.attr('id', 'merge-lhs-' + i);
					if (self.lhs_cmsettings.readOnlyWholePanel == true) {
						red.setGutterMarker(rlf, 'merge');
					} else {
						red.setGutterMarker(rlf, 'merge', merge_button.get(0));
					}
				}
			});
			this.trace('change', 'markup rhs-editor time', timer.stop());

			// mark text deleted, LCS changes
			var marktext = [], i, j, k, p;
			for (i = 0; this.settings.lcs && i < changes.length; ++i) {
				var change = changes[i];
				var llf = change['lhs-line-from'] >= 0 ? change['lhs-line-from'] : 0;
				var llt = change['lhs-line-to'] >= 0 ? change['lhs-line-to'] : 0;
				var rlf = change['rhs-line-from'] >= 0 ? change['rhs-line-from'] : 0;
				var rlt = change['rhs-line-to'] >= 0 ? change['rhs-line-to'] : 0;

				/*if (!this._is_change_in_view(vp, change)) {
					// if the change is outside the viewport, skip
					continue;
				}*/
				if (change['op'] == 'd') {
					// apply delete to cross-out (left-hand side only)
					var from = llf;
					var to = llt;
					if (this._is_change_in_view('lhs', lhsvp, change)) {
						var to_ln = led.lineInfo(to);
						if (to_ln) {
							marktext.push([led, {line:from, ch:0}, {line:to, ch:to_ln.text.length}, {className: 'mergely ch d lhs'}]);
						}
					}
				}
				else if (change['op'] == 'c') {
					// apply LCS changes to each line
					for (j = llf, k = rlf, p = 0;
						 ((j >= 0) && (j <= llt)) || ((k >= 0) && (k <= rlt));
						 ++j, ++k) {
						var lhs_line, rhs_line;
						if (k + p > rlt && this._is_change_in_view('lhs', lhsvp, change)) {
							// lhs continues past rhs, mark lhs as deleted
							lhs_line = led.getLine( j );
							marktext.push([led, {line:j, ch:0}, {line:j, ch:lhs_line.length}, {className: 'mergely ch c lhs'}]);
							continue;
						}
						if (j + p > llt && this._is_change_in_view('rhs', rhsvp, change)) {
							// rhs continues past lhs, mark rhs as added
							rhs_line = red.getLine( k );
							marktext.push([red, {line:k, ch:0}, {line:k, ch:rhs_line.length}, {className: 'mergely ch c rhs'}]);
							continue;
						}
						lhs_line = led.getLine( j );
						rhs_line = red.getLine( k );
						var lcs = new Mgly.LCS(lhs_line, rhs_line);
						lcs.diff(
							function added (from, to) {
								if (self._is_change_in_view('rhs', rhsvp, change)) {
									marktext.push([red, {line: k, ch: from}, {
										line: k,
										ch: to
									}, {className: 'mergely ch c rhs'}]);
								}
							},
							function removed (from, to) {
								if (self._is_change_in_view('lhs', lhsvp, change)) {
									marktext.push([led, {line: j, ch: from}, {
										line: j,
										ch: to
									}, {className: 'mergely ch c lhs'}]);
								}
							}
						);
					}
				}
			}
			this.trace('change', 'LCS marktext time', timer.stop());

			// mark changes outside closure
			/*if (this.mode != 'TXTXML' && this.mode != 'XMLTXT' ) {*/
			led.operation(function () {
				// apply lhs markup
				for (var i = 0; i < marktext.length; ++i) {
					var m = marktext[i];
					if (m[0].doc.id != led.getDoc().id) continue;
					self.chfns[self.id + '-lhs'].push(m[0].markText(m[1], m[2], m[3]));
				}
			});
			red.operation(function () {
				// apply lhs markup
				for (var i = 0; i < marktext.length; ++i) {
					var m = marktext[i];
					if (m[0].doc.id != red.getDoc().id) continue;
					self.chfns[self.id + '-rhs'].push(m[0].markText(m[1], m[2], m[3]));
				}
			});
			/*}*/
			this.trace('change', 'LCS markup time', timer.stop());
			var selector = '.CodeMirror-line';

			// merge buttons
			var ed = {lhs: led, rhs: red};
			this.element.find('.merge-button').off('click').on('click', function (ev) {
				self.savePos('inside merge');

				// side of mouseenter
				var side = 'rhs';
				var oside = 'lhs';
				var parent = jQuery(this).parents('#' + self.id + '-editor-lhs');
				if (parent.length) {
					side = 'lhs';
					oside = 'rhs';
				}
				var pos = ed[side].coordsChar({left: ev.pageX, top: ev.pageY});

				// get the change id
				var cid = null;
				if (this.id) {
					cid = parseInt(this.id.split('-')[2], 10);
					// handle class event
					ev.preventDefault();
				}

				self._current_diff = cid;
				self._merge_diff = cid;
				var change = self.changes[cid];

				

				if (self.mode == 'XML' || self.mode == 'XMLTXT') {
					for (let i=0;i<self.changes.length;i++){
						if (i!=cid && change.equalTag && change.equalTag!='' && self.changes[i].equalTag == change.equalTag && change.op == 'a' && self.changes[i].op == 'd'){
							self.parserL.addChanges(self.changes[i]);
							break;
						}
					}
					self.differentiator.push(self.parserL.json);
					if (change.op == 'd') {
						self.parserL.addChanges(change);
					} else if (change.op == 'a') {
						self.parserR.addChanges(change);
					} else if (change.op == 'c') {
						self.parserL.addChanges(change);
					}
					self.parserL.addDeleted = self.parserR.addDeleted;
					self.parserL.applyChanges(self.diff);

					self.updateXml();
				} else {
					self.differentiator.push(self.leftOrig);
					self._merge_change(self.changesOrig[cid], side, oside);
				}
				return false;
			});

			$('#merge-all').off('click').on('click', function (ev) {
				console.log('merge all');
				var allNew = ev.currentTarget.attributes['new'].value;
				var allRemove = ev.currentTarget.attributes['remove'].value;
				var allChanges = ev.currentTarget.attributes['change'].value;

				if (allNew == 'true' && allRemove == 'true' && allChanges == 'true') {
					if (self.mode == 'XML') {
						self.differentiator.push(self.parserL.json);
						self.parserL.json = self.parserR.json;
						self.updateXml();
					} else {
						self.differentiator.push(self.leftOrig);
						self._merge_all_changes();
					}
				}
				else{
					var side = 'rhs';
					var oside = 'lhs';
					var parent = jQuery(this).parents('#' + self.id + '-editor-lhs');
					if (parent.length) {
						side = 'lhs';
						oside = 'rhs';
					}
					//console.log('merge add');
					if (self.mode == 'XML') {

						if ((allNew == 'true') || (allRemove == 'true') || (allChanges == 'true')){
							self.differentiator.push(self.parserL.json);
						}

						for (var i = 0; i < changes.length; ++i) {

							if ((changes[i].op=='a' && allNew == 'true') || (changes[i].op=='d' && allRemove == 'true') || (changes[i].op=='c' && allChanges == 'true')){

								if (changes[i].op=='a' && allNew == 'true')
								{
									self.parserR.addChanges(changes[i]);
								}
								else
								{
									self.parserL.addChanges(changes[i]);
								}
								if (i%3000 == 0){
									self.parserL.addDeleted = self.parserR.addDeleted;
									self.parserL.applyChanges(self.diff);
								}
							}
						}
						self.parserL.addDeleted = self.parserR.addDeleted;
						self.parserL.applyChanges(self.diff);
						self.updateXml();
					} else {
						var incr = 0;
						for (var i = 0; i < changes.length; ++i) {
							if ((changes[i].op=='a' && allNew == 'true') || (changes[i].op=='d' && allRemove == 'true') || (changes[i].op=='c' && allChanges == 'true')){
								self.differentiator.push(self.leftOrig);
								self._merge_change(self.changesOrig[i-incr], side, oside);
								incr++;
								self._changed(self.id + '-lhs', self.id + '-rhs');

							}
						}
					}
				}

				self._spinner(false);
			});

			// gutter markup
			var lhsLineNumbers = jQuery('#mergely-lhs ~ .CodeMirror').find('.CodeMirror-linenumber');
			var rhsLineNumbers = jQuery('#mergely-rhs ~ .CodeMirror').find('.CodeMirror-linenumber');
			rhsLineNumbers.removeClass('mergely current');
			lhsLineNumbers.removeClass('mergely current');
			return;
			for (var i = 0; i < changes.length; ++i) {
				if (current_diff == i && change.op !== 'd') {
					var change = changes[i];
					var j, jf = change['rhs-line-from'], jt = change['rhs-line-to'] + 1;
					for (j = jf; j < jt; j++) {
						var n = (j + 1).toString();
						rhsLineNumbers
							.filter(function (i, node) {
								return jQuery(node).text() === n;
							})
							.addClass('mergely current');
					}
				}
				if (current_diff == i && change.op !== 'a') {
					var change = changes[i];
					jf = change['lhs-line-from'], jt = change['lhs-line-to'] + 1;
					for (j = jf; j < jt; j++) {
						var n = (j + 1).toString();
						lhsLineNumbers
							.filter(function (i, node) {
								return jQuery(node).text() === n;
							})
							.addClass('mergely current');
					}
				}
			}

			this.trace('change', 'markup buttons time', timer.stop());
		},

		_merge_all_changes :	function() {
			var led = this.editor[this.id+'-lhs'];
			var red = this.editor[this.id+'-rhs'];
			var ed = {lhs:led, rhs:red};
			this.leftOrig = this.rightOrig;
			//reset view
			this.update();
		},
		_merge_change :	function(change, side, oside) {
			if (!change) return;
			var total = [];
			if (change['op'] == 'c') {
				// delete lines lhs-line-from"-"lhs-line-to+1"
				// add from rhs-line-from
				var head = this.leftArray.slice(0,change['lhs-line-from']);
				var insert = this.rightArray.slice(change['rhs-line-from'],change['rhs-line-to']+1);
				var tail = this.leftArray.slice(change['lhs-line-to']+1);
				total = head.concat(insert).concat(tail);
			}else if (change['op'] == 'd') {
				// delete lines lhs-line-from"-"lhs-line-to+1"
				var head = this.leftArray.slice(0,change['lhs-line-from']);
				var tail = this.leftArray.slice(change['lhs-line-to']+1);
				total = head.concat(tail);
			}else if (change['op'] == 'a') {
				// add lines at lhs-line-from" from right i.e. rhs-line-from-rhs-line-to+1
				var head = this.leftArray.slice(0,change['lhs-line-from']+1);
				var insert = this.rightArray.slice(change['rhs-line-from'],change['rhs-line-to']+1);
				var tail = this.leftArray.slice(change['lhs-line-to']+1);
				total = head.concat(insert).concat(tail);
			}
			this.leftOrig = total.join('\n');
			//reset view

			this.update();
//		this._scroll_to_change(change);
		},
		_draw_info: function(editor_name1, editor_name2) {
			var visible_page_height = jQuery(this.editor[editor_name1].getScrollerElement()).height() + 17; // fudged
			var gutter_height = jQuery(this.editor[editor_name1].getScrollerElement()).children(':first-child').height();
			var dcanvas = document.getElementById(editor_name1 + '-' + editor_name2 + '-canvas');
			if (dcanvas == undefined) throw 'Failed to find: ' + editor_name1 + '-' + editor_name2 + '-canvas';
			var clhs = this.element.find('#' + this.id + '-lhs-margin');
			var crhs = this.element.find('#' + this.id + '-rhs-margin');
			return {
				visible_page_height: visible_page_height,
				gutter_height: gutter_height,
				visible_page_ratio: (visible_page_height / gutter_height),
				margin_ratio: (visible_page_height / gutter_height),
				lhs_scroller: jQuery(this.editor[editor_name1].getScrollerElement()),
				rhs_scroller: jQuery(this.editor[editor_name2].getScrollerElement()),
				lhs_lines: this.editor[editor_name1].lineCount(),
				rhs_lines: this.editor[editor_name2].lineCount(),
				dcanvas: dcanvas,
				clhs: clhs,
				crhs: crhs,
				lhs_xyoffset: jQuery(clhs).offset(),
				rhs_xyoffset: jQuery(crhs).offset()
			};
		},
		_draw_diff: function(editor_name1, editor_name2, changes) {
			var ex = this._draw_info(editor_name1, editor_name2);
			var mcanvas_lhs = ex.clhs.get(0);
			var mcanvas_rhs = ex.crhs.get(0);
			var ctx = ex.dcanvas.getContext('2d');
			var ctx_lhs = mcanvas_lhs.getContext('2d');
			var ctx_rhs = mcanvas_rhs.getContext('2d');

			this.trace('draw', 'visible_page_height', ex.visible_page_height);
			this.trace('draw', 'gutter_height', ex.gutter_height);
			this.trace('draw', 'visible_page_ratio', ex.visible_page_ratio);
			this.trace('draw', 'lhs-scroller-top', ex.lhs_scroller.scrollTop());
			this.trace('draw', 'rhs-scroller-top', ex.rhs_scroller.scrollTop());

			jQuery.each(this.element.find('canvas'), function () {
				jQuery(this).get(0).height = ex.visible_page_height;
			});

			ex.clhs.unbind('click');
			ex.crhs.unbind('click');

			ctx_lhs.beginPath();
			ctx_lhs.fillStyle = this.settings.bgcolor;
			ctx_lhs.strokeStyle = '#888';
			ctx_lhs.fillRect(0, 0, 6.5, ex.visible_page_height);
			ctx_lhs.strokeRect(0, 0, 6.5, ex.visible_page_height);

			ctx_rhs.beginPath();
			ctx_rhs.fillStyle = this.settings.bgcolor;
			ctx_rhs.strokeStyle = '#888';
			ctx_rhs.fillRect(0, 0, 6.5, ex.visible_page_height);
			ctx_rhs.strokeRect(0, 0, 6.5, ex.visible_page_height);

			var vp = this._get_viewport(editor_name1, editor_name2);
			var lhsvp = this._get_viewport_side(editor_name1);
			var rhsvp = this._get_viewport_side(editor_name2);
			for (var i = 0; i < changes.length; ++i) {
				var change = changes[i];
				var fill = this.settings.fgcolor[change['op']];
				if (this._current_diff === i) {
					fill = this.current_diff_color;
				}

				this.trace('draw', change);
				// margin indicators
				var lhs_y_start = ((change['lhs-y-start'] + ex.lhs_scroller.scrollTop()) * ex.visible_page_ratio);
				var lhs_y_end = ((change['lhs-y-end'] + ex.lhs_scroller.scrollTop()) * ex.visible_page_ratio) + 1;
				var rhs_y_start = ((change['rhs-y-start'] + ex.rhs_scroller.scrollTop()) * ex.visible_page_ratio);
				var rhs_y_end = ((change['rhs-y-end'] + ex.rhs_scroller.scrollTop()) * ex.visible_page_ratio) + 1;
				this.trace('draw', 'marker calculated', lhs_y_start, lhs_y_end, rhs_y_start, rhs_y_end);

				ctx_lhs.beginPath();
				ctx_lhs.fillStyle = fill;
				ctx_lhs.strokeStyle = '#000';
				ctx_lhs.lineWidth = 0.5;
				ctx_lhs.fillRect(1.5, lhs_y_start, 4.5, Math.max(lhs_y_end - lhs_y_start, 5));
				ctx_lhs.strokeRect(1.5, lhs_y_start, 4.5, Math.max(lhs_y_end - lhs_y_start, 5));

				ctx_rhs.beginPath();
				ctx_rhs.fillStyle = fill;
				ctx_rhs.strokeStyle = '#000';
				ctx_rhs.lineWidth = 0.5;
				ctx_rhs.fillRect(1.5, rhs_y_start, 4.5, Math.max(rhs_y_end - rhs_y_start, 5));
				ctx_rhs.strokeRect(1.5, rhs_y_start, 4.5, Math.max(rhs_y_end - rhs_y_start, 5));

				if (!this._is_change_in_view('lhs', lhsvp, change) &&
					!this._is_change_in_view('rhs', rhsvp, change)) {
					continue;
				}

				lhs_y_start = change['lhs-y-start'];
				lhs_y_end = change['lhs-y-end'];
				rhs_y_start = change['rhs-y-start'];
				rhs_y_end = change['rhs-y-end'];

				var radius = 3;
				// draw left box
				ctx.beginPath();
				ctx.strokeStyle = fill;
				ctx.lineWidth = (this._current_diff==i) ? 1.5 : 1;

				var rectWidth = this.draw_lhs_width;
				var rectHeight = lhs_y_end - lhs_y_start - 1;
				var rectX = this.draw_lhs_min;
				var rectY = lhs_y_start;

				// top and top top-right corner

				if (this.mode == 'TXT' || this.mode == 'JSON'){
					// draw left box
					ctx.moveTo(rectX, rectY);
					if (navigator.appName == 'Microsoft Internet Explorer') {
						// IE arcs looks awful
						ctx.lineTo(this.draw_lhs_min + this.draw_lhs_width, lhs_y_start);
						ctx.lineTo(this.draw_lhs_min + this.draw_lhs_width, lhs_y_end + 1);
						ctx.lineTo(this.draw_lhs_min, lhs_y_end + 1);
					}
					else {
						if (rectHeight <= 0) {
							ctx.lineTo(rectX + rectWidth, rectY);
						}
						else {
							ctx.arcTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + radius, radius);
							ctx.arcTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - radius, rectY + rectHeight, radius);
						}
						// bottom line
						ctx.lineTo(rectX, rectY + rectHeight);
					}
					ctx.stroke();

					rectWidth = this.draw_rhs_width;
					rectHeight = rhs_y_end - rhs_y_start - 1;
					rectX = this.draw_rhs_max;
					rectY = rhs_y_start;

					// draw right box
					ctx.moveTo(rectX, rectY);
					if (navigator.appName == 'Microsoft Internet Explorer') {
						ctx.lineTo(this.draw_rhs_max - this.draw_rhs_width, rhs_y_start);
						ctx.lineTo(this.draw_rhs_max - this.draw_rhs_width, rhs_y_end + 1);
						ctx.lineTo(this.draw_rhs_max, rhs_y_end + 1);
					}
					else {
						if (rectHeight <= 0) {
							ctx.lineTo(rectX - rectWidth, rectY);
						}
						else {
							ctx.arcTo(rectX - rectWidth, rectY, rectX - rectWidth, rectY + radius, radius);
							ctx.arcTo(rectX - rectWidth, rectY + rectHeight, rectX - radius, rectY + rectHeight, radius);
						}
						ctx.lineTo(rectX, rectY + rectHeight);
					}
					ctx.stroke();
				}
				// connect boxes
				//if (this.mode != 'TXTXML' && this.mode != 'XMLTXT' ) {
				var cx = this.draw_lhs_min + this.draw_lhs_width;
				var cy = lhs_y_start + (lhs_y_end + 1 - lhs_y_start) / 2.0;
				var dx = this.draw_rhs_max - this.draw_rhs_width;
				var dy = rhs_y_start + (rhs_y_end + 1 - rhs_y_start) / 2.0;
				ctx.moveTo(cx, cy);
				if (cy == dy) {
					ctx.lineTo(dx, dy);
				} else {
					// fancy!
					ctx.bezierCurveTo(
						cx + 12, cy - 3, // control-1 X,Y
						dx - 12, dy - 3, // control-2 X,Y
						dx, dy);
				}
				//}
				ctx.stroke();
			}

			// visible window feedback
			ctx_lhs.fillStyle = this.settings.vpcolor;
			ctx_rhs.fillStyle = this.settings.vpcolor;

			var lto = ex.clhs.height() * ex.visible_page_ratio;
			var lfrom = (ex.lhs_scroller.scrollTop() / ex.gutter_height) * ex.clhs.height();
			var rto = ex.crhs.height() * ex.visible_page_ratio;
			var rfrom = (ex.rhs_scroller.scrollTop() / ex.gutter_height) * ex.crhs.height();
			this.trace('draw', 'cls.height', ex.clhs.height());
			this.trace('draw', 'lhs_scroller.scrollTop()', ex.lhs_scroller.scrollTop());
			this.trace('draw', 'gutter_height', ex.gutter_height);
			this.trace('draw', 'visible_page_ratio', ex.visible_page_ratio);
			this.trace('draw', 'lhs from', lfrom, 'lhs to', lto);
			this.trace('draw', 'rhs from', rfrom, 'rhs to', rto);

			ctx_lhs.fillRect(1.5, lfrom, 4.5, lto);
			ctx_rhs.fillRect(1.5, rfrom, 4.5, rto);

			ex.clhs.click(function (ev) {
				var y = ev.pageY - ex.lhs_xyoffset.top - (lto / 2);
				var sto = Math.max(0, (y / mcanvas_lhs.height) * ex.lhs_scroller.get(0).scrollHeight);
				ex.lhs_scroller.scrollTop(sto);
			});
			ex.crhs.click(function (ev) {
				var y = ev.pageY - ex.rhs_xyoffset.top - (rto / 2);
				var sto = Math.max(0, (y / mcanvas_rhs.height) * ex.rhs_scroller.get(0).scrollHeight);
				ex.rhs_scroller.scrollTop(sto);
			});
		},
		trace: function(name) {
			if(this.settings._debug.indexOf(name) >= 0) {
				arguments[0] = name + ':';
				//console.log([].slice.apply(arguments));
			}
		}
	});

	jQuery.pluginMaker = function(plugin) {
		// add the plugin function as a jQuery plugin
		jQuery.fn[plugin.prototype.name] = function(options) {
			// get the arguments
			var args = jQuery.makeArray(arguments),
				after = args.slice(1);
			var rc;
			this.each(function() {
				// see if we have an instance
				var instance = jQuery.data(this, plugin.prototype.name);
				if (instance) {
					// call a method on the instance
					if (typeof options == "string") {
						rc = instance[options].apply(instance, after);
					} else if (instance.update) {
						// call update on the instance
						return instance.update.apply(instance, args);
					}
				} else {
					// create the plugin
					var _plugin = new plugin(this, options);
				}
			});
			if (rc != undefined) return rc;
		};
	};

	function showToast(message, duration = 3000) {
		const toast = document.getElementById("toast");
		toast.textContent = message;
		toast.classList.add("show");

		setTimeout(() => {
			toast.classList.remove("show");
		}, duration);
	}

// make the mergely widget
	jQuery.pluginMaker(Mgly.mergely);

})( window, document, jQuery, CodeMirror );
