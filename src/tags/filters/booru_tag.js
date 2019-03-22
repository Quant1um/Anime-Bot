const { TagType } = require("../tag_info");
const TagResolvingError = require("../tag_resolver").Error;
const Booru = require("booru");

const argcheck = require("../../utils/argcheck");

const checkValidBooru = (val) => {
    if (Booru.resolveSite(val.toLowerCase()) === null) {
        throw new Error("not a valid booru");
    }
};

class BooruTagFilter {

    constructor({ tags, blacklist = {} }) {
        argcheck({ tags, blacklist }, {
            tags: argcheck.values(
                argcheck.is(String)
            ),

            blacklist: argcheck.values(
                argcheck.every(
                    argcheck.is(String),
                    checkValidBooru
                )
            )
        });

        this.tags = new Set(tags.map((str) => str.toLowerCase()));
        this.blacklist = new Set(blacklist.map((str) => str.toLowerCase()));
    }

    filter(context) {
        let count = 0;
        context.tags = context.tags.filter((tag) => {
            if (tag.type === TagType.Meta && this.tags.has(tag.key)) {
                let value = tag.value;
                if (++count > 1) {
                    throw new TagResolvingError("filter.booru.multipleTags");
                }

                if (Booru.resolveSite(value) === null) {
                    throw new TagResolvingError("filter.booru.doesntExist", { value });
                }

                if (this.blacklist.has(value)) {
                    throw new TagResolvingError("filters.booru.blacklisted", { value });
                }

                context.booru = value;
                return false;
            }

            return true;
        });
    }
}

module.exports = BooruTagFilter;