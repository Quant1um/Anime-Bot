const { TagType, TagInfo, TagBody, TagModifiers } = require("../tag_info");
const TagResolvingError = require("../tag_resolver").Error;

const argcheck = require("../../utils/argcheck");

const allRatings = ["safe", "questionable", "explicit", null];
const validRatings = new Map(Object.entries({
    safe:           "safe",
    s:              "safe",
    questionable:   "questionable",
    q:              "questionable",
    explicit:       "explicit",
    e:              "explicit",
    any:            null,
    ["*"]:          null
}));

const isRatingValid = (rating) => validRatings.has(rating);
const normalizeRating = (rating) => validRatings.get(rating);

const checkValidRating = (val) => {
    if (!isRatingValid(val)) {
        throw new Error("not a valid rating");
    }
};

class RatingTagFilter {

    constructor({ allowedRatings = allRatings, defaultRating = "*", overridable = true }) {
        argcheck({ allowedRatings, defaultRating, overridable }, {
            allowedRatings: argcheck.values(
                argcheck.every(
                    argcheck.is(String),
                    checkValidRating
                )
            ),
            defaultRating: argcheck.every(
                argcheck.is(String),
                checkValidRating
            ),
            overridable: argcheck.is(Boolean)
        });

        this.default = normalizeRating(defaultRating);
        this.allowedRatings = new Set(allowedRatings.map(normalizeRating));
        this.overridable = overridable;
    }

    filter(context) {
        const ratingTag = "rating";

        let modifiers = TagModifiers.empty();
        let chosenRating = this.default;
        let count = 0;
        context.tags = context.tags.filter((tag) => {
            if (tag.type === TagType.Meta && tag.key === ratingTag) {
                let value = tag.value;

                if (!this.overridable) {
                    throw new TagResolvingError("filters.rating.notOverridable");
                }

                if (++count > 1) {
                    throw new TagResolvingError("filters.rating.multipleTags");
                }

                if (!isRatingValid(value)) {
                    throw new TagResolvingError("filters.rating.invalidRating", { value });
                }

                value = normalizeRating(value);
                if (!this.allowedRatings.has(value)) {
                    throw new TagResolvingError("filters.rating.notAllowedRating", { value });
                }

                chosenRating = value;
                modifiers = tag.modifiers;
                return false;
            }

            return true;
        });

        if (chosenRating) {
            context.tags.push(new TagInfo(TagBody.meta(ratingTag, chosenRating), modifiers));
        }
    }
}

module.exports = RatingTagFilter;