const Loadable = require("#config/loadable");
const Utils = require("#utils/utils");
const Debug = require("#utils/debug");
const Entry = require("#config/entries/entry");
const NestedEntry = require("#config/entries/nested_entry");
const ValueEntry = require("#config/entries/value_entry");

module.exports = class Config extends Loadable{

    retrieve(name, entry) {
        if (Utils.isValid(this[name]))
            return this[name];

        if (!Utils.isValid(entry))
            throw new Error("Entry argument is not valid!");
        else if (!(entry instanceof Entry)) {
            switch (typeof entry) {
                case "object": entry = new NestedEntry(entry); break;
                case "string": entry = new ValueEntry(entry); break;
                default: throw new Error("Entry argument has invalid type!");
            } 
        }

        var obj = this.parsedData[name];
        if (!Utils.isValid(obj)) {
            Debug.warn("config", "Invalid config entry: {0}.", name);
            return;
        }

        var parsed = entry.parse(name, obj);
        Object.defineProperty(this, name, { get: () => parsed });
        return parsed;
    }
};