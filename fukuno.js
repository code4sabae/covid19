/* fukuno.js CC BY @taisuke */

'use strict';

String.prototype.startsWith = function(s) {
	return this.indexOf(s) == 0;
};
String.prototype.endsWith = function(s) {
	if (s.length > this.length)
		return false;
	return this.lastIndexOf(s) == this.length - s.length;
};
/*
Array.prototype.remove = function(o) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] === o) {
			this.splice(i, 1);
			i--;
		}
	}
};
*/
var get = function(id) {
	return document.getElementById(id);
};
var create = function(tag, cls) {
	var res = document.createElement(tag);
	if (cls != null)
		res.className = cls;
	return res;
};
var clear = function(id) {
	var div = typeof id == "string" ? get(id) : id;
	while (div.hasChildNodes()) {
		div.removeChild(div.lastChild);
	}
	div.scrollTop = 0;
	div.scrollLeft = 0;
};
var removeAllChild = function(div) {
	while (div.hasChildNodes()) {
		div.removeChild(div.lastChild);
	}
};
var rnd = function(n) {
	return Math.floor(Math.random() * n);
};
var shuffle = function(array) {
	for (var i = 0; i < array.length; i++) {
		var n = rnd(array.length);
		var tmp = array[i];
		array[i] = array[n];
		array[n] = tmp;
	}
};
var addComma = function(num, beam) {
	var flg = num < 0;
	if (flg)
		num = -num;
	if (beam == null)
		beam = 0;
	if (isNaN(parseFloat(num)))
		return num;
	var f = parseFloat(num) - parseInt(num);
	var s = "" + parseInt(num);
	for (var i = 3; i < s.length; i += 4) {
		s = s.substring(0, s.length - i) + "," + s.substring(s.length - i);
	}
	if (beam > 0) {
		s += "." + fixnum(Math.floor(f * Math.pow(10, beam)), beam);
	}
	return (flg ? "-" : "") + s;
};
var removeComma = function(s, b) {
	if (s.length == 0)
		return s;
	var s2 = s.replace(/,/g, "");
	var n = parseFloat(s2);
	if (!isNaN(n))
		return n;
	return s;
};
var fixnum = function(n, m) {
	var s = '00000000000000000' + n;
	return s.substring(s.length - m);
};
var fixfloat = function(d, beam) {
	if (beam == 0)
		return Math.floor(d);
	var minus = "";
	if (d < 0) {
		d = -d;
		minus = "-";
	}
	if (beam == null)
		beam = 2;
	var k = Math.pow(10, beam);
	d *= k;
	var m = Math.floor(d % k);
	var s = Math.floor(d / k);
	return minus + s + "." + fixnum(m, beam);
};
var dec2hex = function(n, beam) {
	var hex = "";
	for (var i = 0; i < beam; i++) {
		var m = n & 0xf;
		hex = '0123456789abcdef'.charAt(m) + hex;
		n -= m;
		n >>= 4;
	}
	return hex;
};
var hex2bin = function(s) {
	var res = '';
	for (var i = 0; i < s.length; i++) {
		var n = '0123456789abcdef'.indexOf(s.charAt(i));
		if (n < 0)
			n = 0;
		for (var j = 0; j < 4; j++) {
			res += (n & (1 << (3 - j))) != 0 ? '1' : '0';
		}
	}
	return res;
};
var f2s = function(f) {
	return f.toString().match(/\n([\s\S]*)\n/)[1];
};
var createImage = function(s, cr, cg, cb) {
	if (cr == null) {
		cr = cg = cb = 0;
	}
	var w = 8;
	var r = 1;
	var wr = w * r;
	
	var bs = hex2bin(s);
	var canvas = document.createElement('canvas');
	canvas.width = wr;
	canvas.height = wr;
	var ctx = canvas.getContext('2d');
	var data = ctx.createImageData(wr, wr);
	var imgdata = data.data;
	for (var i = 0; i < w * w; i++) {
		var x = i % w;
		var y = Math.floor(i / w);
//		var b = Math.random() > .5;
		var b = bs.charAt(i) == '1';
		for (var j = 0; j < r; j++) {
			for (var k = 0; k < r; k++) {
				var idx = (x * r + j) * 4 + (y * r + k) * wr * 4;
				imgdata[idx + 0] = b ? cr : 255;
				imgdata[idx + 1] = b ? cg : 255;
				imgdata[idx + 2] = b ? cb : 255;
				imgdata[idx + 3] = b ? 255 : 0;
			}
		}
	}
	ctx.putImageData(data, 0, 0);
	return canvas.toDataURL("image/png");
};
var jsonp = function(url, callback) {
	var head = document.getElementsByTagName("head")[0];
	var script = document.createElement("script");
	if (callback) {
		if (url.indexOf("?") >= 0) {
			url += "&";
		} else {
			url += "?";
		}
		url += "callback=" + getCallbackMethod(callback);
	}
	script.setAttribute("src", url);
	script.setAttribute("type", "text/javascript");
//	script.setAttribute("id", 'jsonp');
	head.appendChild(script);
};
var getCallbackMethod = function(callback) {
	var scallback = "_cb_" + (Math.random() * 1000000 >> 0);
	window[scallback] = function(data) {
		window[scallback] = null;
		callback(data);
	};
	return scallback;
};
var getXHR = function() {
	if (window.XDomainRequest)
		return new XDomainRequest();
	if (window.XMLHttpRequest)
		return new XMLHttpRequest();
	if (window.ActiveXObject)
		return new ActiveXObject("Microsoft.XMLHTTP");
	return null;
};
var ajax = function(url, callback) {
	var data = "";
	var method = "GET";
	var async = true;
	var xhr = getXHR();
	xhr.open(method, url, async);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var xml = xhr.responseXML;
			callback(xml);
		}
	}
	xhr.setRequestHeader("If-Modified-Since", "Thu, 01 Jun 1970 00:00:00 GMT");
	xhr.send(data);
};
var xml2json = function(xml) { // attribute無視、名前重なったら配列化
	var f = function(xml) {
		var json = {};
		var text = [];
		var hasxml = false;
		var bkname = null;
		for (var i = 0; i < xml.childNodes.length; i++) {
			var node = xml.childNodes[i];
			var name = node.nodeName;
			if (name == "#text")
				text.push(node.textContent);
			else {
				hasxml = true;
				if (json[name] == null) {
					json[name] = f(node);
				} else {
					if (!(json[name] instanceof Array)) {
						json[name] = [ json[name] ];
					}
					json[name].push(f(node));
				}
			}
		}
		return hasxml ? json : text.join("");
	};
	return f(xml);
};
var debug = function(s) {
	var d = get('debug');
	if (d == null) {
		d = create('div');
		d.id = 'debug';
		document.body.appendChild(d);
	}
//	d.textContent = s;
	d.innerHTML = s;
};
var dump = function(o, name, target) { // default: div id=dump
	if (target == null) {
		debug("");
		target = get('debug');
	}
	dumpInner(o, name, 0, target);
};
var dumpInner = function(o, name, depth, target) {
	if (name == null)
		name = "";
	for (var n in o) {
		if (typeof o[n] == "object") {
			var div = create("div");
			div.style.paddingLeft = (depth * 30) + "px";
			div.textContent = n;
			target.appendChild(div);
			dumpInner(o[n], n, depth + 1, target);
		} else {
			var s = n + ": " + o[n];
	//		alert(n + " " + o[n]);
			var div = create("div");
			div.style.paddingLeft = (depth * 30) + "px";
			div.textContent = s;
			target.appendChild(div);
		}
	}
};
var dumpxml = function(xml, comp) {
	if (comp == null) {
		debug("");
		comp = get('debug');
	}
	var f = function(xml, n) {
		for (var i = 0; i < xml.childNodes.length; i++) {
			var node = xml.childNodes[i];
			var name = node.nodeName;
			var div = create("div");
			var s = [];
			s.push(name == "#text" ? node.textContent : name);
			var att = node.attributes;
			if (att != null && att.length > 0) {
				s.push(" (");
				for (var j = 0; j < att.length; j++) {
					var at = att[j];
					s.push(at.nodeName + "=" + at.childNodes[0].textContent);
					if (j < att.length - 1)
						s.push(" ");
				}
				s.push(")");
			}
			div.textContent = s.join("");
			div.style.paddingLeft = (n * 20) + "px";
			comp.appendChild(div);
			f(node, n + 1);
		}
	};
	f(xml, 0);
};
var getLanguage = function() {
	try {
		return (navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0, 2)
	} catch(e) {
	}
	return "en";
}
// color util hsb2rgb rgb2hsv
var rgb2hsv = function(rr, gg, bb) {
	var hsv = [ 0, 0, 0 ];
	var r = rr / 255;
	var g = gg /255;
	var b = bb / 255;
	var max = Math.max(r,g,b);
	var min = Math.min(r,g,b);
	if (max != 0) {
		hsv[1] = (max - min) / max;
		if (max == r)
			hsv[0] = 60 * (g - b) / (max - min);
		else if (max == g)
			hsv[0] = 60 * (b - r) / (max - min) + 120;
		else
			hsv[0] = 60 * (r - g) / (max - min) + 240;
		if (hsv[0] < 0)
			hsv[0] += 360;
	}
	hsv[2] = max;
	return hsv;
};
var hsv2rgb = function(h, s, v) {
	while (h < 0)
		h += 360;
	h %= 360;
	if (s == 0) {
		v *= 255;
		return [ v, v, v ];
	}
	var hi = h / 60 >> 0;
	var f = h / 60 - hi;
	var p = v * (1 - s);
	var q = v * (1 - f * s);
	var t = v * (1 - (1 - f) * s);
	var rgb = [ 1, 1, 1 ];
	if (hi == 0)
		rgb = [ v, t, p ];
	else if (hi == 1)
		rgb = [ q, v, p ];
	else if (hi == 2)
		rgb = [ p, v, t ];
	else if (hi == 3)
		rgb = [ p, q, v ];
	else if (hi == 4)
		rgb = [ t, p, v ];
	else if (hi == 5)
		rgb = [ v, p, q ];
	rgb[0] = rgb[0] * 255 >> 0;
	rgb[1] = rgb[1] * 255 >> 0;
	rgb[2] = rgb[2] * 255 >> 0;
	return rgb;
};
var rgb2css = function(r, g, b) {
	if (typeof r == 'object') {
		g = r[1];
		b = r[2];
		r = r[0];
	}
	return "#" + dec2hex(r, 2) + dec2hex(g, 2) + dec2hex(b, 2);
};

