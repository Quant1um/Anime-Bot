const Booru = require("booru");

const RatingPrefix = "rating:";
const RatingRegexp = /^rating:.+/;
const TagTokenRegexp = /\s+/;

class BooruFetcher {

    constructor({ booru, rating = null, ratingOverride = false }) {
        this.booru = booru;
        this.rating = rating;
        this.ratingOverride = ratingOverride;
    }

    detokenizeTags(tagString) {
        return (tagString || "").trim().split(TagTokenRegexp) || [];
    }

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

        console.log(tags);
        return tags;
    }

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