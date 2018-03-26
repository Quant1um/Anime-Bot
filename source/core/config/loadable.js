const Filesystem = require("fs");

module.exports = class Loadable {

    constructor(filename, encoding) {
        this.filename = filename;
        this.encoding = encoding || "utf8";
    }

    get path() {
        return Utils.resolvePath(this.filename);
    }

    load() {
        if (typeof this.filename !== "string")
            throw new Error("File path is not a string: " + this.filename);

        if (typeof this.encoding !== "string")
            throw new Error("Encoding is not a string: " + this.encoding);

        if (!Filesystem.existsSync(this.path))
            throw new Error("File at path " + this.path + " does not exist!");

        var content = Filesystem.readFileSync(this.path, this.encoding);
        var parsed_data = JSON.parse(content);
        if (typeof parsed_data !== "object")
            throw new Error("Parsed data is not an object!");
        this.parsed_data = parsed_data;
    }
};