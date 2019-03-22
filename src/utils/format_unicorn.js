const _ = require("lodash");

//https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
const formatUnicorn = (str, ...data) => {
    if (data.length) {
        let type = typeof data[0];
        let args = type !== "object" ? Array.prototype.slice.call(data) : data[0];
        _.forOwn(args, (value, key) => {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), value);
        });
    }

    return str;
};

module.exports = formatUnicorn;