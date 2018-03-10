const Utils = require("#utils");
const Entry = require("#config/entries/entry");
const Debug = require("#debug");

module.exports = class ValueEntry extends Entry{

    constructor(type, def) {
        super();
        this.type = type || ValueEntry.type(def);
        this.default = def;
    }

    parse(name, object) {
        var value = object || this.default;
        if (!Utils.isValid(value))
            Debug.warn("config", "Undefined config value \"{0}\"!", name);
        else if (Utils.isValid(this.type) && ValueEntry.type(value) !== this.type)
            Debug.warn("config", "Type mismatch at {0}: expected: {1}, received: {2}!", name, ValueEntry.type(object), this.type);
        return value;
    }

    static type(value) {
        if (Array.isArray(value))
            return "array";
        return typeof value;
    }
};