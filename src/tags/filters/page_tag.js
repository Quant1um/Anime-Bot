const { TagType } = require("../tag_info");
const TagResolvingError = require("../tag_resolver").Error;

const argcheck = require("../../utils/argcheck");

const isPositiveInteger = (str) => {
    let n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n > 0;
};

class PageTagFilter {

    constructor({ tags }) {
        argcheck({ tags }, {
            tags: argcheck.values(
                argcheck.is(String)
            )
        });

        this.tags = new Set(tags.map((str) => str.toLowerCase()));
    }

    filter(context) {
        let count = 0;
        context.tags = context.tags.filter((tag) => {
            if (tag.type === TagType.Meta && this.tags.has(tag.key)) {
                let value = tag.value;
                if (++count > 1) {
                    throw new TagResolvingError("filters.page.multipleTags");
                }

                if (!isPositiveInteger(value)) {
                    throw new TagResolvingError("filters.page.invalidPage", { value });
                }
                
                context.page = Number(value) - 1;
                return false;
            }

            return true;
        });
    }
}

module.exports = PageTagFilter;