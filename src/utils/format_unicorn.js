//https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
const formatUnicorn = (str, ...data) => {
    if (data.length) {
        let type = typeof data[0];
        let args = type !== "object" ? Array.prototype.slice.call(data) : data[0];
        for (let key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};

module.exports = formatUnicorn;