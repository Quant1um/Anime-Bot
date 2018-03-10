const Booru = require("booru");
const Utils = require("#utils");
const Debug = require("#debug");

module.exports = class BooruSearch {

    constructor(options) {
        this.separators = options.separators || [" "];
        this.default_tags = options.default_tags || [];
        this.default_booru = options.default_booru;

        this.aliases = Utils.invert(options.aliases);
        this.aliases_regexp = Utils.invert(options.aliases_regexp);
        this.functional_tags = Utils.invert(options.functional_tags);
    }

    search(query) {
        var tags = [];
        if (query.length)
            tags = Utils.splitString(query, this.separators);
        tags = tags.concat(this.default_tags);

        for (let i = 0; i < tags.length; i++) {
            let tag = tags[i];
            if (Utils.isValid(this.aliases[tag]))
                tags[i] = this.aliases[tag];
            else {
                for (let source in this.aliases_regexp) {
                    let destination = this.aliases_regexp[source];
                    let transformed = Utils.transform(source, destination, tag);
                    if (Utils.isValid(transformed)) {
                        tags[i] = transformed;
                        break;
                    }
                }
            }
        }

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