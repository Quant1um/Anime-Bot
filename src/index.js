const BooruFetcher = require("./booru_fetcher");
const EventBridge = require("./event_bridge");
const Config = require("./config");
const Listener = require("./listener");
const DatabaseManager = require("./database");

let config = new Config("config.json", "utf8");
let database = new DatabaseManager({
    filename: config.get("database.filename"),
    autosaveInterval: config.get("database.autosaveInterval"),
    verbose: config.get("database.verbose")
});
let booru = new BooruFetcher(config.get("booru"));
let eventBridge = new EventBridge();
let listener = new Listener((context) => eventBridge.pushEvent([context.type, ...context.subTypes], context), {
    accessToken: config.get("vk.accessToken"),
    secretKey: config.get("vk.secretKey"),
    confirmationCode: config.get("vk.confirmationCode"),
    port: config.get("connection.port"),
    tls: config.get("connection.tls")
});

Promise.resolve()
    .then(database.load()) // load database
    .then(() => { // bot logic
        function handleError(context, err) {
            console.error(err);
            context.reply("Internal error was occurred:\n" + err.toString());
        }

        eventBridge.addHandler("text", (context) => {
            context.setActivity();

            let tags = context.text.trim().split(/\s+/) || [];
            booru.fetch(tags).then((images) => {
                if (images instanceof Error) {
                    handleError(context, images);
                } else {
                    if (images.length) {
                        context.sendPhoto(images.map((image) => image.common.file_url));
                    } else {
                        context.reply("No images are found!");
                    }
                }
            }).catch((error) => handleError(context, error));
        });
    })
    .then(listener.start()) // start listener
    .then(() => console.log("Bot started up successfully!"))
    /*.then(() => { //test code
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
    })*/
    .catch((error) => {
        console.error(error);
        throw error;
    });




