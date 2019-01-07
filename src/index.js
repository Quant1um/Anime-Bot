const getListenerClass = () => {
    try {
        let t = require("./local_test");
        console.log("Test listener has been loaded!");
        return t;
    } catch(e) {
        return require("./listener");
    }
};

const Keyboard = require("vk-io").Keyboard;

const EventEmitter = require("events").EventEmitter;
const BooruFetcher = require("./booru_fetcher");
const Config = require("./config");
const Listener = getListenerClass();

let config, booru, eventBus, listener;

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

        function uploadImages(context, images) {
            return Promise.all(images.map((image) =>
                context.vk.upload.messagePhoto({
                    peer_id: context.senderId,
                    source: image
                }).catch(() => null)
            )).then(images => images.filter((image) => image !== null));
        }

        function sendBooruImages(context, tags = [], count = 1) {
            if (count > 5) count = 5;

            booru.fetch(tags, count)
                .then((images) => Array.from(images).map((image) => image.common.file_url))
                .then((images) => uploadImages(context, images))
                .then((images) => {
                    if (images.length) {
                        context.send({
                            attachment: images,
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
    .catch((error) => { //exception handler
        console.error(error);
        process.exit(-1);
    });




