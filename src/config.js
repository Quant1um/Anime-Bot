const Filesystem = require("fs");
const _ = require("lodash");

class Config {

    constructor(path, encoding) {
        this.path = path;
        this.encoding = encoding || "utf8";

        this.load();
    }

    load() {
        if (!Filesystem.existsSync(this.path)) {
            throw new Error("File '" + this.path + "' does not exist!");
        }

        let content = Filesystem.readFileSync(this.path, this.encoding);
        let data = JSON.parse(content);
        if (typeof data !== "object") {
            throw new Error("Parsed config must be a JSON object!");
        }
        this.data = data;
    }

    get(path) {
        if (!this.data) {
            throw new Error("Config isn't loaded!");
        }

        let result = _.get(this.data, path);
        if (typeof result === "string" && result[0] === "#") {
            return process.env[result.substr(1)];
        }
        return result;
    }
}

module.exports = Config;