const Config            = require("./config/config");
const Statistics        = require("./config/stats");
const Listener          = require("./listener");
const CommandHandler    = require("./commands/command_handler");
const EventBridge       = require("./events/event_bridge");
const Events            = require("events");

const TAG = "bootstrap";

//holds all modules of the core in order of loading/unloading
const BOOTSTRAPPABLE = [
    {
        instance: Statistics, 
        config: "stats" 
    },

    {
        instance: EventBridge,
        config: "handlers"
    },

    {
        instance: CommandHandler,
        config: "commands"
    },

    {
        instance: Listener,
        config: "listener"
    }
];

class Bootstrap{

    constructor() {
        if ("Bootstrap" in global)
            throw new Error("Bootstrap must have only one instance!");
        Object.defineProperty(global, "Bootstrap", { value: this, writable: false });
    }

    load() {
        Config.load();

        for (let object of BOOTSTRAPPABLE) {
            let instance = object.instance;
            if (defined(object.config) && instance.resolveConfig)
                instance.resolveConfig(Config.resolve(object.config));
        }

        for (let object of BOOTSTRAPPABLE) {
            let instance = object.instance;
            if (instance.load)
                instance.load();
        }

        Debug.log(TAG, "Loaded");
    }

    unload() {
        for (let object of BOOTSTRAPPABLE) {
            let instance = object.instance;
            if (instance.unload)
                instance.unload();
        }

        Debug.log(TAG, "Unloaded");
    }
}

module.exports = new Bootstrap();
module.exports.Class = Bootstrap;