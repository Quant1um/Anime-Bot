const Booru = require("booru");
const _ = require("lodash");
const RequestContext = require("./request_context");

const assert = require("../utils/assert");
const type = require("../utils/type");

const RatingPrefix = "rating:";
const RatingRegexp = /^-?rating:(.+)$/i;

const BooruTagRegexp = /^(booru|from|source):(.+)$/i;

const BooruDuplicationError = "booruTagDuplication";
const BooruInvalidError = "booruInvalid";
const BooruBlacklistedError = "booruBlacklisted";
const RatingDuplicationError = "ratingTagDuplication";
const RatingInvalidError = "ratingInvalid";

const validRatings = {
    e: true,
    q: true,
    s: true,
    explicit: true,
    questionable: true,
    safe: true
};

const checkRating = (rating) => validRatings.hasOwnProperty(rating);

class TagResolvingError extends Error {
    constructor(errCode) {
        super("Tag resolving error: " + errCode);
        this.errorCode = errCode;
    }
}

class TagResolver {

    constructor({
        defaultBooru,
        batchSize = 5,
        tokenRegex = /\s+/,
        defaultRating = null,
        allowRatingOverride = true,
        allowBooruOverride = true,
        mappings = {},
        booruBlacklist = []
    }) {
        assert(type(defaultBooru, String), "Failed to create tag resolver: invalid default booru type (expected string)!");
        assert(type(batchSize, Number), "Failed to create tag resolver: invalid batch size type (expected number)!");
        assert(type(tokenRegex, String, RegExp), "Failed to create tag resolver: invalid token split regexp type (expected string or regexp)!");
        assert(type(defaultRating, String, null), "Failed to create tag resolver: invalid default rating type (expected string or null)!");
        assert(type(allowRatingOverride, Boolean), "Failed to create tag resolver: invalid rating override allowance type (expected boolean)!");
        assert(type(allowBooruOverride, Boolean), "Failed to create tag resolver: invalid booru override allowance type (expected boolean)!");
        assert(type(mappings, Object), "Failed to create tag resolver: invalid mappings type (expected object)!");
        assert(type(booruBlacklist, Array), "Failed to create tag resolver: invalid booru blacklist type (expected array)!");

        assert(Booru.resolveSite(defaultBooru) !== null, "Failed to create tag resolver: given default booru doesn't exists!");
        assert(batchSize >= 2 && batchSize <= 10, "Failed to create tag resolver: batch size must be in range of [2, 10]");
        assert(checkRating(defaultRating), "Failed to create tag resolver: default rating is invalid!");

        this.defaultBooru = defaultBooru;
        this.defaultRating = defaultRating;
        this.allowRatingOverride = allowRatingOverride;
        this.allowBooruOverride = allowBooruOverride;
        this.tokenRegex = typeof tokenRegex === "string" ? new RegExp(tokenRegex) : tokenRegex;
        this.batchSize = batchSize;
        this.mappings = this.fixMappings(mappings);
        this.booruBlacklist = this.fixBlacklist(booruBlacklist);
    }
    
    tokenize(string) {
        return (string || "").trim().split(this.tokenRegex).filter((str) => str) || [];
    }
    
    resolveCase(tags) {
        return tags.map((str) => str.toLowerCase());
    }

    resolveMappings(tags) {
        let result = [];
        tags.forEach((value) => {
            let mapped = this.mappings[value];
            if (mapped) {
                result.push(...mapped);
            } else {
                result.push(value);
            }
        });
        
        return result;
    }

    resolveRating(tags) {
        let wasOverridden = false;
        tags = tags.filter((tag) => {
            let result = RatingRegexp.exec(tag);
            if (result !== null) {
                if (!this.allowRatingOverride) {
                    return false;
                } else {
                    let rating = result[1];
                    if (!checkRating(rating)) {
                        throw new TagResolvingError(RatingInvalidError);
                    } else if (wasOverridden) {
                        throw new TagResolvingError(RatingDuplicationError);
                    }

                    wasOverridden = true;
                }
            }
            return true;
        });
        
        if (!wasOverridden) {
            tags.push(RatingPrefix + this.defaultRating);
        }

        return tags;
    }
    
    resolveBooru(tags) {
        let override = null;
        tags.filter((tag) => {
            let result = BooruTagRegexp.exec(tag);
            if (result !== null) {
                if (this.allowBooruOverride) {
                    if (!override) {
                        override = result[2].toLowerCase();
                    } else {
                        throw new TagResolvingError(BooruDuplicationError);
                    }
                }
                return false;
            }
            return true;
        });

        if (override) {
            if (this.booruBlacklist[override]) {
                throw new TagResolvingError(BooruBlacklistedError);
            } else if (Booru.resolveSite(override) !== null) {
                return override;
            } else {
                throw new TagResolvingError(BooruInvalidError);
            }
        }

        return this.defaultBooru;
    }

    resolve(tags, batch = false) {
        return new Promise((resolve) => {
            if (!Array.isArray(tags)) {
                tags = this.tokenize(tags);
            }

            tags = this.resolveCase(tags);
            tags = this.resolveMappings(tags);
            tags = this.resolveRating(tags);

            let booru = this.resolveBooru(tags);
            resolve(new RequestContext({
                tags, booru,
                count: batch ? this.batchSize : 1
            }));
        });
    }
    
    fixMappings(mappings) {
        _.forOwn(mappings, (value, index) => {
            if (!Array.isArray(value)) {
                value = this.tokenize(value);
            }

            let newIndex = index.toLowerCase();
            assert(this.tokenize(newIndex).length === 1, "Error: probably one of the mappings' key contains more than 1 tag");
            
            mappings[newIndex] = this.resolveCase(value);
        });
        return mappings;
    }

    fixBlacklist(list) {
        let result = {};
        list.forEach((value) => {
            let newValue = value.toLowerCase();
            assert(Booru.resolveSite(newValue) !== null, "Error: one of blacklisted boorus are not exists!");

            result[newValue] = true;
        });
        
        return result;
    }
}

module.exports = TagResolver;
module.exports.Error = TagResolvingError;
module.exports.ErrorCodes = {
    BooruDuplicationError,
    BooruInvalidError,
    BooruBlacklistedError,
    RatingInvalidError,
    RatingDuplicationError
};