const Command = require("#core/commands/command");

module.exports = class ExampleCommand extends Command {

    resolveConfig(resolver) {
        this.flag = resolver.get("flag", "boolean");
        this.nested = resolver.get("nested", {
            "first": "boolean",
            "second": "number",
            "array_of_booleans": ["boolean"]
        });
    }

    load() {
        //do something
    }

    unload() {
        //do something
    }

    handle(context, text) {
        Debug.log("command", "text: {0}, context: {1}, args: {2}", text, context, Array.prototype.slice.apply(arguments, 2));
    }
};