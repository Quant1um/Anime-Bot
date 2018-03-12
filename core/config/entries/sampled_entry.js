const Entry = require("#config/entries/entry");
const NestedEntry = require("#config/entries/nested_entry");

module.exports = class SampledEntry extends Entry {

    constructor(sample) {
        super();
        this.sample = sample instanceof Entry ? sample : new NestedEntry(sample);
    }

    parse(name, object) {
        if (!Utils.isValid(object)) {
            console.warn("[CONFIG] Undefined config value \"" + name + "\"!");
            return;
        }

        var result = {};
        for (let nested_name in object) {
            this.sample.parse(nested_name, object[nested_name]);
        }

        return result;
    }
};