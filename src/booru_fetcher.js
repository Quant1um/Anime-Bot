const Booru = require("booru");

class BooruFetcher {

    constructor(defaultBooru) {
        this.defaultBooru = defaultBooru;
    }

    fetch(tags, limit, booru) {
        booru = booru || this.defaultBooru;
        limit = limit || 1;
        
        return Booru.search(booru, tags, { limit, random: true }).then((result) => {
            if (result instanceof Error) {
                throw result;
            }

            return result;
        });
    }
}

module.exports = BooruFetcher;