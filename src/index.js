const BooruFetcher = require("./booru_fetcher");
const EventBridge = require("./event_bridge");
const Config = require("./config");
const Listener = require("./listener");

let config = new Config("config.json", "utf8");
let booru = new BooruFetcher(config.get("booru"));
let eventBridge = new EventBridge();
let listener = new Listener((context) => eventBridge.pushEvent([context.type, ...context.subTypes], context), {
    accessToken: config.get("vk.accessToken"),
    secretKey: config.get("vk.secretKey"),
    confirmationCode: config.get("vk.confirmationCode"),
    port: config.get("connection.port"),
    tls: config.get("connection.tls")
});

eventBridge.addHandler("text", (context) => {
    function handleError(err) {
        console.error(err);
        context.reply("Internal error was occurred:\n" + err.toString());
    }

    context.setActivity();

    let tags = context.text.trim().split(/\s+/) || [];
    booru.fetch(tags).then((images) => {
        if (images instanceof Error) {
            handleError(images);
        } else {
            if (images.length) {
                for (let image of images)
                    context.sendPhoto(image.common.file_url);
            } else {
                context.reply("No images by requested tags are found!");
            }
        }
    }).catch(handleError);
});

listener.start();

 eventBridge.pushEvent("text", {
    hasText: true,
    text: "maid",

    setActivity: function () {
        console.log("setActivity()");
    },
    reply: function (message) {
        console.log("reply(" + message + ")");
    },
    sendPhoto: function (photo) {
        console.log("sendPhoto(" + photo + ")");
    }
}); 