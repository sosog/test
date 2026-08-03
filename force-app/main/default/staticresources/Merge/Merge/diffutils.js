/**
 * Contains definitions of some useful classes
 * Applicable to XML, TXT files
 */

/**
 *	1-param Constructor
 *	mode = {XML,TXT}
 */
var Differentiator = function(mode){
	this.mode = mode;
 	this.stack = [];
}



Differentiator.prototype.isEmpty = function(obj) {
	return this.stack.length == 0;
}

Differentiator.prototype.push = function(obj) {
	if (obj){
		var toPush = (this.mode == 'XML') ? JSON.stringify(obj) : obj;
		var val = pako.deflate(
				(this.mode == 'XML') ? JSON.stringify(obj) : obj, 
				{ to: 'string' }
  	  	);
		var len = this.stack.push(val);
	}
	return len;
}

Differentiator.prototype.pop = function() {
	if (this.stack.length == 0) return;
	var cached = this.stack.pop();
	var restored = pako.inflate(cached, { to: 'string' });
	return (this.mode == 'XML') ? JSON.parse(restored) : restored;
}




