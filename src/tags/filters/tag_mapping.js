const { TagBody } = require("../tag_info");
const _ = require("lodash");

const argcheck = require("../../utils/argcheck");

const checkTagBody = (val) => {
    let error = val.validate();
    if (error) {
        throw new Error(error);
    }
};

class TagMappingFilter {

    constructor({ mappings = {} }) {
        argcheck({ mappings }, {
            mappings: argcheck.every(
                argcheck.is(Object),
                argcheck.values(
                    argcheck.is(String)
                )
            )
        });

        let lmappings = {};
        _.forOwn(mappings, (value, key) => lmappings[key.toLowerCase()] = TagBody.parse(value));
        mappings = lmappings;

        argcheck({ mappings }, {
            mappings: argcheck.values(
                checkTagBody
            )
        });

        this.mappings = new Map(Object.entries(mappings));
    }

    filter(context) {
        context.tags.forEach((tag) => {
            let body = tag.body.toString();
            if (this.mappings.has(body)) {
                tag.body = this.mappings.get(body).clone();
            }
        });
    }
}

module.exports = TagMappingFilter;