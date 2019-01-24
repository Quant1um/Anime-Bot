const VK = require("vk-io");
const assert = require("./utils/assert");
const type = require("./utils/type");

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
        assert(type(handler, Function), "Cannot create listener: invalid handler type (expected function)!");
        assert(type(port, Number), "Cannot create listener: invalid port type (expected number)!");
        assert(type(port, Boolean), "Cannot create listener: invalid TLS type (expected boolean)!");
        assert(type(path, String), "Cannot create listener: invalid path type (expected string)!");
        assert(type(accessToken, String), "Cannot create listener: invalid access token type (expected string)!");
        assert(type(secretKey, String), "Cannot create listener: invalid secret key type (expected string)!");
        assert(type(confirmationCode, String), "Cannot create listener: invalid confirmation code type (expected string)!");
        
        assert(port > 0 && port <= 65535, "Cannot create listener: port must be positive and be lower than or equal 65535!");
        
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
