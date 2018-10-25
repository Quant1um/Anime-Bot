const BooruFetcher = require("./booru_fetcher");
const EventBridge = require("./event_bridge");
const Config = require("./config");
const Listener = require("./listener");
const DatabaseManager = require("./database");

let config = new Config("config.json", "utf8");
let booru = new BooruFetcher(config.get("booru"));
let eventBridge = new EventBridge();
let listener = new Listener((context) => eventBridge.pushEvent([context.type, ...context.subTypes], context), {
    accessToken: config.get("vk.accessToken"),
    secretKey: config.get("listening.secretKey"),
    confirmationCode: config.get("listening.confirmationCode"),
    port: config.get("listening.port"),
    tls: config.get("listening.tls")
});
let database = new DatabaseManager({
    filename: config.get("database.filename"),
    autosaveInterval: config.get("database.autosaveInterval"),
    verbose: config.get("database.verbose")
});

Promise.resolve()
    .then(database.load()) // load database
    .then(() => { //database bindings
        database.add("userdata", {
            unique: ["id"],
            autoupdate: true
        });
    })
    .then(() => { // bot logic
        let messageNoImages = config.get("messages.noImages", "messages.noImages"); 
        let messageError = config.get("messages.error", "messages.error");

        function sendBooruImages(context, tags, count) {
            context.setActivity();
            booru.fetch(tags).then((images) => {
                if (images.length) {
                    context.sendPhoto(Array.from(images).map((image) => image.common.file_url));
                } else {
                    context.reply(messageNoImages);
                }
            }).catch((error) => {
                console.error(error);
                context.reply(messageError);
            });
        }

        eventBridge.addHandler("text", (context) => sendBooruImages(context, context.text.trim().split(/\s+/) || [], 1));
    })
    .then(listener.start()) // start listener
    .then(() => console.log("Bot started up successfully!"))
    .then(() => { //test code
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
    })
    .catch((error) => {
        console.error(error);
        throw error;
    });




