const VK = require("vk-io");

class Listener {

    constructor(handler, options) {
        this.handler = handler;

        this.port = options.port || 8000;
        this.tls = options.tls || false;

        this.api = new VK.VK({
            token: options.accessToken,
            webhookSecret: options.secretKey,
            webhookConfirmation: options.confirmationCode,
            webhookPath: "/",
            apiMode: "parallel_selected"
        });
    }

    start() {
        if (this.started)
            throw new Error("Listener already started!");

        this.api.updates.use(async (context, next) => {
            this.handler(context);
            await next();
        });

        this.started = true;
        return this.api.updates.startWebhook({
            port: this.port,
            tls: this.tls
        });
    }
}

module.exports = Listener;