//little helper that makes development little easier >.<

const Path = require("path");
const Module = require("module");
const Events = require("events");

function define(name, value) {
    Object.defineProperty(global, name, { value: value, writable: false });
}

//modules
define("Utils", require("./utils/utils"));
define("Debug", require("./utils/debug"));

//functions
define("defined", function(value) {
    return typeof value !== "undefined" && value !== null;
});

//constants
define("PROJECT_ROOT", __dirname);

//modifying Module#require(string);
const _require = Module.prototype.require;
Module.prototype.require = function (path) {
    if (typeof path !== "undefined" && path[0] === "#")
        return _require.apply(this, [Path.normalize(PROJECT_ROOT + "/" + path.substr(1))]);
    return _require.apply(this, arguments);
};

/* Utils and Debug are imported by default
 * Module#require(string) function now accepts path with # symbol at start for requiring relative to easy.js (not relative to requirer)
 * defined(any) function that equivalent to typeof object !== "undefined" && object !== null
 */
