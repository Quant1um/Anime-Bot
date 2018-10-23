const BooruFetcher = require("./booru_fetcher");
const EventBridge = require("./event_bridge");
const Config = require("./config");
const Listener = require("./listener");

let config = new Config("config.json", "utf8");
let booru = new BooruFetcher(config.get("booru"));
let eventBridge = new EventBridge();
let listener = new Listener((...args) => eventBridge.pushEvent([context.type, ...context.subTypes], ...args), {
    accessToken: config.get("vk.accessToken"),
    secretKey: config.get("vk.secretKey"),
    confirmationCode: config.get("vk.confirmationCode"),
    port: config.get("connection.port"),
    tls: config.get("connection.tls")
});

eventBridge.addHandler(["message"], (context) => {
    function handleError(err) {
        if (err.name === "BooruError") {
            context.reply("Error was occurred:\n" + err.message);
        } else {
            console.error(err);
            context.reply("Internal error was occurred:\n" + err.toString());
        }
    }

    if (context.hasText) {
        context.setActivity();

        let tags = context.text.trim().split(/\s+/) || [];
        booru.fetch(tags).then((images) => {
            if (images instanceof Error) {
                handleError(images);
            } else {
                for (let image of images)
                    context.sendPhoto(image.common.file_url);
            }
        }).catch(handleError);
    }
});

listener.start();

/* test code
 * eventBridge.pushEvent("message", {
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
}); */