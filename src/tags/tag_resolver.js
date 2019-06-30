const { TagInfo } = require("./tag_info");

const _ = require("lodash");
const Booru = require("booru");
const RequestContext = require("./request_context");

const argcheck = require("../utils/argcheck");

class TagResolvingError extends Error {
    constructor(errorCode, context) {
        argcheck({ errorCode, context }, {
            errorCode: argcheck.is(String),
            context: argcheck.maybe(
                argcheck.is(Object)
            )
        });
        
        super("Tag resolving error: [" + errorCode + "]");
        this.errorCode = errorCode;
        this.context = context ? context : {};
    }
}

const checkValidBooru = (val) => {
    if (Booru.resolveSite(val.toLowerCase()) === null) {
        throw new Error("not a valid booru");
    }
};

class TagResolver {

    constructor({
        defaultBooru,
        batchSize = 5,
        tokenRegex = /\s+/,
        filters = []
    }) {
        argcheck({ defaultBooru, batchSize, tokenRegex, filters }, {
            defaultBooru: argcheck.every(
                argcheck.is(String),
                checkValidBooru
            ),
            batchSize: argcheck.every(
                argcheck.is(Number),
                argcheck.integer(),
                argcheck.between(2, 10)
            ),
            tokenRegex: argcheck.any(
                argcheck.is(String),
                argcheck.is(RegExp)
            ),
            filters: argcheck.values(
                argcheck.is(Function)
            )
        });

        this.defaultBooru = defaultBooru.toLowerCase();
        this.tokenRegex = typeof tokenRegex === "string" ? new RegExp(tokenRegex) : tokenRegex;
        this.batchSize = batchSize;
        this.filters = filters;
    }
    
    tokenize(string) {
        return (string || "").trim().split(this.tokenRegex).filter((str) => str) || [];
    }

    parse(tags) {
        return tags.map((tag) => {
            let tagInfo = TagInfo.parse(tag);
            let error = tagInfo.validate();
            if (error) {
                throw new TagResolvingError(error, { tag });
            }
            return tagInfo;
        });
    }

    filter(ctx) {
        for (let filter of this.filters) {
            filter(ctx);
        }

        return ctx;
    }

    resolve(tags, batch = false, entries = 0) {
        return new Promise((resolve) => {
            if (!Array.isArray(tags)) {
                tags = this.tokenize(tags);
            }
            
            tags = this.parse(tags);

            let pagesize = batch ? this.batchSize : 1;
            let page = Math.floor(entries / pagesize);
            
            let booru = this.defaultBooru;
            let ctx = new RequestContext({
                tags, booru, page,
                count: pagesize
            });
            
            ctx = this.filter(ctx);

            ctx.tags.forEach((tagInfo) => {
                let error = tagInfo.validate();
                if (error) {
                    throw new Error(`Malformed tag: ${tagInfo.toString()} [${error}]`);
                }
            });

            resolve(ctx);
        });
    }
}

module.exports = TagResolver;
module.exports.Error = TagResolvingError;