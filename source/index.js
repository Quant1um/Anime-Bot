"use strict";

const Path = require("path");
const Module = require("module");
const _require = Module.prototype.require;
Module.prototype.require = function (path) {
    if (typeof path !== "undefined" && path[0] === "#")
        return _require.apply(this, [Path.normalize(__dirname + "/" + path.substr(1))]);
    return _require.apply(this, arguments);
};

const Debug       = require("#utils/debug");
const Utils       = require("#utils/utils");
const Config      = require("#config/config");
const ValueEntry  = require("#config/entries/value_entry");
const JoinedEntry = require("#config/entries/joined_entry");
const L18n        = require("#config/l18n");
const Statistics  = require("#config/stats");
const BooruSearch = require("#search/booru_search");
const ReferenceResolver = require("#utils/reference_resolver");

module.exports = class Main {

    constructor() {
        if (Utils.isValid(global.main))
            throw new Error("Instance of Main class already present!");
        global.main = this;

        this.load();
    }

    load() {
        this.config = new Config("config.json", "utf8");
        this.booru = new BooruSearch(this.config.retrieve("booru_search", {
            separators: new ValueEntry("array", [" "]),
            default_tags: new ValueEntry("array", []),
            default_booru: new ValueEntry("string"),
            aliases: new JoinedEntry({}),
            aliases_regexp: new JoinedEntry({}),
            functional_tags: new JoinedEntry({})
        }));

        var l18n_name = this.config.retrieve("locale_file", "string");
        this.localization = Utils.isValid(l18n_name) ? new L18n(l18n_name, "utf8") : new L18n.Null();

        var stats_name = this.config.retrieve("stats_file", "string");
        this.stats = Utils.isValid(stats_name) ? new Statistics(stats_name, "utf8") : new Statistics.Null();

        this.interfaces = this.config.retrieve("interfaces", new JoinedEntry({}));
        this.startupInterfaces();
        this.registerExitHandler();

        this.stats.increment("system.loads", 1);
    }

    unload() {
        this.unloadInterfaces();
        this.stats.save();
    }

    startupInterfaces() {
        for (let name in this.interfaces) {
            let interface_desc = this.interfaces[name];
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

            this.interfaces[name] = resolved;
            resolved.startup(this.config);
            Debug.log("main", "Interface has been bound: {0}", name);
        }
    }

    unloadInterfaces() {
        for (let name in this.interfaces)
            this.interfaces[name].unload(this.config);
    }

    registerExitHandler() {
        var bound = this.dispose.bind(this);
        process.once("SIGINT", bound);
        process.once("SIGTERM", bound);
        process.once("SIGUSR1", bound);
        process.once("SIGUSR2", bound);
        process.once("uncaughtException", bound);
    }

    //https://help.heroku.com/ROG3H81R/why-does-sigterm-handling-not-work-correctly-in-nodejs-with-npm
    dispose(err) {
        if (this.disposed) return;
        this.disposed = true;

        Debug.log("main", "Shutdown... Please, wait!");
        if (err) Debug.error("main", err.stack || err.message || err);
        try {
            this.unload();
        } catch (err2) {
            if (err) Debug.error("main", "--------------------------");
            Debug.error("main", err2.stack || err2.message || err2);
        }
        setTimeout(() => process.exit(err ? 1 : 0), 2000).unref();
    }
};



/**
 * TODO:
 *   - functional tags
 *   - command handler
 *   - refactor:
 *     - additional checks
 */

