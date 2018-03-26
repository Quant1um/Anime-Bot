const Config = require("#core/config/config");

class EventBridge {

    constructor() {
        this.handlers = {};
        this.handlers_list = [];
    }

    resolveConfig(resolver) {
        var handlers = resolver.get("list", new Config.ArrayEntry(
            {
                "location": "string",
                "events": new Config.ArrayEntry("string"),
                "parameters": new Config.ValueEntry("object", {})
            }
        ));

        for (let i = 0; i < handlers.length; i++) {
            let handler = handlers[i];
            let instance = require(Utils.resolvePath(handler.location));

            this.handlers_list.push(instance);
            for (let event of handler.events) {
                this.handlers[event] = this.handlers[event] || [];
                this.handlers[event].push(handler);
            }

            //TODO
            instance.resolveConfig(new Config.Resolver(Config.Resolver.concatNames(resolver.name, i + ".parameters"), handler.parameters));
        }
    }

    load() {
        for (let handler of this.handlers_list)
            if (handler.load) handler.load();
    }

    unload() {
        for (let handler of this.handlers_list)
            if(handler.unload) handler.unload();
    }

    handle(event, /*...args*/) {

    }
}

module.exports = new EventBridge();
module.exports.Class = EventBridge;