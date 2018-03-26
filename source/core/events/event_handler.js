module.exports = class EventHandler {

    resolveConfig(resolver) { }

    load() { }
    unload() { }

    handle(event /*...args*/) {
        throw new Error("Not implemented!");
    }
};