"use strict";
//TODO refactor

var Path = require("path");
var Module = require("module");
var _require = Module.prototype.require;
Module.prototype.require = function (path) {
    if (typeof path !== "undefined" && path[0] === "#")
        return _require.apply(this, [Path.normalize(__dirname + "/" + path.substr(1))]);
    return _require.apply(this, arguments);
};

var Debug       = require("#debug");
var Utils       = require("#utils");
var Config      = require("#config/config");
var ValueEntry  = require("#config/entries/value_entry");
var JoinedEntry = require("#config/entries/joined_entry");
var L18n        = require("#config/l18n");
var Statistics  = require("#config/stats");
var BooruSearch = require("#search/booru_search");

var config = global.config = new Config("config.json", "utf8");
var l18n = global.l18n = new L18n(config.retrieve("locale_file", "string"));
var stats = global.stats = new Statistics(config.retrieve("stats_file", "string"));
var booru = global.booru = new BooruSearch(config.retrieve("booru_search", {
    separators: new ValueEntry("array", [" "]),
    default_tags: new ValueEntry("array", []),
    default_booru: new ValueEntry("string"),
    aliases: new JoinedEntry({}),
    aliases_regexp: new JoinedEntry({}),
    functional_tags: new JoinedEntry({})
}));

var interfaces = config.retrieve("interfaces", new JoinedEntry({}));

function startupInterfaces() {
    for (let name in interfaces) {
        let interface_desc = interfaces[name];
        let resolved = null;

        switch (typeof interface_desc) {
            case "string":
                let ctor = require(Utils.resolvePath(interface_desc));
                resolved = new ctor(); break;
            case "function": resolved = new interface_desc(); break;
            case "object": resolved = interface_desc; break;
        }

        if (!Utils.isValid(resolved))
            throw new Error("Undefined interface (" + name + "): " + interface_desc);

        interfaces[name] = resolved;
        resolved.startup(config);
        Debug.log("main", "Interface has been bound: {0}", name);
    }
}

function unloadInterfaces() {
    for (let name in interfaces) 
        interfaces[name].unload(config);
}

startupInterfaces();

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("SIGUSR1", cleanup);
process.on("SIGUSR2", cleanup);
process.on("uncaughtException", cleanup);

//https://help.heroku.com/ROG3H81R/why-does-sigterm-handling-not-work-correctly-in-nodejs-with-npm
function cleanup(err) {
    Debug.log("main", "Shutdown... Please, wait!");
    if (err) Debug.error("main", err.stack || err);
    try {
        unloadInterfaces();
    } catch (e) {
        if (err) Debug.error("main", "----------------------");
        Debug.error("main", e.stack || e);
    }
    setTimeout(() => process.exit(err ? 1 : 0), 2000).unref();
}


