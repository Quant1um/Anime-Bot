const Booru = require("booru");

/**
 * Class that used to fetch images from booru
 */
class BooruFetcher {
    
    static fetch(context) {
        return Booru.search(context.booru, context.tags, { limit: context.count, random: context.random }).then((result) => {
            if (result instanceof Error) {
                throw result;
            }

            return result;
        });
    }
}

module.exports = BooruFetcher;