// ui (mouse & touch)
var setUI = function(comp) { // onuidown, onuimove, onuiup
	var istouch = 'ontouchstart' in window;
	var usecapture = false;
	if (istouch) {
		comp.addEventListener("touchstart", function(e) {
			if (this.onuidown != null)
				if (!this.onuidown(
					(e.changedTouches[0].pageX - this.offsetLeft) * this.ratio,
					(e.changedTouches[0].pageY - this.offsetTop) * this.ratio
				))
					e.preventDefault();
		}, usecapture);
		comp.addEventListener("touchmove", function(e) {
			if (this.onuimove != null)
				if (!this.onuimove(
					(e.changedTouches[0].pageX - this.offsetLeft) * this.ratio,
					(e.changedTouches[0].pageY - this.offsetTop) * this.ratio
				))
					e.preventDefault();
		}, usecapture);
		comp.addEventListener("touchend", function(e) {
			if (this.onuiup != null)
				if (!this.onuiup(
					(e.changedTouches[0].pageX - this.offsetLeft) * this.ratio,
					(e.changedTouches[0].pageY - this.offsetTop) * this.ratio
				))
					e.preventDefault();
		}, usecapture);
	}
	comp.addEventListener("mousedown", function(e) {
		if (this.onuidown != null)
			this.onuidown(e.offsetX * this.ratio, e.offsetY * this.ratio);
	}, usecapture);
	comp.addEventListener("mousemove", function(e) {
		if (this.onuimove != null)
			this.onuimove(e.offsetX * this.ratio, e.offsetY * this.ratio);
	}, usecapture);
	comp.addEventListener("mouseup", function(e) {
		if (this.onuiup != null)
			this.onuiup(e.offsetX * this.ratio, e.offsetY * this.ratio);
	}, usecapture);
};
// canvas
var getContext = function(canvas) {
	var g = canvas.getContext("2d");
	g.canvas1 = canvas;
	g.ratio = 1;
	g.init = function() {
		var ua = navigator.userAgent;
		if (ua.indexOf("iPhone") >= 0 || ua.indexOf("iPad") >= 0 || ua.indexOf("iPod") >= 0)
			this.ratio = window.devicePixelRatio;
		this.cw = this.canvas1.clientWidth * this.ratio;
		this.ch = this.canvas1.clientHeight * this.ratio;
		this.canvas1.width = this.cw;
		this.canvas1.height = this.ch;
		this.canvas1.ratio = this.ratio;
		if (this.draw != null)
			this.draw();
	};
	g.setColor = function(r, g, b, a) {
		if (a == null)
			a = 1;
		var c = "rgba(" + r + "," + g + "," + b + "," + a + ")";
		this.fillStyle = c;
		this.strokeStyle = c;
	};
	g.drawLine = function(x1, y1, x2, y2) {
		this.beginPath();
		this.moveTo(x1, y1);
		this.lineTo(x2, y2);
		this.closePath();
		this.stroke();
	};
	g.drawCircle = function(x, y, r) {
		this.beginPath();
		this.arc(x, y, r, 0, Math.PI * 2, false);
		this.closePath();
		this.stroke();
	};
	g.fillCircle = function(x, y, r) {
		this.beginPath();
		this.arc(x, y, r, 0, Math.PI * 2, false);
		this.closePath();
		this.fill();
	};
	// draw arrow
	g.drawArrow = function(x1, y1, x2, y2, arw, arh, fill) {
		var g = this;
		var dx = x2 - x1;
		var dy = y2 - y1;
		var len = Math.sqrt(dy * dy + dx * dx);
		var th = Math.atan2(dy, dx);
		var th2 = th - Math.PI / 2;
		if (len < arh * 1.5) {
			arh = len / 1.5;
			if (arh / 2 < arw)
				arw = arh / 2;
		}
		var dx1 = Math.cos(th2) * arw;
		var dy1 = Math.sin(th2) * arw;
		var dx2 = Math.cos(th) * (len - arh);
		var dy2 = Math.sin(th) * (len - arh);
		var dx3 = Math.cos(th2) * (arh - arw);
		var dy3 = Math.sin(th2) * (arh - arw);
		g.beginPath();
		g.moveTo(x1, y1);
		g.lineTo(x1 + dx1, y1 + dy1);
		g.lineTo(x1 + dx1 + dx2, y1 + dy1 + dy2);
		g.lineTo(x1 + dx1 + dx2 + dx3, y1 + dy1 + dy2 + dy3);
		g.lineTo(x2, y2);
		g.lineTo(x1 - dx1 + dx2 - dx3, y1 - dy1 + dy2 - dy3);
		g.lineTo(x1 - dx1 + dx2, y1 - dy1 + dy2);
		g.lineTo(x1 - dx1, y1 - dy1);
		g.closePath();
		if (fill)
			g.fill();
		else
			g.stroke();
	};
	g.fillArrow = function(x1, y1, x2, y2, arw, arh) {
		this.drawArrow(x1, y1, x2, y2, arw, arh, true);
	};
	return g;
};

