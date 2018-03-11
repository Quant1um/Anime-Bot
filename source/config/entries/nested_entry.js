const Entry = require("#config/entries/entry");
const Utils = require("#utils/utils");

module.exports = class NestedEntry extends Entry {

    constructor(nested) {
        super();
        this.nested = nested;
        
        if (!Utils.isValid(nested))
            throw new Error("Argument is not valid!");
    }

    parse(name, object) {
        if (!Utils.isValid(object)) {
            console.warn("[CONFIG] Undefined config value \"" + name + "\"!");
            return;
        }

        var obj = {};
        for (let nested_name in this.nested) {
            obj[nested_name] = this.nested[nested_name].parse(nested_name, object[nested_name]);
        }

        return obj;
    }
};