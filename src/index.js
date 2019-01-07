const Keyboard = require("vk-io").Keyboard;

const EventEmitter = require("events").EventEmitter;
const BooruFetcher = require("./booru_fetcher");
const Config = require("./config");
const Listener = require("./listener");

let config, booru, eventBus, listener;

//process.env.ACCESS_TOKEN = "a";
//process.env.SECRET_KEY = "a";
//process.env.CONFIRMATION_CODE = "a";

Promise.resolve()
    .then(() => config = new Config("config.json", { encoding: "utf8" })) //instantiate config
    .then(() => config.load()) //load config
    .then(() => { //instantiate modules
        booru = new BooruFetcher({
            booru: config.get("booru.site"),
            rating: config.get("booru.rating"),
            ratingOverride: config.get("booru.ratingOverride")
        });
        eventBus = new EventEmitter();
        listener = new Listener((context) => [context.type, ...context.subTypes].forEach((event) => eventBus.emit(event, context)), {
            accessToken: config.get("vk.accessToken"),
            secretKey: config.get("listening.secretKey"),
            confirmationCode: config.get("listening.confirmationCode"),
            port: config.get("listening.port"),
            tls: config.get("listening.tls"),
            path: config.get("listening.path")
        });
    })
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
            if (count > 5) count = 5;

            booru.fetch(tags, count)
                .then((images) => Array.from(images).map((image) => image.common.file_url))
                .then((images) => {
                    console.log(images);
                    if (images.length) {
                        context.sendPhoto(images, {
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

        eventBus.on("text", (context) => {
            context.setActivity();

            let payload = context.messagePayload;
            let tags, count;
            if (payload) {
                tags = payload.tags;
                count = payload.count;
            } else {
                tags = context.text;
            }

            sendBooruImages(context, tags, count);
        });
    })
    .then(() => listener.start()) //start listener
    .then(() => console.log("Bot started up successfully!"))
    /*.then(() => { //test code
        eventBus.emit("text", {
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
    })*/
    .catch((error) => { //exception handler
        console.error(error);
        process.exit(-1);
    });




