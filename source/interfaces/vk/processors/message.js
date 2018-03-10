const Processor = require("#interfaces/processor");
const Utils = require("#utils");
const Debug = require("#debug");

module.exports = class MessageProcessor extends Processor {

    process(context) {
        context.setActivity();

        global.booru.search(context.getText())
            .then((images) => {
                for (let image of images)
                    context.sendPhoto(image.common.file_url);
            })
            .catch((err) => {
                Debug.error("booru search", err.stack || err.message || err);
                context.send("Error while searching images from booru: " + err.message);
            });
    }
};