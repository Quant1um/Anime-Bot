const Loadable          = require("./loadable");
const ReferenceResolver = require("#utils/reference_resolver");
const Filesystem        = require("fs");
const Timers            = require("timers");
const Config            = require("./config");

const INDENT = "    ";
const TAG = "statistics";

class Statistics extends Loadable {

    constructor() {
        super(null, null);
        this.modified = false;
    }

    resolveConfig(resolver) {
        this.enabled = resolver.get("enabled", "boolean");
        if (!this.enabled) {
            Debug.warn(TAG, "Statistics is disabled!");
            return;
        }

        this.filename = resolver.get("location", "string");
        this.encoding = resolver.get("encoding", new Config.ValueEntry("string", "utf8"));
        this.autosave = resolver.get("autosave", new Config.ValueEntry("number", -1));
    }

    load() {
        if (!this.enabled) return;

        if (typeof this.filename !== "string")
            throw new Error("File path is not a string: " + this.filename);

        if (!Filesystem.existsSync(this.path)) {
            Filesystem.writeFileSync(this.path, JSON.stringify({}));
            Debug.log(TAG, "Empty statistics file at {0} has been created!", this.path);
        }

        super.load();
        this.resolver = new ReferenceResolver(this.parsed_data);

        if (this.autosave > 0 && this.autosave < 1e9)
            Timers.setInterval(this.save, this.autosave * 1000 * 60 * 60);
    }

    get(key) {
        if (!this.enabled) return null;
        return this.resolver.get(key);
    }

    set(key, value) {
        if (!this.enabled) return null;
        this.modified = true;
        return this.resolver.set(key, value);
    }

    modify(key, modificator) {
        if (!this.enabled) return null;
        this.modified = true;
        return this.resolver.modify(key, modificator);
    }

    increment(key, value) {
        if (!this.enabled) return null;
        this.modified = true;
        return this.modify(key, (old) => +(old || 0) + value);
    }

    save() {
        if (!this.enabled) return;
        if (!this.modified) {
            Debug.log(TAG, "Statistics data hasn't changed, so saving it is reduant.");
            return;
        }
        this.modified = false;

        Filesystem.writeFileSync(this.filename, JSON.stringify(this.parsed_data || {}, null, INDENT), { encoding: this.encoding });
        Debug.log(TAG, "Statistics has been saved to {0}!", this.filename);
    }
}

module.exports = new Statistics();
module.exports.Class = Statistics;