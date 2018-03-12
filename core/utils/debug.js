const Utils = require("#utils/utils");

module.exports = class Debug {

    static log(tag, string) {
        console.log(Debug.prepareString(tag, string, Array.prototype.slice.call(arguments, 2)));
    }

    static warn(tag, string) {
        console.warn(Debug.prepareString(tag, string, Array.prototype.slice.call(arguments, 2)));
    }

    static error(tag, string) {
        console.error(Debug.prepareString(tag, string, Array.prototype.slice.call(arguments, 2)));
    }

    static prepareString(tag, string, format_args) {
        var result = "";
        if (Utils.isValid(tag))
            result += "[" + tag.toUpperCase() + "] ";
        if (Utils.isValid(string))
            result += Utils.format(string, format_args)
        else
            result += "<INVALID>";
        return result;
    }
};