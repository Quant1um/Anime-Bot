const Utils = require("#utils/utils");
const Processor = require("#interfaces/processor");
const Debug = require("#utils/debug");

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
        Debug.log("interface", "Processor has been bound for event of type \"{0}\".", event);
    }

    handle(event, context) {
        if (!Utils.isValid(event))
            throw new Error("Invalid event!");
        else if (!Utils.isValid(context))
            throw new Error("Invalid context!");
        else if (!Utils.isValid(this.processors[event])) {
            if (!this.missing_processors[event]) {
                Debug.warn("interface", "Event processor for event \"{0}\" is missing! Event of that type will be ignored.", event);
                this.missing_processors[event] = true;
            }
        } else
            this.processors[event].process(context);
    }
};
