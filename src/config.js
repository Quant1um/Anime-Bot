const Util = require("util");
const _ = require("lodash");
const readFile = Util.promisify(require("fs").readFile);

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
 * Class used for retrieving configuration from file 
 */
class ConfigLoader {
    constructor(path, { encoding = "utf8" }) {
        assert(path, "Cannot create config loader: no path is supplied!");

        this.path = path;
        this.encoding = encoding;
    }

    load() {
        return readFile(this.path, this.encoding)
            .catch((err) => {
                if (err.code === "ENOENT") {
                    throw new Error("File '" + this.path + "' does not exist!");
                }

                throw err;
            })
            .then((content) => {
                let data = JSON.parse(content);
                if (typeof data !== "object") {
                    throw new Error("Parsed config must be a JSON object!");
                }

                return data;
            });
    }
}

/**
 * Class used for managing bot configuration
 */
class Config {

    /**
     * Constructs new config
     * @param {string} path Config file path
     * @param {object} options Options
     * @param {string} [options.encoding] Config file encoding
     */
    constructor(path, { encoding = "utf8" }) {
        this.loader = new ConfigLoader(path, { encoding });
    }

    /**
     * @private
     * Is config loaded?
     */
    get loaded() {
        return Boolean(this.data);
    }

    /**
     * Loads config from file
     * @returns {Promise} Promise
     */
    load() {
        return this.loader.load()
            .then((data) => this.data = data);
    }

    /**
     * Retrieves config property
     * Note: if property in config file is prepended with '#' symbol, then associated env variable will be returned.
     * @param {string} path Path to property
     * @param {any} def Default value
     * @returns {any} Config property
     */
    get(path, def) {
        if (!this.loaded) {
            throw new Error("Config isn't loaded yet!");
        }

        let result = _.get(this.data, path, def);
        if (typeof result === "string" && result[0] === "#") {
            return process.env[result.substr(1)];
        }
        return result;
    }
}

module.exports = Config;