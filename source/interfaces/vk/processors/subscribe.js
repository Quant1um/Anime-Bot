const Processor = require("./../../processor");

module.exports = class SubscribeProcessor extends Processor{

    process(context) {
        context.send(context.getMessage().getText() || "no text");
    }
};