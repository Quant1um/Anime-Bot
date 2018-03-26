const Loadable          = require("./loadable");
const ReferenceResolver = require("#utils/reference_resolver");

const HASH_LITERAL_REGEXP = /\\#/gi;
const TAG = "config";

//TODO: improve resolving
class Config extends Loadable {

    load() {
        super.load();
        this.resolver = new Resolver(null, this.parsed_data);
    }

    resolve(name) {
        if (!defined(this.resolver))
            throw new Error("Call load() first!");
        return this.resolver.resolve(name);
    }

    get(name, entry) {
        if (!defined(this.resolver))
            throw new Error("Call load() first!");
        return this.resolver.get(name, entry);
   }
}

class Resolver {

    constructor(name, root) {
        this.name = name;
        this.resolver = new ReferenceResolver(root);
    }

    get(name, entry) {
        if (typeof name !== "string")
            throw new Error("Argument error: string expected as first argument!");

        entry = Entry.interpret(entry);
        return entry.parse(this.resolver.get(name), Resolver.createRejector(Resolver.concatNames(this.name, name)));
    }

    resolve(name) {
        return new Resolver(Resolver.concatNames(this.name, name), this.resolver.get(name));
    }

    static createRejector(name) {
        return function (message) {
            if (typeof message === "undefined")
                throw new Error("Failed to parse " + name + "!");
            else
                throw new Error("Failed to parse " + name + ": " + message + "!");
        };
    }

    static concatNames(root, name) {
        if (defined(root))
            return root + "." + name;
        return name;
    }
}

class Entry {

    parse(object, reject) {
        throw new Error("Not implemented!");
    }

    static interpret(value) {
        if (value instanceof Entry)
            return value;

        switch (Utils.type(value)) {
            case "string": return new ValueEntry(value);
            case "object": return new NestedEntry(value);
            case "array": return new ArrayEntry(value[0]);
            case "null": return new ValueEntry();
            case "undefined": throw new Error("Entry is undefined!");
            default: throw new Error("Do not know how to interpret " + value + " as entry!");
        }
    }
}

class ValueEntry extends Entry {

    constructor(type, def, nullable) {
        super();
        this.type = type;
        this.default = def;
        this.nullable = nullable || false;
    }

    parse(object, reject) {
        if (!defined(object)) {
            if (defined(this.default))
                return this.default;
            else if (nullable)
                return null;
            return reject("undefined");
        }

        if (typeof object === "string") {
            if (object.startsWith("#")) {
                let id = object.substr(1);
                let penv = process.env[id];

                if (!defined(penv)) {
                    Debug.warn(TAG, "process.env.{0} is undefined! Using default...", id);
                    if (defined(this.default))
                        return this.default;
                    return reject("undefined");
                }

                if (defined(this.type))
                    penv = Utils.convert(this.type, penv);
                return penv;
            }

            object = object.replace(HASH_LITERAL_REGEXP, "#");
        }

        if (defined(this.type) && this.type !== Utils.type(object))
            return reject("invalid type (received: " + Utils.type(object) + ", expected: " + this.type + ")");
        return object;
    }
}

class NestedEntry extends Entry {

    constructor(entries) {
        super();
        let result = {};
        for (let key in entries)
            result[key] = Entry.interpret(entries[key]);
        this.entries = result;
    }

    parse(object, reject) {
        if (!defined(object))
            return reject("undefined");

        if (typeof object !== "object")
            return reject("object expected");

        var result = {};
        for (let name in this.entries)
            result[name] = this.entries[name].parse(object[name], reject);
        return result;
    }
}

class ArrayEntry extends Entry {

    constructor(entry) {
        super();
        this.entry = Entry.interpret(entry);
    }

    parse(object, reject) {
        if (!defined(object))
            return reject("undefined");

        if (!Array.isArray(object))
            return reject("array expected");

        var result = [];
        for (let name in object)
            result.push(this.entry.parse(object[name], reject));
        return result;
    }
}

class MapEntry extends Entry {

    constructor(entry) {
        super();
        this.entry = Entry.interpret(entry);
    }

    parse(object, reject) {
        if (!defined(object))
            return reject("undefined");

        if (typeof object !== "object")
            return reject("object expected");

        var result = {};
        for (let name in object)
            result[name] = this.entry.parse(object[name], reject);
        return result;
    }
}

module.exports = new Config("config.json", "utf8");
module.exports.Class = Config;

module.exports.Resolver = Resolver;
module.exports.Entry = Entry;
module.exports.ValueEntry = ValueEntry;
module.exports.NestedEntry = NestedEntry;
module.exports.ArrayEntry = ArrayEntry;
module.exports.MapEntry = MapEntry;