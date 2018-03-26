module.exports = class Debug {

    static log(tag, data) {
        console.log(Debug.prepareString(tag, data, Array.prototype.slice.call(arguments, 2)));
    }

    static warn(tag, data) {
        console.warn(Debug.prepareString(tag, data, Array.prototype.slice.call(arguments, 2)));
    }

    static error(tag, data) {
        console.error(Debug.prepareString(tag, data, Array.prototype.slice.call(arguments, 2)));
    }

    static prepareString(tag, data, format_args) {
        var result = "";
        if (defined(tag))
            result += "[" + tag.toUpperCase() + "] ";
        if (typeof data === "string")
            result += Utils.format(data, format_args);
        else if (data.stack)
            result += data.stack;
        else
            result += data;

        return result;
    }
};