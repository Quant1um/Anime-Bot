const Loadable = require("#config/loadable");
const Utils = require("#utils/utils");
const Filesystem = require("fs");
const Debug = require("#utils/debug");

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
    }

    get(key) {
        return Utils.resolveReference({
            root: this.parsedData,
            reference: key,
            create: true
        });
    }

    set(key, value) {
        return Utils.resolveReference({
            root: this.parsedData,
            reference: key,
            create: true,
            value: value
        });
    }

    increment(key, value) {
        return this.set(key, (old) => +old + value);
    }

    save() {
        Filesystem.writeFileSync(this.filename, JSON.stringify(this.parsedData || {}, null, INDENT), { encoding: this.encoding });
        Debug.log("stats", "Statistics has been saved to {0}!", this.filename);
    }
};

module.exports.Null = class NullStatistics {

    constructor() {
        Debug.warn("placeholder", "No statis file has been specified; using NullL18n instead...");
    }

    get() { }
    save() { }
};
