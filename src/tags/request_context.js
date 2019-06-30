const { TagInfo } = require("./tag_info");
const Booru = require("booru");

const argcheck = require("../utils/argcheck");

const checkValidBooru = (val) => {
    if (Booru.resolveSite(val.toLowerCase()) === null) {
        throw new Error("not a valid booru");
    }
};

class RequestContext {

    constructor({ tags, booru, count = 1, page = 0, random = false }) {
        this.tags = tags;
        this.booru = booru;
        this.count = count;
        this.page = page;
        this.random = random;
    }

    get tags() {
        return this.__tags;
    }

    set tags(tags) {
        argcheck({ tags }, {
            tags: argcheck.values(
                argcheck.is(TagInfo)
            )
        });
        
        this.__tags = tags;
    }

    get booru() {
        return this.__booru;
    }

    set booru(booru) {
        argcheck({ booru }, {
            booru: argcheck.every(
                argcheck.is(String),
                checkValidBooru
            )
        });

        this.__booru = booru;
    }

    get count() {
        return this.__count;
    }

    set count(count) {
        argcheck({ count }, {
            count: argcheck.every(
                argcheck.is(Number),
                argcheck.integer(),
                argcheck.finite(),
                argcheck.between(1, 10)
            )
        });

        this.__count = count;
    }

    get page() {
        return this.__page;
    }

    set page(page) {
        argcheck({ page }, {
            page: argcheck.every(
                argcheck.is(Number),
                argcheck.integer(),
                argcheck.finite(),
                argcheck.between(0, +Infinity)
            )
        });

        this.__page = page;
    }

    get random() {
        return this.__random;
    }

    set random(random) {
        argcheck({ random }, {
            random: argcheck.is(Boolean)
        });

        this.__random = random;
    }
}

module.exports = RequestContext;