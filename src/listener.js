const VK = require("vk-io");

class Listener {

    constructor(handler, { port = 8000, tls = false, path = "/", accessToken, secretKey, confirmationCode }) {
        if (!handler) throw new Error("Internal error: cannot create listener: no handler is supplied!");

        if (!accessToken) throw new Error("Cannot create listener: no access token is supplied!");
        if (!secretKey) throw new Error("Cannot create listener: no secret key is supplied!");
        if (!confirmationCode) throw new Error("Cannot create listener: no confirmation code is supplied!");

        this.handler = handler;

        this.port = port;
        this.tls = tls;

        this.api = new VK.VK({
            token: accessToken,
            webhookSecret: secretKey,
            webhookConfirmation: confirmationCode,
            webhookPath: path,
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