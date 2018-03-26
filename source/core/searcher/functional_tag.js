module.exports = class FunctionalTag {

    resolveConfig(resolver) { }

    load() { }
    unload() { }

    handle(context, text /*...args*/) {
        throw new Error("Not implemented!");
    }
};