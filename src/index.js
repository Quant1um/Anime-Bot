const Keyboard = require("vk-io").Keyboard;

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
    .then(() => { // bot logic
        let messageNoImages = config.get("text.noImages", "text.noImages"); 
        let messageError = config.get("text.error", "text.error");
        let buttonMore = config.get("text.buttons.more", "text.buttons.more");
        let buttonBatch = config.get("text.buttons.batch", "text.buttons.batch");

        function buildKeyboard(tags) {
            return Keyboard.keyboard([[
                Keyboard.textButton({
                    label: buttonMore,
                    payload: { tags },
                    color: Keyboard.PRIMARY_COLOR
                }),
                Keyboard.textButton({
                    label: buttonBatch,
                    payload: { tags, count: 5 },
                    color: Keyboard.DEFAULT_COLOR
                })
            ]]);
        }

        function sendBooruImages(context, tags = [], count = 1) {
            booru.fetch(tags, count).then((images) => {
                if (images.length) {
                    context.sendPhoto(Array.from(images).map((image) => image.common.file_url), {
                        keyboard: buildKeyboard(tags)
                    });
                } else {
                    context.reply(messageNoImages);
                }
            }).catch((error) => {
                console.error(error);
                context.reply(messageError);
            });
        } 

        eventBridge.addHandler("text", (context) => {
            context.setActivity();

            let payload = context.messagePayload;
            let tags, count;
            if (payload) {
                tags = payload.tags;
                count = payload.count;
            } else {
                tags = context.text.trim().split(/\s+/);
            }
 
            sendBooruImages(context, tags, count);
        });
    })
    .then(listener.start()) // start listener
    .then(() => console.log("Bot started up successfully!"))
    .then(() => { //test code
        eventBridge.pushEvent("text", {
            text: "maid",

            setActivity: function () {
                console.log("setActivity()");
            },
            reply: function (message) {
                console.log("reply(" + message + ")");
            },
            sendPhoto: function (photo) {
                console.log("sendPhoto(" + photo + ")");
            },
            send: function (data) {
                console.log("send(" + data + ")");
            }
        });
    })
    .catch((error) => {
        console.error(error);
        throw error;
    });




