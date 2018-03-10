const Utils = require("#utils");

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
        return "[" + tag.toUpperCase() + "] " + Utils.format(string, format_args);
    }
};