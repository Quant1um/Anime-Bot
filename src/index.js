const getListenerClass = () => {
    try {
        let t = require("./local_test");
        console.log("Test listener has been loaded!");
        return t;
    } catch(e) {
        return require("./listener");
    }
};

const { Keyboard } = require("vk-io");
const { EventEmitter } = require("events");

const Config                = require("./config");
const ImageLoader           = require("./image_loader");
const BooruFetcher          = require("./booru_fetcher");
const L10n                  = require("./l10n");
const TagResolver           = require("./tags/tag_resolver");
const FilterLoader          = require("./tags/filter_loader");
const Listener              = getListenerClass();

let config, eventBus, listener, imageLoader, tagResolver, l10n;

Promise.resolve()
    .then(() => config = new Config("config.json", { encoding: "utf8", validation: { directory: "src/schemas", base: "base.json" } })) //instantiate config
    .then(() => config.load()) //load config
    .then(() => { //instantiate modules
        eventBus = new EventEmitter();
        listener = new Listener((context) => [context.type, ...context.subTypes].forEach((event) => eventBus.emit(event, context)), {
            accessToken:        config.get("vk.accessToken"),
            secretKey:          config.get("listening.secretKey"),
            confirmationCode:   config.get("listening.confirmationCode"),
            port:               config.get("listening.port"),
            tls:                config.get("listening.tls"),
            path:               config.get("listening.path")
        });

        imageLoader = new ImageLoader({
            maxWidth:           config.get("image.maxWidth"),
            maxHeight:          config.get("image.maxHeight"),
            quality:            config.get("image.quality")
        });

        tagResolver = new TagResolver({
            defaultBooru:       config.get("booru.default"),
            batchSize:          config.get("booru.batchSize"),
            tokenRegex:         config.get("booru.tokenSplitRegex"),
            filters:            FilterLoader.load(
                                    config.get("booru.filters.directory"),
                                    config.get("booru.filters.list"),
                                    config.get("booru.filters.priority")
                                )
        });

        l10n = new L10n(config.get("text"));
    })
    .then(() => { // bot logic
        function buildKeyboard(tags) {
            return Keyboard.keyboard([[
                Keyboard.textButton({
                    label: l10n.get("buttons.more"),
                    payload: { tags, batch: false },
                    color: Keyboard.PRIMARY_COLOR
                }),
                Keyboard.textButton({
                    label: l10n.get("buttons.batch"),
                    payload: { tags, batch: true },
                    color: Keyboard.DEFAULT_COLOR
                })
            ]]);
        }

        function loadImages(images) {
            return images.map((image) => imageLoader.load(image));            
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
                .then((images) => Array.from(images))
                .then((images) => images.map((image) => image.file_url))
                .then((images) => processImages(context, images))
                .then((images) => {
                    if (images.length) {
                        context.send({
                            attachment: images,
                            keyboard: buildKeyboard(tags)
                        });
                    } else {
                        context.reply(l10n.get("noImages"));
                    }
                }).catch((error) => {
                    if (error instanceof TagResolver.Error) {
                        context.reply(l10n.format(error.context, "errors", error.errorCode));
                    } else {
                        console.error(error);
                        context.reply(l10n.get("errors.generic"));
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
                batch = false;
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




