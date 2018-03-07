var Processor = require("./../../processor");

module.exports = class MessageProcessor extends Processor {

    process(context) {
        context.setActivity();
        context.sendPhoto("https://static.zerochan.net/Hatsune.Miku.full.1259644.jpg"); //test image
    }
};