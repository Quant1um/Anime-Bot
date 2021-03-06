﻿const Booru = require("booru");

/**
 * Class that used to fetch images from booru
 */
class BooruFetcher {
    
    static fetch(context) {
        return Booru.search(context.booru, context.tags.map((tag) => tag.toString()), { limit: context.count, random: context.random, page: context.page }).then((result) => {
            if (result instanceof Error) {
                throw result;
            }

            return result;
        });
    }
}

module.exports = BooruFetcher;