// net util

var parseInt2 = function(n) {
	var n = parseInt(n);
	if (isNaN(n))
		return "-";
	return n;
};
var xml2json = function(url, callback) {
	var host = "fukuno.jig.jp";
//	var host = "localhost:8080";
//	var host = "sabae.club";
	var base = "https://" + host + "/proxy/ITqT5WkhCf2yn1s9?cnv=xml2json";
	var url2 = base + "&cache=no&callback=" + getCallbackMethod(callback) + "&url=" + encodeURI(url);
	jsonp(url2);
};
const decodeCSV = function(s) {
	const res = []
	let st = 0
	let line = []
	let sb = null
	if (!s.endsWith("\n"))
		s += "\n"
	const len = s.length
	for (let i = 0; i < len; i++) {
		let c = s.charAt(i)
		if (c == '\r')
			continue
		if (st == 0) {
			if (c == '\n') {
				if (line.length > 0)
					line.push("")
				res.push(line)
				line = []
			} else if (c == ',') {
				line.push("")
			} else if (c == '"') {
				sb = ""
				st = 2
			} else {
				sb = c
				st = 1
			}
		} else if (st == 1) {
			if (c == '\n') {
				line.push(sb)
				res.push(line)
				line = []
				st = 0
				sb = null
			} else if (c == ',') {
				line.push(sb)
				sb = null
				st = 0
			} else {
				sb += c
			}
		} else if (st == 2) {
			if (c == '"') {
				st = 3
			} else {
				sb += c
			}
		} else if (st == 3) {
			if (c == '"') {
				sb += c
				st = 2
			} else if (c == ',') {
				line.push(sb)
				sb = null
				st = 0
			} else if (c == '\n') {
				line.push(sb)
				res.push(line)
				line = []
				st = 0
				sb = null
			}
		}
	}
	if (sb != null)
		line.push(sb)
	if (line.length > 0)
		res.push(line)
	return res
}
const csv2json = function(csv) {
	const res = []
	const head = csv[0]
	for (let i = 1; i < csv.length; i++) {
		const d = {}
		for (let j = 0; j < head.length; j++) {
			d[head[j]] = csv[i][j]
		}
		res.push(d)
	}
	return res
}
var getJSON = function(url, callback, enc) {
	if (url.endsWith(".csv")) {
		getRawJSON(url, enc ? enc : "SJIS", function(csv) {
			callback(convertCSVtoArray(csv));
		});
	} else if (url.endsWith(".xml") || url.endsWith(".rdf")) {
		getXMLJSON(url, callback);
	} else {
		alert("not support type : " + url);
	}
};
var getXMLJSON = function(url, callback) {
//	var host = "sabae.club";
	var host = "fukuno.jig.jp";
	var cnv = "xml2json";
	var base = "https://" + host + "/proxy/ITqT5WkhCf2yn1s9?cnv=" + cnv;
	var url2 = base + "&cache=no&callback=" + getCallbackMethod(callback) + "&url=" + encodeURI(url);
	jsonp(url2);
};
var getRawJSON = function(url, srcenc, callback) {
	//var host = "sabae.club";
//	host = "localhost:8080";
	var host = "fukuno.jig.jp";
	var cache = "no";
	var base = "https://" + host + "/proxy/ITqT5WkhCf2yn1s9?";
	var url2 = base + "cnv=json&srcenc=" + srcenc + "&cache="  + cache + "&callback=" + getCallbackMethod(callback) + "&url=" + encodeURIComponent(url);
	jsonp(url2);
};
var getResizedImageURL = function(url, w, h) {
//	var host = "sabae.club";
	var host = "fukuno.jig.jp";
	var base = "https://" + host + "/proxy/ITqT5WkhCf2yn1s9?cnv=jpeg-rs-" + w + "x" + h;
	var url2 = base + "&cache=yes&url=" + encodeURI(url);
	return url2;
};

var getMapLink = function(lat, lng) {
	return "https://maps.google.com/?ll=" + lat + "," + lng;
};
var getSearchLink = function(s) {
	return "https://search.yahoo.co.jp/search?tt=c&ei=UTF-8&fr=sfp_as&aq=-1&oq=&p=" + encodeURIComponent(s) + "&meta=vc%3D";
};
var getLastDayOfMonth = function(year, month) {
	if (month == 0) {
		month = 12;
		year--;
	} else if (month == 13) {
		month = 1;
		year++;
	} else if (month == 2) {
		if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0)
			return 29;
		return 28;
	}
	return 30 + (month + Math.floor(month / 8)) % 2;
};
