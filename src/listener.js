const VK = require("vk-io");

/**
 * Throws error if variable is falsy
 * @param {any} variable Variable to check
 * @param {string} message Error message
 */
const assert = (variable, message) => {
    if (!variable) {
        throw new Error(message);
    }
};

/**
 * Class used for listening webhook updates
 */
class Listener {

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
        assert(handler, "Cannot create listener: no handler is supplied!");
        assert(accessToken, "Cannot create listener: no access token is supplied!");
        assert(secretKey, "Cannot create listener: no secret key is supplied!");
        assert(confirmationCode, "Cannot create listener: no confirmation code is supplied!");

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

/**
* Listener callback
* @callback Listener~handler
* @param {VK.Context} responseCode
*/
