const Filesystem = require("fs");
const Utils = require("#utils/utils");

module.exports = class Loadable {
    constructor(filename, encoding) {
        this.filename = Utils.resolvePath(filename);
        this.encoding = encoding || "utf8";
        this.load();
    }

    load() {
        if (typeof this.filename !== "string")
            throw new Error("File path is not a string: " + this.filename);

        if (typeof this.encoding !== "string")
            throw new Error("Encoding is not a string: " + this.encoding);

        if (!Filesystem.existsSync(this.filename))
            throw new Error("File at path " + this.filename + " does not exist!");

        var content = Filesystem.readFileSync(this.filename, this.encoding);
        var parsed_data = JSON.parse(content);
        if (typeof parsed_data !== "object")
            throw new Error("Parsed data is not an object!");
        this.parsed_data = parsed_data;
    }
};