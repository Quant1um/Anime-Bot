const Loadable = require("#config/loadable");
const Utils = require("#utils");
const Debug = require("#debug");

module.exports = class L18n extends Loadable{

    get(key) {
        return Utils.resolveReference(this.parsedData, key);
    }
};

module.exports.Null = class NullL18n {

    constructor() {
        Debug.warn("placeholder", "No localization file has been specified; using NullL18n instead...");
    }

    get(key) { }
};