const Config = require("#core/config/config");

class CommandHandler {

    constructor() {
        this.commands = [];
    }

    resolveConfig(resolver) {
        /*this.prefix = resolver.get("prefix", new Config.ValueEntry("string", null, true));
        var commands = resolver.get("list", new Config.ArrayEntry(
            {
                "location": "string",
                "aliases": new Config.ArrayEntry("string")
            }
        ));*/
    }
}

module.exports = new CommandHandler();
module.exports.Class = CommandHandler;

