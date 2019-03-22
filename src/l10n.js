const _ = require("lodash");

const formatUnicorn = require("./utils/format_unicorn");

class L10n {

    constructor(data) {
        this.data = data;
    }

    get(...elem) {
        let path = L10n.resolvePath(...elem);
        return _.get(this.data, path, path);
    }

    format(context, ...elem) {
        let path = L10n.resolvePath(...elem);
        return formatUnicorn(_.get(this.data, path, path), context);
    }

    static resolvePath(...elem) {
        return elem
            .map((str) => str.startsWith(".") ? str.substring(1) : str)
            .map((str) => str.endsWith(".") ? str.substring(0, str.length - 1) : str)
            .join(".");
    }
}

module.exports = L10n;