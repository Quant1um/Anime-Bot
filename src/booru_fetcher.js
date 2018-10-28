const Booru = require("booru");

const RatingPrefix = "rating:";
const RatingRegexp = /^rating:.+/;
const TagTokenRegexp = /\s+/;

/**
 * Throws error if variable is falsy
 * @param {any} variable Variable to check
 * @param {string} message Error message
 */
const assert = (variable, message) => {
    if (!variable) {
        throw new Error(message);
    }
};

/**
 * Class that used to fetch images from booru
 */
class BooruFetcher {

    /**
     * Constructs new booru fetcher
     * @param {object} options Options
     * @param {string} options.booru Booru name
     * @param {string?} [options.rating] Default rating
     * @param {boolean} [options.ratingOverride] Can default rating be overridden by tags?
     */
    constructor({ booru, rating = null, ratingOverride = false }) {
        assert(booru, "Cannot create booru fetcher: no booru is supplied!");

        this.booru = booru;
        this.rating = rating;
        this.ratingOverride = ratingOverride;
    }

    /**
     * @private
     * Split input into array of tags
     * @param {string} tagString String of tags
     * @returns {string[]} Tags
     */
    detokenizeTags(tagString) {
        return (tagString || "").trim().split(TagTokenRegexp) || [];
    }

    /**
     * @private
     * Processes tags: adds default rating, checks for rating overrides, etc...
     * @param {string[] | string} tags Tags
     * @returns {string[]} Processed tags
     */
    processTags(tags) {
        if (typeof tags === "string") {
            tags = this.detokenizeTags(tags);
        }

        if (!this.rating) {
            return tags;
        }

        let wasOverridden = false;
        tags.forEach((tag, index, array) => {
            if (tag.match(RatingRegexp)) {
                if (!this.ratingOverride) {
                    array.splice(index, 1);
                } else {
                    wasOverridden = true;
                }
            }
        });

        if (!wasOverridden) {
            tags.push(RatingPrefix + this.rating);
        }

        return tags;
    }

    /**
     * Fetches images from booru
     * @param {string[]} tags Tag query
     * @param {number} limit Maximum amount of images to fetch
     * @returns {Promise} Promise
     */
    fetch(tags = [], limit = 1) {
        return Booru.search(this.booru, this.processTags(tags), { limit, random: true }).then((result) => {
            if (result instanceof Error) {
                throw result;
            }

            return result;
        });
    }
}

module.exports = BooruFetcher;