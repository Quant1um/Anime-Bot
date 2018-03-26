const VK = require("vk-io");
const EventBridge = require("./events/event_bridge");

const TAG = "listener";

class Listener {

    constructor(handle) {
        if (typeof handle !== "function")
            throw new Error("Handler expected to be a function!");
        this.handle = handle;
    }

    resolveConfig(resolver) {
        this.access_token = resolver.get("access_token", "string");
        this.secret_key = resolver.get("secret_key", "string");
        this.confirmation_code = resolver.get("confirmation_code", "string");
        this.port = resolver.get("port", "number");
        this.use_ssl = resolver.get("use_ssl", "boolean");
    }

    load() {
        this.api = new VK.VK({
            token: this.access_token,
            webhookSecret: this.secret_key,
            webhookConfirmation: this.confirmation_code,
            webhookPath: "/",
            apiMode: "parallel_selected"
        });

        this.api.updates.use(async (context, next) => {
            this.handle("event", context);
            await next();
        });

        this.api.updates.startWebhook({
            port: this.port || 8000,
            tls: this.use_ssl || false
        }).catch((err) => {
            Debug.error(TAG, err);
            this.handle("error", err);
        });
    }
}

module.exports = new Listener(EventBridge.handle);
module.exports.Class = Listener;