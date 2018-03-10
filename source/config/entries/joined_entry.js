const Entry = require("#config/entries/entry");

module.exports = class JoinedEntry extends Entry {

    constructor(def) {
        super();
        this.default = def;
    }

    parse(name, object) {
        return object || this.default;
    }
};