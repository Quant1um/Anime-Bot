const Processor = require("#interfaces/processor");
const Utils = require("#utils/utils");
const Debug = require("#utils/debug");

module.exports = class MessageProcessor extends Processor {

    process(context) {
        context.setActivity();

        global.main.booru.search(context.getText())
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