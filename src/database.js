const Loki = require("lokijs");
const LokiFSStructuredAdapter = require("lokijs/src/loki-fs-structured-adapter");

class DatabaseManager {

    constructor(options) {
        this.filename = options.filename;
        this.autosaveInterval = options.autosaveInterval;
        this.verbose = options.verbose;
    }

    load() {
        if (this.loki)
            throw new Error("Already loading/loaded!");

        return new Promise((resolve, reject) => {
            this.loki = new Loki(this.filename, {
                adapter: new LokiFSStructuredAdapter(),
                autoload: true,
                autoloadCallback: resolve,
                autosave: true,
                autosaveInterval: this.autosaveInterval,
                verbose: this.verbose
            });
        });
    }

    get(name) {
        if (!this.loki)
            throw new Error("Database isn't loaded yet!");

        let collection = this.loki.getCollection(name);
        if (!collection)
            throw new Error("No collection with name '" + name + "' found!");
        return collection;
    }

    add(name, options) {
        if (!this.loki)
            throw new Error("Database isn't loaded yet!");

        let collection = this.loki.getCollection(name);
        if (collection)
            throw new Error("Collection with name '" + name + "' already present!");

        this.loki.addCollection(name, options);
    }
}

module.exports = DatabaseManager;