const VK = require("vk-io");

class Listener {

    constructor(handler, { port = 8000, tls = false, accessToken, secretKey, confirmationCode }) {
        this.handler = handler;

        this.port = port;
        this.tls = tls;

        this.api = new VK.VK({
            token: accessToken,
            webhookSecret: secretKey,
            webhookConfirmation: confirmationCode,
            webhookPath: "/",
            apiMode: "parallel_selected"
        });
    }

    start() {
        if (this.started) {
            throw new Error("Listener already started!");
        }

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