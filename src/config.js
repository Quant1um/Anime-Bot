const _ = require("lodash");
const Util = require("util");
const Ajv = require("ajv");
const Path = require("path");

const readFile = Util.promisify(require("fs").readFile);
const argcheck = require("./utils/argcheck");

const readJson = (path, encoding) => {
    return readFile(path, encoding)
        .catch((err) => {
            if (err.code === "ENOENT") {
                throw new Error("File '" + path + "' does not exist!");
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
};

/**
 * Class used for retrieving configuration from file 
 */
class ConfigLoader {
    constructor(path, { encoding = "utf8" }) {
        argcheck({ path, encoding }, {
            path: argcheck.is(String),
            encoding: argcheck.is(String)
        });

        this.path = path;
        this.encoding = encoding;
    }
    
    load() {
        return readJson(this.path, this.encoding);
    }
}

class NullValidator {

    validate(data) {
        return data;
    }
}

class SchemaValidator {

    constructor({ directory, base, encoding }) {
        argcheck({ directory, base, encoding }, {
            directory: argcheck.is(String),
            base: argcheck.is(String),
            encoding: argcheck.is(String)
        });

        this.directory = directory;
        this.base = base;
        this.encoding = encoding;

        this.compiler = new Ajv({ loadSchema: (path) => this.loadSchema(path), allErrors: true });
        this.validator = null;
    }

    loadSchema(path) {
        return readJson(Path.join(this.directory, path), this.encoding);
    }

    validate(data) {
        return new Promise((resolve) => {
            if (!this.validator) {
                resolve(this.loadSchema(this.base)
                    .then((schema) => this.compiler.compileAsync(schema))
                    .then((validator) => this.validator = validator));
            } else {
                resolve(this.validator);
            }
        }).then((validator) => {
            if (!validator(data)) {
                throw new Ajv.ValidationError(validator.errors);
            } else {
                return data;
            }
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
    constructor(path, { encoding = "utf8", validation }) {
        this.loader = new ConfigLoader(path, { encoding });

        if (validation === null) {
            this.validator = new NullValidator();
        } else {
            let { directory, base, encoding: valEncoding } = validation;
            this.validator = new SchemaValidator({ directory, base, encoding: valEncoding ? valEncoding : encoding });
        }
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
            .then((data) => Config.remap(data))
            .then((data) => this.validator.validate(data))
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

        return _.get(this.data, path, def);
    }

    static remap(data) {
        _.forOwn(data, (v, k) => {
            if (typeof v === "string" && v[0] === "#") {
                data[k] = process.env[v.substring(1)];
            } else if (typeof v === "object") {
                data[k] = Config.remap(v);
            }
        });
        
        return data;
    }
}

module.exports = Config;