const Booru = require("booru");
const Utils = require("#utils/utils");
const Debug = require("#utils/debug");
const Dictionary = require("#utils/dictionary");

module.exports = class BooruSearch {

    constructor(options) {
        this.separators = options.separators || [" "];
        this.default_tags = options.default_tags || [];
        this.default_booru = options.default_booru;

        this.functional_tags = new Dictionary(options.functional_tags);
        this.functional_aliases = new Dictionary(options.functional_aliases);
        this.aliases = new Dictionary(options.aliases);
    }

    search(query) {
        var tags = [];
        if (Utils.isValid(query) && query.length)
            tags = Utils.splitString(query, this.separators);
        tags = tags.concat(this.default_tags);

        for (let i = 0; i < tags.length; i++)
            tags[i] = this.aliases.get(tags[i]) || tags[i];

        var state = {
            booru: this.default_booru,
            tags: tags,
            limit: 1,
            random: true
        };

        return Booru.search(state.booru, state.tags, { limit: state.limit, random: state.random })
            .then((images) => {
                if (images.length) return images;
                else throw new Error("No images found!");
            })
            .then(Booru.commonfy);
    }
};