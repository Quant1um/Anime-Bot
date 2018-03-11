const Loadable = require("#config/loadable");
const Utils = require("#utils/utils");
const Debug = require("#utils/debug");
const ReferenceResolver = require("#utils/reference_resolver");

module.exports = class I18n extends Loadable{

    load() {
        super.load();
        this.resolver = new ReferenceResolver(this.parsed_data);
    }

    get(key) {
        return this.resolver.get(key);
    }
};

module.exports.Null = class NullI18n {

    constructor() {
        Debug.warn("placeholder", "No localization file has been specified; using NullI18n instead...");
    }

    get(key) { }
};