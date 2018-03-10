const Utils = require("#utils");

module.exports = {

    log(tag, string) {
        console.log(this.prepareString(tag, string, Array.prototype.slice.call(arguments, 2)));
    },

    warn(tag, string) {
        console.warn(this.prepareString(tag, string, Array.prototype.slice.call(arguments, 2)));
    },

    error(tag, string) {
        console.error(this.prepareString(tag, string, Array.prototype.slice.call(arguments, 2)));
    },

    prepareString(tag, string, format_args) {
        return "[" + tag.toUpperCase() + "] " + Utils.format(string, format_args);
    }
};