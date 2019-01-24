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
const ImageLoader = require("./image_loader");
const TagResolver = require("./tags/tag_resolver");
const Listener = getListenerClass();

let config, eventBus, listener, imgLoader, tagResolver;

Promise.resolve()
    .then(() => config = new Config("config.json", { encoding: "utf8" })) //instantiate config
    .then(() => config.load()) //load config
    .then(() => { //instantiate modules
        eventBus = new EventEmitter();
        listener = new Listener((context) => [context.type, ...context.subTypes].forEach((event) => eventBus.emit(event, context)), {
            accessToken: config.get("vk.accessToken"),
            secretKey: config.get("listening.secretKey"),
            confirmationCode: config.get("listening.confirmationCode"),
            port: config.get("listening.port"),
            tls: config.get("listening.tls"),
            path: config.get("listening.path")
        });

        imgLoader = new ImageLoader({
            maxWidth: config.get("image.maxWidth"),
            maxHeight: config.get("image.maxHeight"),
            quality: config.get("image.quality")
        });

        tagResolver = new TagResolver({
            defaultBooru: config.get("booru.default"),
            defaultRating: config.get("booru.defaultRating"),
            allowRatingOverride: config.get("booru.allowRatingOverride"),
            allowBooruOverride: config.get("booru.allowBooruOverride"),
            batchSize: config.get("booru.batchSize"),
            tokenRegex: config.get("booru.tokenSplitRegex"),
            mappings: config.get("booru.mappings")
        });
    })
    .then(() => { // bot logic
        let messageNoImages = config.get("text.noImages", "text.noImages"); 
        let messageError = config.get("text.errors.generic", "text.errors.generic");
        let buttonMore = config.get("text.buttons.more", "text.buttons.more");
        let buttonBatch = config.get("text.buttons.batch", "text.buttons.batch");
        let tagResolveMessages = [];
        tagResolveMessages[TagResolver.ErrorCodes.BooruDuplicationError] = config.get("text.errors.booruTagDuplication", "text.errors.booruTagDuplication");
        tagResolveMessages[TagResolver.ErrorCodes.BooruInvalidError] = config.get("text.errors.booruInvalid", "text.errors.booruInvalid");
        tagResolveMessages[TagResolver.ErrorCodes.BooruBlacklistedError] = config.get("text.errors.booruBlacklisted", "text.errors.booruBlacklisted");
        tagResolveMessages[TagResolver.ErrorCodes.RatingInvalidError] = config.get("text.errors.ratingInvalid", "text.errors.ratingInvalid");
        tagResolveMessages[TagResolver.ErrorCodes.RatingDuplicationError] = config.get("text.errors.ratingTagDuplication", "text.errors.ratingTagDuplication");

        function buildKeyboard(tags) {
            return Keyboard.keyboard([[
                Keyboard.textButton({
                    label: buttonMore,
                    payload: { tags, batch: false },
                    color: Keyboard.PRIMARY_COLOR
                }),
                Keyboard.textButton({
                    label: buttonBatch,
                    payload: { tags, batch: true },
                    color: Keyboard.DEFAULT_COLOR
                })
            ]]);
        }

        function loadImages(images) {
            return images.map((image) => imgLoader.load(image));            
        }

        function uploadImages(context, images) {
            return images.map((image) => 
                context.vk.upload.messagePhoto({
                    peer_id: context.senderId,
                    source: image
                }).catch(() => null));
        }

        function filterImages(images) {
            return images.filter((image) => image !== null);
        }

        function processImages(context, images) {
            return Promise.all(loadImages(images)) //load each image into buffer (and resize it)
                .then(filterImages) //filter failed ones
                .then((images) => Promise.all(uploadImages(context, images))) //upload each onto vk server
                .then(filterImages); //filter failed ones, again
        }
        
        function sendBooruImages(context, tags = [], batch = false) {
            tagResolver.resolve(tags, batch)
                .then((rctx) => BooruFetcher.fetch(rctx))
                .then((images) => Array.from(images).map((image) => image.common.file_url))
                .then((images) => processImages(context, images))
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
                    if (error instanceof TagResolver.Error) {
                        context.reply(tagResolveMessages[error.errorCode]);
                    } else {
                        console.error(error);
                        context.reply(messageError);
                    }
                });
        }

        eventBus.on("text", (context) => {
            context.setActivity();

            let payload = context.messagePayload;
            let tags, batch;
            if (payload) {
                tags = payload.tags;
                batch = payload.batch;
            } else {
                tags = context.text;
            }

            sendBooruImages(context, tags, batch);
        });
    })
    .then(() => listener.start()) //start listener
    .then(() => console.log("Bot started up successfully!"))
    .catch((error) => { //exception handler
        console.error(error);
        process.exit(-1);
    });




