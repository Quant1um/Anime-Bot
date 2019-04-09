const VK = require("vk-io");

const argcheck = require("./utils/argcheck");

/**
 * Class used for listening webhook updates
 */
class Listener {
    /**
    * Listener callback
    * @callback Listener~handler
    * @param {VK.Context} responseCode
    */

    /**
     * Constructs new listener
     * @param {Listener~handler} handler Listener callback
     * @param {object} options Options
     * @param {number} [options.port] Port where listening server will listen
     * @param {boolean} [options.tls] Enable TLS?
     * @param {string} [options.path] Path where listening server will be deployed
     * @param {string} options.accessToken VK OAuth access token
     * @param {string} options.secretKey Webhook secret key
     * @param {string} options.confirmationCode Webhook confirmation code
     */
    constructor(handler, { port = 8000, tls = false, path = "/", accessToken, secretKey, confirmationCode }) {
        argcheck({ handler }, {
            handler: argcheck.is(Function)
        });

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

    /**
     * Starts listening
     * @returns {Promise} Promise
     */
    start() {
        if (this.started) {
            throw new Error("Listener already started!");
        }

        this.api.updates.use(async (context, next) => {
            this.handler(context);
            [context.type, ...context.subTypes].forEach((a) => console.log(a));
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
