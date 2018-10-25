const Booru = require("booru");

class BooruFetcher {

    constructor(defaultBooru) {
        this.defaultBooru = defaultBooru;
    }

    fetch(tags = [], limit = 1, booru = this.defaultBooru) {
        return Booru.search(booru, tags, { limit, random: true }).then((result) => {
            if (result instanceof Error) {
                throw result;
            }

            return result;
        });
    }
}

module.exports = BooruFetcher;