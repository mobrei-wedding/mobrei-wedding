(function (f) { if (typeof exports === "object" && typeof module !== "undefined" && false) { module.exports = f() } else if (typeof define === "function" && define.amd && false) { define([], f) } else { var g; if (typeof window !== "undefined") { g = window } else if (typeof global !== "undefined") { g = global } else if (typeof self !== "undefined") { g = self } else { g = this } g.ejs = f() } })(function () { var define, module, exports; return function () { function r(e, n, t) { function o(i, f) { if (!n[i]) { if (!e[i]) { var c = "function" == typeof require && require; if (!f && c) return c(i, !0); if (u) return u(i, !0); var a = new Error("Cannot find module '" + i + "'"); throw a.code = "MODULE_NOT_FOUND", a } var p = n[i] = { exports: {} }; e[i][0].call(p.exports, function (r) { var n = e[i][1][r]; return o(n || r) }, p, p.exports, r, e, n, t) } return n[i].exports } for (var u = "function" == typeof require && require, i = 0; i < t.length; i++)o(t[i]); return o } return r }()({ 1: [function (require, module, exports) { "use strict"; var fs = require("fs"); var path = require("path"); var utils = require("./utils"); var scopeOptionWarned = false; var _VERSION_STRING = require("../package.json").version; var _DEFAULT_OPEN_DELIMITER = "<"; var _DEFAULT_CLOSE_DELIMITER = ">"; var _DEFAULT_DELIMITER = "%"; var _DEFAULT_LOCALS_NAME = "locals"; var _NAME = "ejs"; var _REGEX_STRING = "(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)"; var _OPTS_PASSABLE_WITH_DATA = ["delimiter", "scope", "context", "debug", "compileDebug", "client", "_with", "rmWhitespace", "strict", "filename", "async"]; var _OPTS_PASSABLE_WITH_DATA_EXPRESS = _OPTS_PASSABLE_WITH_DATA.concat("cache"); var _BOM = /^\uFEFF/; exports.cache = utils.cache; exports.fileLoader = fs.readFileSync; exports.localsName = _DEFAULT_LOCALS_NAME; exports.promiseImpl = new Function("return this;")().Promise; exports.resolveInclude = function (name, filename, isDir) { var dirname = path.dirname; var extname = path.extname; var resolve = path.resolve; var includePath = resolve(isDir ? filename : dirname(filename), name); var ext = extname(name); if (!ext) { includePath += ".ejs" } return includePath }; function resolvePaths(name, paths) { var filePath; if (paths.some(function (v) { filePath = exports.resolveInclude(name, v, true); return fs.existsSync(filePath) })) { return filePath } } function getIncludePath(path, options) { var includePath; var filePath; var views = options.views; var match = /^[A-Za-z]+:\\|^\//.exec(path); if (match && match.length) { path = path.replace(/^\/*/, ""); if (Array.isArray(options.root)) { includePath = resolvePaths(path, options.root) } else { includePath = exports.resolveInclude(path, options.root || "/", true) } } else { if (options.filename) { filePath = exports.resolveInclude(path, options.filename); if (fs.existsSync(filePath)) { includePath = filePath } } if (!includePath && Array.isArray(views)) { includePath = resolvePaths(path, views) } if (!includePath && typeof options.includer !== "function") { throw new Error('Could not find the include file "' + options.escapeFunction(path) + '"') } } return includePath } function handleCache(options, template) { var func; var filename = options.filename; var hasTemplate = arguments.length > 1; if (options.cache) { if (!filename) { throw new Error("cache option requires a filename") } func = exports.cache.get(filename); if (func) { return func } if (!hasTemplate) { template = fileLoader(filename).toString().replace(_BOM, "") } } else if (!hasTemplate) { if (!filename) { throw new Error("Internal EJS error: no file name or template " + "provided") } template = fileLoader(filename).toString().replace(_BOM, "") } func = exports.compile(template, options); if (options.cache) { exports.cache.set(filename, func) } return func } function tryHandleCache(options, data, cb) { var result; if (!cb) { if (typeof exports.promiseImpl == "function") { return new exports.promiseImpl(function (resolve, reject) { try { result = handleCache(options)(data); resolve(result) } catch (err) { reject(err) } }) } else { throw new Error("Please provide a callback function") } } else { try { result = handleCache(options)(data) } catch (err) { return cb(err) } cb(null, result) } } function fileLoader(filePath) { return exports.fileLoader(filePath) } function includeFile(path, options) { var opts = utils.shallowCopy({}, options); opts.filename = getIncludePath(path, opts); if (typeof options.includer === "function") { var includerResult = options.includer(path, opts.filename); if (includerResult) { if (includerResult.filename) { opts.filename = includerResult.filename } if (includerResult.template) { return handleCache(opts, includerResult.template) } } } return handleCache(opts) } function rethrow(err, str, flnm, lineno, esc) { var lines = str.split("\n"); var start = Math.max(lineno - 3, 0); var end = Math.min(lines.length, lineno + 3); var filename = esc(flnm); var context = lines.slice(start, end).map(function (line, i) { var curr = i + start + 1; return (curr == lineno ? " >> " : "    ") + curr + "| " + line }).join("\n"); err.path = filename; err.message = (filename || "ejs") + ":" + lineno + "\n" + context + "\n\n" + err.message; throw err } function stripSemi(str) { return str.replace(/;(\s*$)/, "$1") } exports.compile = function compile(template, opts) { var templ; if (opts && opts.scope) { if (!scopeOptionWarned) { console.warn("`scope` option is deprecated and will be removed in EJS 3"); scopeOptionWarned = true } if (!opts.context) { opts.context = opts.scope } delete opts.scope } templ = new Template(template, opts); return templ.compile() }; exports.render = function (template, d, o) { var data = d || {}; var opts = o || {}; if (arguments.length == 2) { utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA) } return handleCache(opts, template)(data) }; exports.renderFile = function () { var args = Array.prototype.slice.call(arguments); var filename = args.shift(); var cb; var opts = { filename: filename }; var data; var viewOpts; if (typeof arguments[arguments.length - 1] == "function") { cb = args.pop() } if (args.length) { data = args.shift(); if (args.length) { utils.shallowCopy(opts, args.pop()) } else { if (data.settings) { if (data.settings.views) { opts.views = data.settings.views } if (data.settings["view cache"]) { opts.cache = true } viewOpts = data.settings["view options"]; if (viewOpts) { utils.shallowCopy(opts, viewOpts) } } utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA_EXPRESS) } opts.filename = filename } else { data = {} } return tryHandleCache(opts, data, cb) }; exports.Template = Template; exports.clearCache = function () { exports.cache.reset() }; function Template(text, opts) { opts = opts || {}; var options = {}; this.templateText = text; this.mode = null; this.truncate = false; this.currentLine = 1; this.source = ""; options.client = opts.client || false; options.escapeFunction = opts.escape || opts.escapeFunction || utils.escapeXML; options.compileDebug = opts.compileDebug !== false; options.debug = !!opts.debug; options.filename = opts.filename; options.openDelimiter = opts.openDelimiter || exports.openDelimiter || _DEFAULT_OPEN_DELIMITER; options.closeDelimiter = opts.closeDelimiter || exports.closeDelimiter || _DEFAULT_CLOSE_DELIMITER; options.delimiter = opts.delimiter || exports.delimiter || _DEFAULT_DELIMITER; options.strict = opts.strict || false; options.context = opts.context; options.cache = opts.cache || false; options.rmWhitespace = opts.rmWhitespace; options.root = opts.root; options.includer = opts.includer; options.outputFunctionName = opts.outputFunctionName; options.localsName = opts.localsName || exports.localsName || _DEFAULT_LOCALS_NAME; options.views = opts.views; options.async = opts.async; options.destructuredLocals = opts.destructuredLocals; options.legacyInclude = typeof opts.legacyInclude != "undefined" ? !!opts.legacyInclude : true; if (options.strict) { options._with = false } else { options._with = typeof opts._with != "undefined" ? opts._with : true } this.opts = options; this.regex = this.createRegex() } Template.modes = { EVAL: "eval", ESCAPED: "escaped", RAW: "raw", COMMENT: "comment", LITERAL: "literal" }; Template.prototype = { createRegex: function () { var str = _REGEX_STRING; var delim = utils.escapeRegExpChars(this.opts.delimiter); var open = utils.escapeRegExpChars(this.opts.openDelimiter); var close = utils.escapeRegExpChars(this.opts.closeDelimiter); str = str.replace(/%/g, delim).replace(/</g, open).replace(/>/g, close); return new RegExp(str) }, compile: function () { var src; var fn; var opts = this.opts; var prepended = ""; var appended = ""; var escapeFn = opts.escapeFunction; var ctor; var sanitizedFilename = opts.filename ? JSON.stringify(opts.filename) : "undefined"; if (!this.source) { this.generateSource(); prepended += '  var __output = "";\n' + "  function __append(s) { if (s !== undefined && s !== null) __output += s }\n"; if (opts.outputFunctionName) { prepended += "  var " + opts.outputFunctionName + " = __append;" + "\n" } if (opts.destructuredLocals && opts.destructuredLocals.length) { var destructuring = "  var __locals = (" + opts.localsName + " || {}),\n"; for (var i = 0; i < opts.destructuredLocals.length; i++) { var name = opts.destructuredLocals[i]; if (i > 0) { destructuring += ",\n  " } destructuring += name + " = __locals." + name } prepended += destructuring + ";\n" } if (opts._with !== false) { prepended += "  with (" + opts.localsName + " || {}) {" + "\n"; appended += "  }" + "\n" } appended += "  return __output;" + "\n"; this.source = prepended + this.source + appended } if (opts.compileDebug) { src = "var __line = 1" + "\n" + "  , __lines = " + JSON.stringify(this.templateText) + "\n" + "  , __filename = " + sanitizedFilename + ";" + "\n" + "try {" + "\n" + this.source + "} catch (e) {" + "\n" + "  rethrow(e, __lines, __filename, __line, escapeFn);" + "\n" + "}" + "\n" } else { src = this.source } if (opts.client) { src = "escapeFn = escapeFn || " + escapeFn.toString() + ";" + "\n" + src; if (opts.compileDebug) { src = "rethrow = rethrow || " + rethrow.toString() + ";" + "\n" + src } } if (opts.strict) { src = '"use strict";\n' + src } if (opts.debug) { console.log(src) } if (opts.compileDebug && opts.filename) { src = src + "\n" + "//# sourceURL=" + sanitizedFilename + "\n" } try { if (opts.async) { try { ctor = new Function("return (async function(){}).constructor;")() } catch (e) { if (e instanceof SyntaxError) { throw new Error("This environment does not support async/await") } else { throw e } } } else { ctor = Function } fn = new ctor(opts.localsName + ", escapeFn, include, rethrow", src) } catch (e) { if (e instanceof SyntaxError) { if (opts.filename) { e.message += " in " + opts.filename } e.message += " while compiling ejs\n\n"; e.message += "If the above error is not helpful, you may want to try EJS-Lint:\n"; e.message += "https://github.com/RyanZim/EJS-Lint"; if (!opts.async) { e.message += "\n"; e.message += "Or, if you meant to create an async function, pass `async: true` as an option." } } throw e } var returnedFn = opts.client ? fn : function anonymous(data) { var include = function (path, includeData) { var d = utils.shallowCopy({}, data); if (includeData) { d = utils.shallowCopy(d, includeData) } return includeFile(path, opts)(d) }; return fn.apply(opts.context, [data || {}, escapeFn, include, rethrow]) }; if (opts.filename && typeof Object.defineProperty === "function") { var filename = opts.filename; var basename = path.basename(filename, path.extname(filename)); try { Object.defineProperty(returnedFn, "name", { value: basename, writable: false, enumerable: false, configurable: true }) } catch (e) { } } return returnedFn }, generateSource: function () { var opts = this.opts; if (opts.rmWhitespace) { this.templateText = this.templateText.replace(/[\r\n]+/g, "\n").replace(/^\s+|\s+$/gm, "") } this.templateText = this.templateText.replace(/[ \t]*<%_/gm, "<%_").replace(/_%>[ \t]*/gm, "_%>"); var self = this; var matches = this.parseTemplateText(); var d = this.opts.delimiter; var o = this.opts.openDelimiter; var c = this.opts.closeDelimiter; if (matches && matches.length) { matches.forEach(function (line, index) { var closing; if (line.indexOf(o + d) === 0 && line.indexOf(o + d + d) !== 0) { closing = matches[index + 2]; if (!(closing == d + c || closing == "-" + d + c || closing == "_" + d + c)) { throw new Error('Could not find matching close tag for "' + line + '".') } } self.scanLine(line) }) } }, parseTemplateText: function () { var str = this.templateText; var pat = this.regex; var result = pat.exec(str); var arr = []; var firstPos; while (result) { firstPos = result.index; if (firstPos !== 0) { arr.push(str.substring(0, firstPos)); str = str.slice(firstPos) } arr.push(result[0]); str = str.slice(result[0].length); result = pat.exec(str) } if (str) { arr.push(str) } return arr }, _addOutput: function (line) { if (this.truncate) { line = line.replace(/^(?:\r\n|\r|\n)/, ""); this.truncate = false } if (!line) { return line } line = line.replace(/\\/g, "\\\\"); line = line.replace(/\n/g, "\\n"); line = line.replace(/\r/g, "\\r"); line = line.replace(/"/g, '\\"'); this.source += '    ; __append("' + line + '")' + "\n" }, scanLine: function (line) { var self = this; var d = this.opts.delimiter; var o = this.opts.openDelimiter; var c = this.opts.closeDelimiter; var newLineCount = 0; newLineCount = line.split("\n").length - 1; switch (line) { case o + d: case o + d + "_": this.mode = Template.modes.EVAL; break; case o + d + "=": this.mode = Template.modes.ESCAPED; break; case o + d + "-": this.mode = Template.modes.RAW; break; case o + d + "#": this.mode = Template.modes.COMMENT; break; case o + d + d: this.mode = Template.modes.LITERAL; this.source += '    ; __append("' + line.replace(o + d + d, o + d) + '")' + "\n"; break; case d + d + c: this.mode = Template.modes.LITERAL; this.source += '    ; __append("' + line.replace(d + d + c, d + c) + '")' + "\n"; break; case d + c: case "-" + d + c: case "_" + d + c: if (this.mode == Template.modes.LITERAL) { this._addOutput(line) } this.mode = null; this.truncate = line.indexOf("-") === 0 || line.indexOf("_") === 0; break; default: if (this.mode) { switch (this.mode) { case Template.modes.EVAL: case Template.modes.ESCAPED: case Template.modes.RAW: if (line.lastIndexOf("//") > line.lastIndexOf("\n")) { line += "\n" } }switch (this.mode) { case Template.modes.EVAL: this.source += "    ; " + line + "\n"; break; case Template.modes.ESCAPED: this.source += "    ; __append(escapeFn(" + stripSemi(line) + "))" + "\n"; break; case Template.modes.RAW: this.source += "    ; __append(" + stripSemi(line) + ")" + "\n"; break; case Template.modes.COMMENT: break; case Template.modes.LITERAL: this._addOutput(line); break } } else { this._addOutput(line) } }if (self.opts.compileDebug && newLineCount) { this.currentLine += newLineCount; this.source += "    ; __line = " + this.currentLine + "\n" } } }; exports.escapeXML = utils.escapeXML; exports.__express = exports.renderFile; exports.VERSION = _VERSION_STRING; exports.name = _NAME; if (typeof window != "undefined") { window.ejs = exports } }, { "../package.json": 6, "./utils": 2, fs: 3, path: 4 }], 2: [function (require, module, exports) { "use strict"; var regExpChars = /[|\\{}()[\]^$+*?.]/g; exports.escapeRegExpChars = function (string) { if (!string) { return "" } return String(string).replace(regExpChars, "\\$&") }; var _ENCODE_HTML_RULES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&#34;", "'": "&#39;" }; var _MATCH_HTML = /[&<>'"]/g; function encode_char(c) { return _ENCODE_HTML_RULES[c] || c } var escapeFuncStr = "var _ENCODE_HTML_RULES = {\n" + '      "&": "&amp;"\n' + '    , "<": "&lt;"\n' + '    , ">": "&gt;"\n' + '    , \'"\': "&#34;"\n' + '    , "\'": "&#39;"\n' + "    }\n" + "  , _MATCH_HTML = /[&<>'\"]/g;\n" + "function encode_char(c) {\n" + "  return _ENCODE_HTML_RULES[c] || c;\n" + "};\n"; exports.escapeXML = function (markup) { return markup == undefined ? "" : String(markup).replace(_MATCH_HTML, encode_char) }; exports.escapeXML.toString = function () { return Function.prototype.toString.call(this) + ";\n" + escapeFuncStr }; exports.shallowCopy = function (to, from) { from = from || {}; for (var p in from) { to[p] = from[p] } return to }; exports.shallowCopyFromList = function (to, from, list) { for (var i = 0; i < list.length; i++) { var p = list[i]; if (typeof from[p] != "undefined") { to[p] = from[p] } } return to }; exports.cache = { _data: {}, set: function (key, val) { this._data[key] = val }, get: function (key) { return this._data[key] }, remove: function (key) { delete this._data[key] }, reset: function () { this._data = {} } }; exports.hyphenToCamel = function (str) { return str.replace(/-[a-z]/g, function (match) { return match[1].toUpperCase() }) } }, {}], 3: [function (require, module, exports) { }, {}], 4: [function (require, module, exports) { (function (process) { function normalizeArray(parts, allowAboveRoot) { var up = 0; for (var i = parts.length - 1; i >= 0; i--) { var last = parts[i]; if (last === ".") { parts.splice(i, 1) } else if (last === "..") { parts.splice(i, 1); up++ } else if (up) { parts.splice(i, 1); up-- } } if (allowAboveRoot) { for (; up--; up) { parts.unshift("..") } } return parts } exports.resolve = function () { var resolvedPath = "", resolvedAbsolute = false; for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) { var path = i >= 0 ? arguments[i] : process.cwd(); if (typeof path !== "string") { throw new TypeError("Arguments to path.resolve must be strings") } else if (!path) { continue } resolvedPath = path + "/" + resolvedPath; resolvedAbsolute = path.charAt(0) === "/" } resolvedPath = normalizeArray(filter(resolvedPath.split("/"), function (p) { return !!p }), !resolvedAbsolute).join("/"); return (resolvedAbsolute ? "/" : "") + resolvedPath || "." }; exports.normalize = function (path) { var isAbsolute = exports.isAbsolute(path), trailingSlash = substr(path, -1) === "/"; path = normalizeArray(filter(path.split("/"), function (p) { return !!p }), !isAbsolute).join("/"); if (!path && !isAbsolute) { path = "." } if (path && trailingSlash) { path += "/" } return (isAbsolute ? "/" : "") + path }; exports.isAbsolute = function (path) { return path.charAt(0) === "/" }; exports.join = function () { var paths = Array.prototype.slice.call(arguments, 0); return exports.normalize(filter(paths, function (p, index) { if (typeof p !== "string") { throw new TypeError("Arguments to path.join must be strings") } return p }).join("/")) }; exports.relative = function (from, to) { from = exports.resolve(from).substr(1); to = exports.resolve(to).substr(1); function trim(arr) { var start = 0; for (; start < arr.length; start++) { if (arr[start] !== "") break } var end = arr.length - 1; for (; end >= 0; end--) { if (arr[end] !== "") break } if (start > end) return []; return arr.slice(start, end - start + 1) } var fromParts = trim(from.split("/")); var toParts = trim(to.split("/")); var length = Math.min(fromParts.length, toParts.length); var samePartsLength = length; for (var i = 0; i < length; i++) { if (fromParts[i] !== toParts[i]) { samePartsLength = i; break } } var outputParts = []; for (var i = samePartsLength; i < fromParts.length; i++) { outputParts.push("..") } outputParts = outputParts.concat(toParts.slice(samePartsLength)); return outputParts.join("/") }; exports.sep = "/"; exports.delimiter = ":"; exports.dirname = function (path) { if (typeof path !== "string") path = path + ""; if (path.length === 0) return "."; var code = path.charCodeAt(0); var hasRoot = code === 47; var end = -1; var matchedSlash = true; for (var i = path.length - 1; i >= 1; --i) { code = path.charCodeAt(i); if (code === 47) { if (!matchedSlash) { end = i; break } } else { matchedSlash = false } } if (end === -1) return hasRoot ? "/" : "."; if (hasRoot && end === 1) { return "/" } return path.slice(0, end) }; function basename(path) { if (typeof path !== "string") path = path + ""; var start = 0; var end = -1; var matchedSlash = true; var i; for (i = path.length - 1; i >= 0; --i) { if (path.charCodeAt(i) === 47) { if (!matchedSlash) { start = i + 1; break } } else if (end === -1) { matchedSlash = false; end = i + 1 } } if (end === -1) return ""; return path.slice(start, end) } exports.basename = function (path, ext) { var f = basename(path); if (ext && f.substr(-1 * ext.length) === ext) { f = f.substr(0, f.length - ext.length) } return f }; exports.extname = function (path) { if (typeof path !== "string") path = path + ""; var startDot = -1; var startPart = 0; var end = -1; var matchedSlash = true; var preDotState = 0; for (var i = path.length - 1; i >= 0; --i) { var code = path.charCodeAt(i); if (code === 47) { if (!matchedSlash) { startPart = i + 1; break } continue } if (end === -1) { matchedSlash = false; end = i + 1 } if (code === 46) { if (startDot === -1) startDot = i; else if (preDotState !== 1) preDotState = 1 } else if (startDot !== -1) { preDotState = -1 } } if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) { return "" } return path.slice(startDot, end) }; function filter(xs, f) { if (xs.filter) return xs.filter(f); var res = []; for (var i = 0; i < xs.length; i++) { if (f(xs[i], i, xs)) res.push(xs[i]) } return res } var substr = "ab".substr(-1) === "b" ? function (str, start, len) { return str.substr(start, len) } : function (str, start, len) { if (start < 0) start = str.length + start; return str.substr(start, len) } }).call(this, require("_process")) }, { _process: 5 }], 5: [function (require, module, exports) { var process = module.exports = {}; var cachedSetTimeout; var cachedClearTimeout; function defaultSetTimout() { throw new Error("setTimeout has not been defined") } function defaultClearTimeout() { throw new Error("clearTimeout has not been defined") } (function () { try { if (typeof setTimeout === "function") { cachedSetTimeout = setTimeout } else { cachedSetTimeout = defaultSetTimout } } catch (e) { cachedSetTimeout = defaultSetTimout } try { if (typeof clearTimeout === "function") { cachedClearTimeout = clearTimeout } else { cachedClearTimeout = defaultClearTimeout } } catch (e) { cachedClearTimeout = defaultClearTimeout } })(); function runTimeout(fun) { if (cachedSetTimeout === setTimeout) { return setTimeout(fun, 0) } if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) { cachedSetTimeout = setTimeout; return setTimeout(fun, 0) } try { return cachedSetTimeout(fun, 0) } catch (e) { try { return cachedSetTimeout.call(null, fun, 0) } catch (e) { return cachedSetTimeout.call(this, fun, 0) } } } function runClearTimeout(marker) { if (cachedClearTimeout === clearTimeout) { return clearTimeout(marker) } if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) { cachedClearTimeout = clearTimeout; return clearTimeout(marker) } try { return cachedClearTimeout(marker) } catch (e) { try { return cachedClearTimeout.call(null, marker) } catch (e) { return cachedClearTimeout.call(this, marker) } } } var queue = []; var draining = false; var currentQueue; var queueIndex = -1; function cleanUpNextTick() { if (!draining || !currentQueue) { return } draining = false; if (currentQueue.length) { queue = currentQueue.concat(queue) } else { queueIndex = -1 } if (queue.length) { drainQueue() } } function drainQueue() { if (draining) { return } var timeout = runTimeout(cleanUpNextTick); draining = true; var len = queue.length; while (len) { currentQueue = queue; queue = []; while (++queueIndex < len) { if (currentQueue) { currentQueue[queueIndex].run() } } queueIndex = -1; len = queue.length } currentQueue = null; draining = false; runClearTimeout(timeout) } process.nextTick = function (fun) { var args = new Array(arguments.length - 1); if (arguments.length > 1) { for (var i = 1; i < arguments.length; i++) { args[i - 1] = arguments[i] } } queue.push(new Item(fun, args)); if (queue.length === 1 && !draining) { runTimeout(drainQueue) } }; function Item(fun, array) { this.fun = fun; this.array = array } Item.prototype.run = function () { this.fun.apply(null, this.array) }; process.title = "browser"; process.browser = true; process.env = {}; process.argv = []; process.version = ""; process.versions = {}; function noop() { } process.on = noop; process.addListener = noop; process.once = noop; process.off = noop; process.removeListener = noop; process.removeAllListeners = noop; process.emit = noop; process.prependListener = noop; process.prependOnceListener = noop; process.listeners = function (name) { return [] }; process.binding = function (name) { throw new Error("process.binding is not supported") }; process.cwd = function () { return "/" }; process.chdir = function (dir) { throw new Error("process.chdir is not supported") }; process.umask = function () { return 0 } }, {}], 6: [function (require, module, exports) { module.exports = { name: "ejs", description: "Embedded JavaScript templates", keywords: ["template", "engine", "ejs"], version: "3.1.6", author: "Matthew Eernisse <mde@fleegix.org> (http://fleegix.org)", license: "Apache-2.0", bin: { ejs: "./bin/cli.js" }, main: "./lib/ejs.js", jsdelivr: "ejs.min.js", unpkg: "ejs.min.js", repository: { type: "git", url: "git://github.com/mde/ejs.git" }, bugs: "https://github.com/mde/ejs/issues", homepage: "https://github.com/mde/ejs", dependencies: { jake: "^10.6.1" }, devDependencies: { browserify: "^16.5.1", eslint: "^6.8.0", "git-directory-deploy": "^1.5.1", jsdoc: "^3.6.4", "lru-cache": "^4.0.1", mocha: "^7.1.1", "uglify-js": "^3.3.16" }, engines: { node: ">=0.10.0" }, scripts: { test: "mocha" } } }, {}] }, {}, [1])(1) });

$(document).ready(function() { 
    renderBill();
 });

$('#download-report').click(function () {
    downloadPdf(pdfDocument);
});

$('#test-report').click(function () {
    var pdfContext = generatePdfContext();
    pdfDocument = buildPdf(pdfContext);
    // openPdf(pdfDocument);
    uploadFile(pdfDocument);
});
async function uploadFile(pdfDoc) {
	// var fileContent = 'Hello World'; // As a sample, upload a text file.
    var fileContent = pdfMake.createPdf(pdfDoc);
	// var file = new Blob([fileContent], { type: 'text/plain' });
    var file = new Blob([fileContent], { type: 'application/octetstream' });
    
	var metadata = {
		'name': 'sample-file-via-js', // Filename at Google Drive
		'mimeType': 'application/octetstream', // mimeType at Google Drive
		// TODO [Optional]: Set the below credentials
		// Note: remove this parameter, if no target is needed
		'parents': ['1Av9rul-em5omaFixJM-LDOgOjVF7PLra'], // Folder ID at Google Drive which is optional
	};

	var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
	var form = new FormData();
	form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
	form.append('file', file);

	var xhr = new XMLHttpRequest();
	xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
	xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
	xhr.responseType = 'json';
	xhr.onload = () => {
		document.getElementById('content').innerHTML = "File uploaded successfully. The Google Drive file id is <b>" + xhr.response.id + "</b>";
		document.getElementById('content').style.display = 'block';
	};
	xhr.send(form);
}

function start() {
    const CLIENT_ID = '955584819573-me0ppca4jmu52vmoaso9cqffaeea9rvf.apps.googleusercontent.com';
    const API_KEY = 'AIzaSyAuJXrDFNMqlbBM8LVefMDsdf2Qd2jnppc';
    // Discovery doc URL for APIs used by the quickstart
    const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
    // 2. Initialize the JavaScript client library.
    gapi.client.init({
      'apiKey': API_KEY,
      // Your API key will be automatically added to the Discovery Document URLs.
      'discoveryDocs': [
        'https://people.googleapis.com/$discovery/rest',
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      // clientId and scope are optional if auth is not required.
      'clientId': CLIENT_ID,
      //https://www.googleapis.com/auth/drive.file
      'scope': 'https://www.googleapis.com/auth/drive',
    }).then(function() {
      // 3. Initialize and make the API request.
    //   return gapi.client.people.people.get({
    //     'resourceName': 'people/me',
    //     'requestMask.includeField': 'person.names'
    //   });

    //   gapi.client.request({path:'/upload/drive/v3/files', method: 'POST', params: {uploadType: 'media'}, body: "hey"})

    }).then(function(response) {
      console.log(response.result);
    }, function(reason) {
      console.log('Error: ' + reason.result.error.message);
    });
  };
  // 1. Load the JavaScript client library.
  gapi.load('client', start);


function calculateProduct(){
    // 周邊總價
    var sum = 0;
    var quantity = 0;
    var sumEle = document.getElementById("ff-id-2046362136");
    var displayProductSum = document.getElementById("Display2046362136");
    var displayQuantity = document.getElementById("Display2139224654");
    var displayTotal = document.getElementById("Display1588677463");
    // list
    var listEle = document.getElementById("ff-id-1959728480");
    for (var property in product_data){
        var obj = product_data[property];
        if(obj.quantity){
            sum += obj.quantity * obj.price;
            quantity += obj.quantity;
        }
    }
    displayProductSum.value = sum;
    displayTotal.value = sum+1125;
    sumEle.value = sum;
    displayQuantity.value = quantity;

}

function getDocument() {
    return document;
}

function renderBill(){
    var table = document.getElementById('bill-table-1959728480');
    table.body = null;
    header = ` <colgroup>
                <col>
                <col>
                <col>
                <col>
            </colgroup>
            <thead>
                <tr>
                <td>項目</td>
                <td>單價</td>
                <td>數量</td>
                <td>總價</td>
                </tr>
            </thead><tbody>`;
        
    var allRows = [];
    for (var property in product_data){
        var obj = product_data[property];
        if(obj.quantity){
            var amount = obj.quantity * obj.price;
            var row = '<tr>'+
            '<td>'+obj.title+'</td>'+
            '<td>'+obj.price+'</td>'+
            '<td>'+obj.quantity+'</td>'+
            '<td>'+amount+'</td>'+
            '</tr>';
            allRows.push(row);
        }
    }
    
    var productPrice = document.getElementById("ff-id-2046362136").value;
    var registerFee = 1125;
    var finalPrice = (productPrice ? productPrice : 0) + registerFee;
    
    // var footer = document.getElementById('table-footer');
    var footer = `<tfoot>
        <tr>
            <td colspan="3">周邊總價</td>
            <td>NT$${productPrice ? productPrice: 0}</td>
        </tr>
        <tr>
            <td colspan="3">茶會報名費</td>
            <td>NT$${registerFee}</td>
        </tr>
        <tr>
            <td colspan="3">最終價錢</td>
            <td>NT$${finalPrice}</td>
        </tr> </tfoot>`;
    table.innerHTML = header + allRows.join(' ') + "</tbody>"+footer;


}

function getNextSectionId(secid) {
    var sections = getSectionsItems();
    var idx = sections.findIndex(sec => sec.id == secid);
    var nxt = sections[idx + 1];
    if (nxt) return nxt.id;
    return secid;
}

function getPreviousSectionId(secid) {
    var sections = getSectionsItems();
    var idx = sections.findIndex(sec => sec.id == secid);
    var prev = sections[idx - 1];
    if (prev) return prev.id;
    return secid;
}

function jumptoSection(frm, secid, deftrg, trg, wid) {
    //just for testing
    getData();

    var sections = getSectionsItems();
    sections.forEach(section=>{
        var id = 'ff-sec-'+section.id;
        var sectionDiv = document.getElementById(id);
        if(section.id===trg){
            sectionDiv.style.display = "block";
        }else{
            sectionDiv.style.display = "none";
        }
    })
}

function endSection() {
    var sections = getSectionsItems();
    sections.forEach(section=>{
        var id = 'ff-sec-'+section.id;
        var sectionDiv = document.getElementById(id);
        if(section.id==="ending"){
            sectionDiv.style.display = "block";
        }else{
            sectionDiv.remove();
        }
    })
}

function pdfHeader(title){
    return  { 
        alignment: 'center',
        text: `Report #${title}`,
        style: 'header',
        fontSize: 23,
        bold: true,
        margin: [0, 10],
    }
}

function generatePdfSentence(title, content){
    return {
		italics: false,
		text: [
			{text: " - " + title + "：\n", style: 'itemTitle', bold: true},
			{text: "   " + content+ "\n", style: 'itemContext', bold: false},
			'\n'
		]
	}

}

function generateUlItem(key, value){
    return {
		italics: false,
		ul: [
            {text: key+ "\n"},
            [
                {
                    text:  value+ "\n"
                },
            ]
        ],
        text:  [{text: value+ "\n"}],
	}

}

function generateSection(title, content){
    return {
		italics: false,
		text: [
			{text: title + "\n", style: 'h4', bold: true},
			{text: content+ "\n", style: 'p'},
			'\n'
		]
	}
}
function getBillData(){
    var refreshTable = [];
    var productPrice = 0;
    for (var property in product_data){
        var obj = product_data[property];
        if(obj.quantity){
            var amount = obj.quantity * obj.price;
            productPrice += amount;
            refreshTable.push({'項目': obj.title, '單價':obj.price, '數量':obj.quantity, '總價': amount })
        }
    }
    return {
        billData: refreshTable,
        total: productPrice,
    };
}

function buildPdf(context) {
    pdfMake.fonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-Italic.ttf'
        },
        AaGuDianKeBenSong: {
          normal: 'AaGuDianKeBenSong.ttf',
          bold: 'AaGuDianKeBenSong.ttf',
          italics: 'AaGuDianKeBenSong.ttf',
          bolditalics: 'AaGuDianKeBenSong.ttf'
        },
        FangZhengShuSongFanTi: {
            normal: 'FangZhengShuSongFanTi.ttf',
            bold: 'FangZhengShuSongFanTi.ttf',
            italics: 'FangZhengShuSongFanTi.ttf',
            bolditalics: 'FangZhengShuSongFanTi.ttf'
         },
         characters: {
            normal: 'characters.ttf',
            bold: 'characters.ttf',
            italics: 'characters.ttf',
            bolditalics: 'characters.ttf'
         },
          
      };
    var docDefinition = {
      content: context,
      defaultStyle: {
        font: 'AaGuDianKeBenSong',
        fontSize: 11,
        color: '#595553',
        lineHeight: 1.2,
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        itemTitle: {
          fontSize: 12,
        },
        itemContext:{
          color: '#595553'
        },
        "p": {
          "marginTop": 11
        },
        "ul": {
          "marginTop": 11
        },
        "ol": {
          "marginTop": 11
        },
        "h1": {
          "marginTop": 36,
          "fontSize": 36
        },
        "h2": {
          "fontSize": 24,
          "marginTop": 10
        },
        "h3": {
          "fontSize": 20,
          "bold": true,
          "italics": true,
          "marginTop": 10
        },
        "h4": {
            "fontSize": 15,
            "bold": true,
            "marginTop": 10
          }
      }
      
      
  };
  return docDefinition;

    // pdfMake.createPdf(docDefinition).open();
}

function openPdf(pdfDoc){
    pdfMake.createPdf(pdfDoc).open();
}

function downloadPdf(pdfDoc){
    pdfMake.createPdf(pdfDoc).download();
}
function generatePdfContext(){
    var emailEntry = document.getElementById('Widget658159440').value;
    var nameEntry = document.getElementById('Widget1439048663').value;
    var digit3Entry = document.getElementById('Widget981692748').value;
    var allergyEntry = document.getElementById('Widget1043102370').value;
    var emergencyEntry = document.getElementById('Widget1827994924').value;
    
    var preference = function() {
        var v;
        $('[name="entry.18356239"]').each(function() {
            if($(this).prop('checked') === true) v = $(this).val();
        });
        return v;
    };
    var preferenceEntry = preference();

    var withFriendsEntry = document.getElementById('Widget1226046570').value;
    var questionOrThoughts = document.getElementById('Widget1388002876').value;
    var toTheTeam = document.getElementById('Widget1496947901').value;

    // get bill data
    var orderData = getBillData()
    var billTable = buildPdfTable(orderData, bill_col_data);
    var context = [
        pdfHeader(emailEntry), 
        generatePdfSentence('名字', nameEntry), 
        generatePdfSentence('信箱', emailEntry), 
        generatePdfSentence('手機末三碼', digit3Entry), 
        generatePdfSentence('有無對食物過敏', allergyEntry), 
        generatePdfSentence('緊急聯絡人', emergencyEntry), 
        generatePdfSentence('希望多與摳色互動嗎？', preferenceEntry), 
        generatePdfSentence('有希望被分配在同桌的親友嗎？', withFriendsEntry), 
        generatePdfSentence('對婚禮的期待或者想提的問題？', questionOrThoughts), 
        generatePdfSentence('給籌備組的話', toTheTeam), 
        generateSection('您的購買明細如下：', ''), 
        billTable];
    return context;
}

function buildPdfTableBody(data, columns) {
    var body = [];
    var styledColumns = columns.map(column=>{
        return {
            borderColor: ['#ffffff', '#ffffff', '#ffffff', '#b0aeae'],
            text: column,
        }
    })

    body.push(styledColumns);
    // columns.push(...data);
    var details = data.billData;
    var productPrice = data.total;
    details.forEach(function(row) {
        var dataRow = [];

        columns.forEach(function(column) {
            var cell = {
                borderColor: ['#ffffff', '#ffffff', '#ffffff', '#b0aeae'],
                fontSize: 9,
                text: row[column],
            }

            dataRow.push(cell);
        })

        body.push(dataRow);
    });
    var row = [
        {text: '',
        border: [false, false, false, false]}, {text: '',
        border: [false, false, false, false]}, {text: '',
        border: [false, false, false, false]}, {text: '',
        border: [false, false, false, false]}
    ]
    var row1 = [
        {
            text: '周邊總價',
            border: [false, false, false, false],
            colSpan: 3,
            fontSize: 11,
            bold: true
        }, 
        { 
        },
        {
        },
        {
            text: 'NT$ '+productPrice.toString(),
            border: [false, false, false, false],
            fontSize: 11,
            bold: true
        }
    ];
    var row2 = [
        {
            text: '報名費',
            border: [false, false, false, false],
            colSpan: 3,
            fontSize: 11,
            bold: true
        }, 
        { 
        },
        {
        },
        {
            text: 'NT$ 1125',
            border: [false, false, false, false],
            fontSize: 11,
            bold: true
        }
    ];
    var finalPrice = productPrice + 1125;
    var row3 = [
        {
            text: '總費用',
            border: [false, false, false, false],
            colSpan: 3,
            fontSize: 11,
            bold: true
        }, 
        { 
        },
        {
        },
        {
            text: 'NT$ ' + finalPrice.toString(),
            border: [false, false, false, false],
            fontSize: 11,
            bold: true
        }
    ];
    body.push(row);
    body.push(row1);
    body.push(row2);
    body.push(row3);

    return body;
}

function buildPdfTable(data, columns) {
    return {
        style: 'tableStyle',
        layout: {
            // fillColor: function (rowIndex, node, columnIndex) {
            //     return (rowIndex === 0) ? '#c2dec2' : null;
            // },
            // hLineColor: function (i, node) {
            //     return (i === 0) ? 'white' : 'white';
            // // },
            // hLineColor: 'white',
            // vLineColor: 'white',
        },
        table: {
            widths: ['25%', '25%', '25%', '25%'],
            heights: 20, 
            headerRows: 1,
            body: buildPdfTableBody(data, columns)
        }
    };
}

function getSectionsItems(){
    return [
        {
            "id": "root",
            "items":[
            {
                // name
                "id": "1439048663",
                "type": "",
                "entryType": "text",
                "entryId": "1068526554",
            },
            {
                // email
                "id": "658159440",
                "entryType": "text",
                "entryId": "883070371",
                "regex": "^(.+)@(.+)$",
                "errorMsg": "請再確認一次信箱格式～"
                
            },
            {
                // 3 digits
                "id": "981692748",
                "entryType": "text",
                "entryId": "1053365713",
                "regex": "^[0-9]{3}$",
                "errorMsg": "格式為三位半形數字喔～"
                
            },
            {
                // allergy
                "id": "1043102370",
                "type": "PARAGRAPH_TEXT",
                "entryType": "text",
                "entryId": "1395581871"
                
            },
            {
                // emergency contact
                "id": "1827994924",
                "type": "PARAGRAPH_TEXT",
                "entryType": "text",
                "entryId": "1970291756"
            },
            {
                // 1125
                "id": "929329530",
                "entryType": "radio",
                "entryId": "1841292804"
            },
            {
                // little helper
                "id": "36699560",
                "entryType": "radio",
                "entryId": "1339607071"
            },
            {
                // payment method
                "id": "895429393",
                "entryType": "radio",
                "entryId": "451787920"
            },
            {
                // display title
                "id": "1624480621",
                "entryType": ""
            },
            {
                // product
                "id": "1406572988",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "259046852",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "304960959",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "2051996369",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "1706597056",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "901430140",
                "entryType": "custom",
            }, 
            {
                // display: 文字
                "id": "985712023",
                "entryType": ""
            }, 
            {   //product
                "id": "1121831062",
                "entryType": "custom",
            }, 
            {
                // display: price
                "id": "2046362136",
                "entryType": "display",
                "entryId": "575052231"
            }, 
            {
               // display: quantity
                "id": "2139224654",
                "entryType": "display",
                "entryId": "253014823"
            }, 
            {
                // display: fee
                "id": "855092565",
                "entryType": "display",
                "entryId": "1423911485"
            }, 
            {
                // display: sum 
                "id": "1588677463",
                "entryType": "display",
                "entryId": "1725694623"
            }, 
            {
                // display: bill
                "id": "1959728480",
                "entryType": ""
            },]
        },
        {
            "id": "1194002809",
            "items":[ 
            {
                // I/E 
                "id": "218713257",
                "entryType": "radio",
                "entryId": "18356239"
            }, 
            {
                // rule: no food
                "id": "964519823",
                "entryType": "radio",
                "entryId": "1286001326"
            }, 
            {
                // with friends
                "id": "1226046570",
                "entryType": "text",
                "entryId": "1032881495"
            }, 
            {
                 // rule: with cosers
                "id": "368266770",
                "entryType": "radio",
                "entryId": "746776974"
            }, 
            {
                 // mobrei doll
                "id": "957187906",
                "entryType": "radio",
                "entryId": "450550785"
            }, 
            {
                // bring ID cards
               "id": "1565424873",
               "entryType": "radio",
               "entryId": "63787071"
              }, 
            {
                // information done
                "id": "1666827740",
                "entryType": "radio",
                "entryId": "1160286542"
            }, 
            {   
                // note: Q or thoughts
                "id": "1388002876",
                "entryType": "text",
                "entryId": "653167275"
            }, 
            {
                // note: to the team
                "id": "1496947901",
                "entryType": "text",
                "entryId": "713268329"
            }]
         },
         {
             "id": "ending",
             "items":[]
          }
        
    ]
}

function getData(){
  var sections = getSectionsItems();
  dataSet = {};
  sections.forEach(section=>{
    var items = section.items;
    items.forEach(item=>{
        var name = "entry." + item.entryId;
        var value = "";
        if(item.entryType=="radio"){
            var checkeVal = function() {
                var v;
                $(`[name="${name}"]`).each(function() {
                    if($(this).prop('checked') === true) v = $(this).val();
                });
                return v;
                };
            value = checkeVal();
        }else if(item.entryType=="custom"){
            value = product_data[item.id].quantity;
            name = product_data[item.id].quantity_id
            
        }else {
            value = $(`[name="${name}"]`).val() || '';
        }
        dataSet[name] = value;

    })
  })
  dataSet['pageHistory'] = '0,1';
  return dataSet;
}

function submitForm(frm, secid, callback) {
    var invalids = secid == '-3' ? 0 : validate(frm, secid);
    if (invalids > 0) return;
    if (this.submitting) return;
    var test_data = {
        'entry.1068526554': '7. Oct',
        'entry.883070371': 'again tester@gmail',
        'entry.1053365713': '123',
        'entry.1395581871': 'what',
        'entry.1970291756': 'OK',
        'entry.1841292804': '沒問題！',
        'entry.451787920': '銀行轉帳',
        'entry.918817329': '2',
        'entry.1230811956': '2',
        'entry.1122819681': '2',
        'entry.1946631460': '2',
        'entry.1036346855': '1',
        'entry.1797326934': '2',
        'entry.347979567': '2',
        'entry.575052231': '5386',
        'entry.253014823': '13',
        'entry.1423911485': '1125',
        'entry.1725694623': '6511',
        'entry.18356239': '非常希望！！很期待在ST的帶領下完美體驗沈浸式婚禮',
        'entry.1286001326': '知道了！',
        'entry.746776974': '知道了！',
        'entry.450550785': '當然啦！！！',
        'entry.1160286542': 'OFC，聰明絕頂的我',
        "entry.1032881495": "maomaouaauuaau",
        "entry.653167275": "please be healthy",
        'pageHistory': '0,1'
      }
    
    var pdfContext = generatePdfContext();
    pdfDocument = buildPdf(pdfContext);


      
    var data = getData();
    $.ajax({
        type: 'POST',
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSdfsLWjzLUKRZRxsUbiJNuverhidV76_VuR3GK2YFr_pkxiNw/formResponse',
        data: getData(),
        contentType: 'application/json',
        dataType: 'jsonp',
        complete: function() {
            alert('資料已送出！');
            endSection();
        }
    });

    return false;
}

function scrollIntoView(elm) {
    if (!elm) elm = this.getContentElement() || {};
    if (elm.scrollIntoView) {
        elm.scrollIntoView(true);
        // var scrolledY = window.scrollY;
        // window.scroll(0, scrolledY-80);
    }
}

function validate(frm, secid) {
    var curr = this;
    var invalids = [];
    var doc = getDocument();
    var frmdata = new FormData(frm);
    var sections = getSectionsItems();
    var section = sections[0];
    sections.forEach(function (sec, s) {
        if (sec.id == secid)
            section = sec;
    });
    doc.querySelectorAll('#ff-sec-' + section.id + ' .ff-widget-error').forEach(function (widerr) {
        widerr.style.display = 'none';
    });
    var emlwid = doc.getElementById('WidgetemailAddress');
    if (emlwid && emlwid.checkValidity() == false) {
        var widerr = doc.getElementById('ErroremailAddress');
        if (emlwid.value)
            widerr.innerHTML = '<b>!</b>' + curr.lang('Must be a valid email address');
        else
            widerr.innerHTML = '<b>!</b>' + curr.lang('This is a required question');
        widerr.style.display = 'block';
        invalids.push(emlwid);
    }
    section.items.forEach(function (itm, i) {
        var widinp = doc.querySelector('#ff-id-' + itm.id + ' input');
        if (itm.type == 'PARAGRAPH_TEXT')
            widinp = doc.querySelector('#ff-id-' + itm.id + ' textarea');
        else if (itm.type == 'LIST') {
            widinp = doc.querySelector('#ff-id-' + itm.id + ' select');
            if (!widinp)
                widinp = doc.querySelector('#ff-id-' + itm.id + ' input');
        }
        var reportError = function (msg) {
            invalids.push(widinp);
            var widerr = doc.getElementById('Error' + itm.id);
            if (widerr) {
                widerr.innerHTML = '<b>!</b>' + msg;
                widerr.style.display = 'block';
            }
        }
        var envalue;
    
        var valid = true;
        if (widinp) {
            if (widinp.readOnly) {
                widinp.readOnly = false;
                valid = widinp.checkValidity();
                widinp.readOnly = true;
            }
            else
                valid = widinp.checkValidity();
            envalue = frmdata.get(widinp.name);
            
            // check custom regex
            if(envalue && itm.regex){
                console.log("hey");
                var regex = new RegExp(`${itm.regex}`);
                valid = regex.test(envalue);
            }
            
        }
        // name = entry.1068526554
        // id = Widget1439048663
        if (valid == false) {
            if (widinp.hasAttribute('required') && !envalue) {
                // reportError(curr.lang('This is a required question'));
                reportError('這是必填問題喔！');
            }
            else if (envalue) {
                if (itm.errorMsg){
                    // reportError(curr.lang('Must be a valid email address'));
                    reportError(itm.errorMsg);
                }
                else{
                    reportError('格式錯誤');
                }
            }
            else {
                reportError('好像有東西出錯了');
            }
        }
        else if (widinp && widinp.list && envalue && itm.choices) {
            var matches = itm.choices.filter(ch => ch.value == envalue.trim());
            if (matches.length == 0) reportError(curr.lang('Invalid answer. Clear & select a valid answer from the list'));
        }
        else {
            if (curr.data && curr.data.facade && curr.data.facade.items)
                itm.overwrite = curr.data.facade.items[itm.id];
            validateEngine(itm, frmdata, reportError);
        }
    });
    if (invalids.length > 0) {
        invalids[0].focus();
        scrollIntoView(invalids[0]);
    }
    return invalids.length;
}

function gotoSection(frm = {}, secid, deftrg) {
    var doc = this.getDocument();
    var trg;
    if (deftrg == 'back') {
        trg = getPreviousSectionId(secid);
        jumptoSection(frm, secid, deftrg, trg);
    }
    else {
        this.saveDraft();
       
        var invalids = validate(frm, secid);
       
        if (invalids > 0) return;
        trg = deftrg ? deftrg : getNextSectionId(secid);
        var items = this.data?.scraped.items || {};
        doc.querySelectorAll('#ff-sec-' + secid + ' .ff-nav-dyn').forEach(function (wid = {}, w) {
            var navs = [];
            var fid = wid.id ? wid.id.split('-').pop() : null;
            var itm = items[fid] || {};
            var enval = frm['entry.' + itm.entry] || {};
            if (itm.choices) navs = itm.choices.filter(ch => ch.value == enval.value);
            if (navs.length > 0) trg = navs[0].navigateTo;
        });
        if (trg == -1)
            trg = secid;
        else if (trg == -2)
            trg = getNextSectionId(secid);
        else if (trg == -3)
            trg = 'ending';
    }
    jumptoSection(frm, secid, deftrg, trg);
}

function updateProduct(enid, val, close) {
    product_data[enid].quantity = val ? val: 0;
    
    if (enid) {
        if (val){
            draft.entry[enid] = val;
        }
        else{
            delete draft.entry[enid];
        }
           
    }
    calculateProduct();
    renderBill();
    if (close)
    {
        this.renderProduct(enid, val);
        this.closePopup(enid, val);
    }
    else
    {
        this.renderProduct(enid, val);
    }
       
}

this.saveDraft = function() {
}


this.closePopup = function (render = true) {
    document.body.style.overflowY = 'auto';
    var overlay = document.getElementById('ff-addprd-overlay');
    overlay.classList.remove('active');
    var popup = document.getElementById('ff-addprd-popup');
    popup.classList.remove('active');
    popup.classList.remove('ff-consent-confirm');
    // setTimeout(function () {
    //     if (render) formFacade.render();
    // }, 10);
}

this.renderProduct = function (enid, val) {
    var id = "ff-id-" + enid;
    var ele = document.getElementById(id);
    if(!val){
        if (ele.lastElementChild.classList.contains("ff-sel-cart")){
            ele.removeChild(ele.lastChild);
        }
    }else{
        var changedNode = `<div onclick="showProduct(${enid})" class="ff-sel-cart">
        <div class="ff-sel-cart-sm">x <b>${val}</b></div>
      </div>`;
        if (ele.lastElementChild.classList.contains("ff-sel-cart")){
            ele.removeChild(ele.lastChild);
            ele.lastElementChild = changedNode;
        }
        ele.innerHTML += changedNode;
        
    }
}


function generateProductInnterHtml(product){
    var itemList = ""
    for(var i=1; i< 10; i++){
        var item = "";
       
        if (draft.entry[product.product_id] && draft.entry[product.product_id] == i){
            item =  `<li class="col-qty-active" onclick="updateProduct(${product.product_id}, ${i}, true)" title="${i}" id="prdentry.${product.product_id}">
                     ${i}
                 </li>`;
        }else{
            item =  `<li onclick="updateProduct(${product.product_id}, ${i}, true)" title="${i}" id="prdentry.${product.product_id}">
            ${i} </li>`;
        }
        itemList += item;
    }
    var footer = '';
    if (draft.entry[product.product_id]){
        footer = `
    <div class="prdfooter">
			<a class="prddel" href="#!" onclick="updateProduct(${product.product_id}, null, true)">清空</a>
		</div>`;
    }
    var header = `     
    <div class="prdheader">
	<div class="prdtitle">${product.title}</div>
	<div class="prdhelp">
		
			NT$${product.price}
	</div>
    
	<div class="prdclose" onclick="closePopup(false)">
		<span class="material-icons">close</span>
	</div>
</div>
	
<div>
	
<div class="prdwdg">
        <div class="col-qty">
        
            <label>請選擇數量</label>
        
          <ul>
            ${itemList}
          </ul>
    </div>
</div>
${footer}

</div>`
  return header;
}

function  showProduct(iid) {
    var curr = this;
    this.product = { id: iid };
    var item = product_data[iid];
    if (item && item.type == 'PARAGRAPH_TEXT') {
        var val = this.draft.entry ? this.draft.entry[item.entry] : null;
        this.product.configurable = this.toConfigurable(val);
    }
    var overlay = document.getElementById('ff-addprd-overlay');
    overlay.classList.add('active');
    var popup = document.getElementById('ff-addprd-popup');
    popup.classList.add('active');
    popup.innerHTML = generateProductInnterHtml(item);
    document.body.style.overflowY = 'hidden';

}


function validateEngine(itm, frmdata, reportError) {
    var curr = this;
    var txtval = frmdata.get('entry.' + itm.entry);
    if (!itm.validType && itm.overwrite && itm.overwrite.validation && itm.overwrite.validation.validType) {
        Object.assign(itm, itm.overwrite.validation);
    }
    if (itm.type == 'CHECKBOX') {
        var valarr = frmdata.getAll('entry.' + itm.entry);
        var valothr = frmdata.get('entry.' + itm.entry + '.other_option_response');
        var validothr = valothr ? !valothr.trim() : true;
        var validop = itm.validOperator;
        var validval = itm.validValue;
        if (isNaN(validval) == false)
            validval = parseInt(validval);
        var validmsg = itm.validMessage;
        if (itm.required && valarr.length == 0) {
            reportError(curr.lang('This is a required question'));
        }
        else if (itm.required && valarr.length == 1 && valarr[0] == '__other_option__' && validothr) {
            reportError(curr.lang('This is a required question'));
        }
        else if (validop == 'Atmost' && valarr.length > validval) {
            if (!validmsg) validmsg = 'Must select at most ' + validval + ' options';
            reportError(validmsg);
        }
        else if (validop == 'Atleast' && valarr.length < validval) {
            if (!validmsg) validmsg = 'Must select at least ' + validval + ' options';
            reportError(validmsg);
        }
        else if (validop == 'Exactly' && valarr.length != validval) {
            if (!validmsg) validmsg = 'Must select exactly ' + validval + ' options';
            reportError(validmsg);
        }
    }
    else if (itm.type == 'MULTIPLE_CHOICE') {
        var valothr = frmdata.get('entry.' + itm.entry + '.other_option_response');
        var validothr = valothr ? !valothr.trim() : true;
        if (itm.required && txtval == '__other_option__' && validothr) {
            reportError(curr.lang('This is a required question'));
        }
    }
    else if (itm.type == 'GRID') {
        if (itm.required) {
            itm.rows.forEach(function (rw, r) {
                var valarr = frmdata.getAll('entry.' + rw.entry);
                if (valarr.length == 0) {
                    validmsg = 'This question requires one response per row';
                    if (rw.multiple == 1)
                        validmsg = 'This question requires at least one response per row';
                    validmsg = curr.lang(validmsg);
                    reportError(validmsg);
                }
            });
        }
        if (itm.onepercol) {
            var rwvals = {};
            itm.rows.forEach(function (rw, r) {
                frmdata.getAll('entry.' + rw.entry).forEach(function (rwval) {
                    if (rwvals[rwval]) {
                        validmsg = 'Please don\'t select more than one response per column';
                        validmsg = curr.lang(validmsg);
                        reportError(validmsg);
                    }
                    rwvals[rwval] = rw.entry;
                });
            });
        }
    }
    else if (itm.overwrite && itm.overwrite.type == 'FILE_UPLOAD') {
        var fileval = frmdata.get('entry.' + itm.entry);
        var validmsg = itm.validMessage;
        if (itm.required && !fileval) {
            if (!validmsg) validmsg = curr.lang('This is a required question');
            reportError(validmsg);
        }
    }
    else if (txtval && (itm.type == 'TEXT' || itm.type == 'PARAGRAPH_TEXT')) {
        var validtyp = itm.validType;
        var validop = itm.validOperator;
        var validmsg = itm.validMessage;
        if (itm.validDynamic && itm.validEntryId) {
            var compTxtVal = frmdata.get('entry.' + itm.validEntryId);
            if (validtyp == 'Number') {
                var compFltval; var fltval;
                if (isNaN(compTxtVal) == false)
                    compFltval = parseFloat(compTxtVal);
                if (isNaN(txtval) == false)
                    fltval = parseFloat(txtval);
                if (isNaN(txtval))
                    enmsg = 'Must be a number';
                else if (!compTxtVal || isNaN(compTxtVal))
                    enmsg = 'Comparison field must be a number';
                else if (validop == 'GreaterThan' && fltval > compFltval == false)
                    enmsg = 'Must be a number greater than ' + compFltval;
                else if (validop == 'GreaterEqual' && fltval >= compFltval == false)
                    enmsg = 'Must be a number greater than or equal to ' + compFltval;
                else if (validop == 'LessThan' && fltval < compFltval == false)
                    enmsg = 'Must be a number less than ' + compFltval;
                else if (validop == 'LessEqual' && fltval <= compFltval == false)
                    enmsg = 'Must be a number less than or equal to ' + compFltval;
                else if (validop == 'EqualTo' && fltval != compFltval)
                    enmsg = 'Must be a number equal to ' + compFltval;
                else if (validop == 'NotEqualTo' && fltval == compFltval)
                    enmsg = 'Must be a number not equal to ' + compFltval;
                if (enmsg) {
                    reportError(validmsg ? validmsg : enmsg);
                }
            } else if (validtyp == 'Text') {
                var enmsg;
                var compTxtVal = frmdata.get('entry.' + itm.validEntryId);
                if (validop == 'EqualTo' && txtval != compTxtVal)
                    enmsg = 'Must equal to ' + itm.validValue;
                else if (validop == 'NotEqualTo' && txtval == compTxtVal)
                    enmsg = 'Must not equal to ' + itm.validValue;
                if (enmsg) {
                    reportError(validmsg ? validmsg : enmsg);
                }

            }
        } else if (validtyp == 'Number') {
            var enmsg;
            if (!itm.validValue)
                itm.validValue = 0;
            var fltval;
            if (isNaN(txtval) == false)
                fltval = parseFloat(txtval);
            var validval = itm.validValue;
            if (isNaN(validval) == false)
                validval = parseFloat(validval);
            if (isNaN(txtval))
                enmsg = 'Must be a number';
            else if (validop == 'IsNumber' && isNaN(txtval))
                enmsg = 'Must be a number';
            else if (validop == 'WholeNumber' && (isNaN(txtval) || txtval.indexOf('.') >= 0))
                enmsg = 'Must be a whole number';
            else if (validop == 'GreaterThan' && fltval > validval == false)
                enmsg = 'Must be a number greater than ' + validval;
            else if (validop == 'GreaterEqual' && fltval >= validval == false)
                enmsg = 'Must be a number greater than or equal to ' + validval;
            else if (validop == 'LessThan' && fltval < validval == false)
                enmsg = 'Must be a number less than ' + validval;
            else if (validop == 'LessEqual' && fltval <= validval == false)
                enmsg = 'Must be a number less than or equal to ' + validval;
            else if (validop == 'EqualTo' && fltval != validval)
                enmsg = 'Must be a number equal to ' + validval;
            else if (validop == 'NotEqualTo' && fltval == validval)
                enmsg = 'Must be a number not equal to ' + validval;
            else if (validop == 'Between' && itm.validValue2 && (fltval < validval || fltval > parseFloat(itm.validValue2)))
                enmsg = 'Must be a number between ' + itm.validValue + ' and ' + itm.validValue2;
            else if (validop == 'NotBetween' && itm.validValue2 && (fltval >= validval && fltval <= parseFloat(itm.validValue2)))
                enmsg = 'Must be a number less than ' + itm.validValue + ' or greater than ' + itm.validValue2;

            if (enmsg) {
                reportError(validmsg ? validmsg : enmsg);
            }
        }
        else if (validtyp == 'Text') {
            var enmsg;
            if (validop == 'EqualTo' && txtval != itm.validValue)
                enmsg = 'Must equal to ' + itm.validValue;
            else if (validop == 'NotEqualTo' && txtval == itm.validValue)
                enmsg = 'Must not equal to ' + itm.validValue;
            else if (validop == 'Contains' && itm.validValue && (txtval.indexOf(itm.validValue) >= 0) == false)
                enmsg = 'Must contain ' + itm.validValue;
            else if (validop == 'NotContains' && itm.validValue && (txtval.indexOf(itm.validValue) >= 0))
                enmsg = 'Must not contain ' + itm.validValue;
            else if (validop == 'Email' && /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/.test(txtval) == false)
                enmsg = 'Must be an email';
            else if (validop == 'URL' && /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(txtval) == false)
                enmsg = 'Must be a URL';
            if (enmsg) {
                reportError(validmsg ? validmsg : enmsg);
            }
        }
        else if (itm.validValue && validtyp == 'Regex') {
            var enmsg;
            if (!txtval) txtval = '';
            var regx = new RegExp(itm.validValue, 'g');
            if (validop == 'Contains' && regx.test(txtval) == false)
                enmsg = 'Must contain ' + itm.validValue;
            else if (validop == 'NotContains' && regx.test(txtval))
                enmsg = 'Must not contain ' + itm.validValue;
            else if (validop == 'Matches') {
                var mtrs = txtval.match(regx);
                var validmt = mtrs && mtrs.length == 1 && mtrs[0] == txtval;
                if (!validmt) enmsg = 'Must match ' + itm.validValue;
            }
            else if (validop == 'NotMatches' && txtval.match(regx)) {
                var mtrs = txtval.match(regx);
                var validmt = mtrs && mtrs.length == 1 && mtrs[0] == txtval;
                if (validmt) enmsg = 'Must not match ' + itm.validValue;
            }
            if (enmsg) {
                reportError(validmsg ? validmsg : enmsg);
            }
        }
        else if (validtyp == 'Length') {
            var enmsg;
            if (!itm.validValue)
                itm.validValue = 0;
            if (validop == 'MaxChar' && txtval.length > parseInt(itm.validValue))
                enmsg = 'Must be fewer than ' + itm.validValue + ' characters';
            else if (validop == 'MinChar' && txtval.length < parseInt(itm.validValue))
                enmsg = 'Must be at least ' + itm.validValue + ' characters';
            if (enmsg) {
                reportError(validmsg ? validmsg : enmsg);
            }
        }
    }
}


function SearchSidebar() {
    this.init = function (focus) {
        var curr = this;
        if (focus) document.getElementById('ff-search-text').focus();
        document.getElementById('ff-search-text').value = '';
        var fac = formFacade.data.facade;
        var fcitms = fac && fac.items ? fac.items : {};
        var navs = this.getCategories();
        var lis = navs.map((sec, s) => {
            var publishId = formFacade.data.request.params.publishId;
            var img = 'https://neartail.com/img/collections.svg';
            var imgs = sec.items.filter(itm => itm.type == 'IMAGE' && itm.blob);
            var imgttls = sec.items.filter(itm => itm.titleImage && itm.titleImage.blob);
            var fcimgs = sec.items.map(itm => fcitms[itm.id]).filter(fcitm => fcitm && fcitm.prdimage);
            if (imgs.length > 0)
                img = 'https://formfacade.com/itemembed/' + publishId + '/item/' + imgs[0].id + '/image/' + imgs[0].blob;
            else if (fcimgs.length > 0)
                img = fcimgs[0].prdimage;
            else if (imgttls.length > 0)
                img = 'https://formfacade.com/itemimg/' + publishId + '/item/' + imgttls[0].id + '/title/' + imgttls[0].titleImage.blob;
            if (s == 0 && sec.products.length == 0) {
                return '<li id="ff-search-' + sec.id + '" onclick="searchSidebar.navigate(\'' + sec.id + '\')">' +
                    '<span class="material-icons ff-search-altimage">home</span>' +
                    '<div class="ff-search-title">Home<br/><small class="ff-search-quantity">' + sec.title + '</small></div>' +
                    '</li>';
            } else if (s == navs.length - 1 && sec.products.length == 0) {
                return '<li id="ff-search-' + sec.id + '" onclick="searchSidebar.navigate(\'' + sec.id + '\')">' +
                    '<span class="material-icons ff-search-altimage">payments</span>' +
                    '<div class="ff-search-title">Checkout<br/><small class="ff-search-quantity">' + sec.title + '</small></div>' +
                    '</li>';
            } else {
                return '<li id="ff-search-' + sec.id + '" onclick="searchSidebar.navigate(\'' + sec.id + '\')">' +
                    '<img class="ff-search-image" src="' + img + '"/>' +
                    '<div class="ff-search-title">' +
                    sec.title + '<br/><small class="ff-search-quantity">' + sec.products.length + ' product' + (sec.products.length > 1 ? 's' : '') + '</small>';
                '</div>' +
                    '</li>';
            }
        });
        document.getElementById('ff-search-items').innerHTML = '<div class="ff-search-head">All Categories</div>' + lis.join('\n');
    }

    this.getCategories = function () {
        var curr = this;
        var scrape = formFacade.data.scraped || {};
        var facade = formFacade.data.facade || {};
        var setting = facade.setting || {};
        var submit = facade.submit || {};
        var next = facade.next || {};
        var crncy = setting.currency;
        var fcitms = facade.items || {};
        var sections = formFacade.getSections();
        sections[0].title = scrape.title;
        var ctgs = sections.map(function (sec) {
            var itmnext = next[sec.id] || submit[sec.id] || {};
            if (itmnext.navigation == 'added') {
                sec.products = sec.items.map(itm => {
                    var visible = true;
                    var fitm = fcitms[itm.id] || {};
                    if (fitm.mode == 'hide') visible = false;
                    if (fitm.inventory == 'yes' && fitm.remain <= 0) visible = false;
                    var prc = formFacade.getPrice(itm, crncy);
                    if ((prc.min > 0 || prc.max > 0) && visible)
                        return { id: itm.id, entry: itm.entry, price: prc, product: itm, section: sec };
                }).filter(prd => prd);
                if (sec.products.length > 0) return sec;
            }
        }).filter(sec => sec);
        return ctgs;
    }

    this.search = function (txt) {
        var curr = this;
        var prds = [];
        var ctgs = this.getCategories();
        ctgs.forEach(ctg => { prds = prds.concat(ctg.products); });
        var oitems = formFacade.data.facade.items;
        var cfg = { keys: ['product.title', 'product.description', 'section.title'], ignoreLocation: true, threshold: 0.2 };
        var fuse = new Fuse(prds, cfg);
        var rslt = fuse.search(txt);
        var htm = rslt.map(rsl => {
            var rs = rsl.item;
            var img = 'https://neartail.com/img/insert_photo.svg';
            var ttlimg = rs.product.titleImage;
            var publishId = formFacade.data.request.params.publishId;
            if (ttlimg) img = 'https://formfacade.com/itemimg/' + publishId + '/item/' + rs.product.id + '/title/' + ttlimg.blob;
            var oitem = oitems ? oitems[rs.product.id] : null;
            if (oitem && oitem.prdimage) img = oitem.prdimage;
            var li = '<li id="ff-search-' + rs.id + '" onclick="searchSidebar.navigate(\'' + rs.section.id + '\', \'' + rs.product.id + '\')">'
                + '<img class="ff-search-image" src="' + img + '"/>'
                + '<div class="ff-search-title">' + rs.product.title + '<br/>'
                + '<small class="ff-search-quantity">in ' + rs.section.title + '</small>'
                + '</div>'
                + '<b>' + rs.price.minformat + '</b>'
            '</li>';
            return li;
        });
        if (htm.length > 0) {
            jQuery('#ff-search-items').html(htm.join('\n'));
            jQuery('#ff-search-categories').hide();
        }
        else {
            jQuery('#ff-search-items').html('<li class="ff-search-noitem">'
                + '<img/><div class="ff-search-title">- No product found -</div></li>');
            jQuery('#ff-search-categories').show();
        }
    }

    this.navigate = function (sid, iid) {
        formFacade.directtoSection(sid, iid);
        this.hide();
    }

    this.show = function (focus = true) {
        if (window.formFacade) {
            this.init(focus);
            jQuery('#ff-search-categories').show();
            jQuery('#ff-search-sidebar').addClass('active');
            jQuery('#ff-search-overlay').addClass('active');
            jQuery('body').css('overflow', 'hidden');
        }
        else {
            var curr = this;
            setTimeout(_ => curr.show(), 500);
        }
    }

    this.hide = function () {
        jQuery('#ff-search-sidebar').removeClass('active');
        jQuery('#ff-search-overlay').removeClass('active');
        jQuery('body').css('overflow', 'auto');
    }
}
window.searchSidebar = new SearchSidebar();


