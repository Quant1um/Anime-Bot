var Utils = require("./../utils");
var Processor = require("./processor");

module.exports = class Interface {

    constructor() {
        this.processors = {};
        this.missing_processors = {};
    }

    startup(config) {
        throw new Error("Not implemented!");
    }

    unload(config) {
        throw new Error("Not implemented!");
    }

    addProcessor(event, processor) {
        if (processor instanceof Processor)
            this.processors[event] = processor;
        else if (typeof processor === "function")
            this.processors[event] = new processor();
        else
            throw new Error("Undefined processor!");
        console.log("Processor bound for event of type \"" + event + "\".");
    }

    handle(event, context) {
        if (!Utils.isValid(event))
            throw new Error("Invalid event!");
        else if (!Utils.isValid(context))
            throw new Error("Invalid context!");
        else if (!Utils.isValid(this.processors[event])) {
            if (!this.missing_processors[event]) {
                console.warn("Event processor for event " + event + " is missing! Event of that type will be ignored.");
                this.missing_processors[event] = true;
            }
        } else
            this.processors[event].process(context);
    }
};
