var Processor = require("./../../processor");

module.exports = class SubsciribeProcessor extends Processor{

    process(context) {
        context.send(context.getMessage().getText() || "no text");
    }
};