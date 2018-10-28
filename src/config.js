const Util = require("util");
const _ = require("lodash");
const readFile = Util.promisify(require("fs").readFile);

class ConfigLoader {
    constructor(path, { encoding = "utf8" }) {
        if (!path) throw new Error("Cannot create config loader: no path is supplied!");

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

class Config {

    constructor(path, { encoding = "utf8" }) {
        this.loader = new ConfigLoader(path, { encoding });
    }

    get loaded() {
        return Boolean(this.data);
    }

    load() {
        return this.loader.load()
            .then((data) => this.data = data);
    }
    
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