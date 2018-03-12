const Utils = require("#utils/utils");

module.exports = class Dictionary {

    constructor(table) {
        this.static = {};
        this.dynamic = [];
        this.missing_cache = {};

        if (Utils.isValid(table))
            this.add(table);
    }

    add(table) {
        table = Utils.invert(table);
        for (let key in table) {
            let value = table[key];

            let regexp = Dictionary.createRegexp(key);
            if (Utils.isValid(regexp)) {
                this.dynamic.push({
                    regexp: regexp,
                    value: value
                });
            } else {
                if (Utils.isValid(this.static[key]))
                    throw new Error("Already in table!");
                this.static[key] = value;
            }
        }

        this.missing_cache = {};
    }

    get(key) {
        if (!Utils.isValid(key) || this.missing_cache[key])
            return null;

        let static_value = this.static[key];
        if (Utils.isValid(static_value))
            return static_value;

        for (let dyn of this.dynamic) {
            var args = dyn.regexp.exec(key);
            if (Utils.isValid(args) && args.length > 0)
                return Utils.format(dyn.value, args.slice(1));
        }

        this.missing_cache[key] = true;
        return null;
    }

    static createRegexp(string) {
        if (typeof string !== "string")
            return null;
        if (!string.startsWith("/"))
            return null;

        var lidx = string.lastIndexOf("/");
        if (lidx <= 0)
            return null;

        return new RegExp(string.substr(1, lidx - 1),
            string.substr(lidx + 1, string.length - lidx - 1));
    }
};