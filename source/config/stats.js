const Loadable = require("#config/loadable");
const Utils = require("#utils/utils");
const Filesystem = require("fs");
const Debug = require("#utils/debug");
const ReferenceResolver = require("#utils/reference_resolver");

const INDENT = "    ";

module.exports = class Statistics extends Loadable{

    load() {
        if (typeof this.filename !== "string")
            throw new Error("File path is not a string: " + this.filename);

        if (!Filesystem.existsSync(this.filename)) {
            Filesystem.writeFileSync(this.filename, JSON.stringify({}));
            Debug.log("loader", "Empty statistics file at {0} has been created!", this.filename);
        }

        super.load();
        this.resolver = new ReferenceResolver(this.parsed_data);
    }

    get(key) {
        return this.resolver.get(key);
    }

    set(key, value) {
        return this.resolver.set(key, value);
    }

    modify(key, modificator) {
        return this.resolver.modify(key, modificator);
    }

    increment(key, value) {
        return this.modify(key, (old) => +(old || 0) + value);
    }

    save() {
        Filesystem.writeFileSync(this.filename, JSON.stringify(this.parsed_data || {}, null, INDENT), { encoding: this.encoding });
        Debug.log("stats", "Statistics has been saved to {0}!", this.filename);
    }
};

module.exports.Null = class NullStatistics {

    constructor() {
        Debug.warn("placeholder", "No statistics file has been specified; using NullL18n instead...");
    }

    get(key) { }
    set(key, value) { }
    modify(key, modificator) { }
    increment(key, value) { }
    save() { }
};
