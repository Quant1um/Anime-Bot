const Filesystem = require("fs");
const Utils = require("./../utils");

const CONFIG_ENTRIES = {
	port: process.env.PORT || 8000
};

module.exports = class Config {

    constructor(filename, encoding) {
        this.filename = filename;
        this.encoding = encoding || "utf8";
        this.load();
    }

    load() {
        var content = Filesystem.readFileSync(this.filename, this.encoding);
        var parsedConfig = JSON.parse(content);
        if (typeof parsedConfig !== "object")
            throw new Error("Config is not an object!");
        this.parsedConfig = parsedConfig;

        Config.traverse({
            input: this.parsedConfig,
            entries: CONFIG_ENTRIES,
            object: this
        });
    }

    put(name, entrySet) {
        var object = Config.traverse({
            input: this.parsedConfig,
            entries: entrySet
        });
        Object.defineProperty(this, name, { get: () => object });
        return object;
    }

    static traverse(options) {
        var name = options.name;
        var object = options.object || {};
        var entries = options.entries;
        var input = options.input;

        Object.keys(entries).forEach((entry) => {
            let entryDebugName = entry;
            if (Utils.isValid(name))
                entryDebugName = name + "." + entryDebugName;

            let value = null;
            let entryValue = entries[entry];

            if (typeof entryValue === "function")
                value = entryValue(object[entry]);
            else if (Utils.isValid(entryValue) &&
                     typeof entryValue === "object" &&
                     Utils.isValid(input[entry]))
                value = Config.traverse({
                    name: entryDebugName,
                    object: {},
                    input: input[entry],
                    entries: entryValue
                });
            else
                value = input[entry] ||
                    process.env[entry] ||
                    entryValue;

            if (!Utils.isValid(value))
                console.warn(`Config entry "${entryDebugName}" is not defined!`);
            else if (Utils.isValid(entryValue) && typeof value !== typeof entryValue)
                console.warn(`Config entry type mismatch: ${entryDebugName} has type ${typeof value}. Expected: ${typeof entryValue}!`);
            else
                Object.defineProperty(object, entry, { get: () => value });
        });

        return object;
    }
};