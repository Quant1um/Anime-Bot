const Processor = require("./../../processor");
const Booru = require("booru");
const Utils = require("./../../../utils");

module.exports = class MessageProcessor extends Processor {

    process(context) {
        context.setActivity();

        var tags = [];
        if (context.hasText())
            tags = Utils.splitString(context.getText(), [" ", ",", ";", "|"]);
            
        Booru.search("yandere", tags, { limit: 1, random: true })
            .then(booru.commonfy)
            .then(images => {
                for (let image of images)
                    context.sendPhoto(image.common.file_url);
            })
            .catch(err => {
                console.log(err.message);
                context.send("Error while searching images from booru: " + err.message);
            });
    }
};