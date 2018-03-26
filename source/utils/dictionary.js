module.exports = class Dictionary {

    constructor(table) {
        this.static = {};
        this.dynamic = [];
        this.missing_cache = {};

        if (defined(table))
            this.add(table);
    }

    add(table) {
        table = Utils.invert(table);
        for (let key in table) {
            let value = table[key];

            let regexp = Dictionary.createRegexp(key);
            if (defined(regexp)) {
                this.dynamic.push({
                    regexp: regexp,
                    value: value
                });
            } else {
                if (defined(this.static[key]))
                    throw new Error("Already in table!");
                this.static[key] = value;
            }
        }

        this.missing_cache = {};
    }

    get(key) {
        if (!defined(key) || this.missing_cache[key])
            return null;

        let static_value = this.static[key];
        if (defined(static_value))
            return static_value;

        for (let dyn of this.dynamic) {
            var args = dyn.regexp.exec(key);
            if (defined(args) && args.length > 0)
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