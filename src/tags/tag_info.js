const _ = require("lodash");

const argcheck = require("../utils/argcheck");

const TagType = Object.freeze({
    Unknown:    null,
    General:    "general",
    Artist:     "artist",
    Character:  "character",
    Copyright:  "copyright",
    Meta:       "meta"
});

const validTypes = new Set([
    TagType.Unknown,
    TagType.General,
    TagType.Artist,
    TagType.Character,
    TagType.Copyright,
    TagType.Meta
]);

const checkValidType = (val) => {
    if (!validTypes.has(val)) {
        throw new Error("not a valid tag type");
    }
};

const tagPrefixes = {
    [TagType.General]:      "general",
    [TagType.Artist]:       "artist",
    [TagType.Character]:    "character",
    [TagType.Copyright]:    "copyright"
};

const possibleTagPrefixes = {
    "general":      TagType.General,
    "gen":          TagType.General,
    "g":            TagType.General,
    "artist":       TagType.Artist,
    "art":          TagType.Artist,
    "a":            TagType.Artist,
    "character":    TagType.Character,
    "char":         TagType.Character,
    "ch":           TagType.Character,
    "copyright":    TagType.Copyright,
    "copy":         TagType.Copyright,
    "cp":           TagType.Copyright
};

const ErrorCode = Object.freeze({
    None:                   null,
    EmptyTag:               "tag.empty",
    EmptyKey:               "tag.keyEmpty",
    CombinationExclusion:   "tag.notOr",
    FuzzyMetatag:           "tag.metaFuzzy"
});

class TagModifiers {

    constructor(modifiers) {
        argcheck({ modifiers }, {
            modifiers: argcheck.is(Set)
        });

        this.modifiers = modifiers;
    }

    has(modName) {
        return this.modifiers.has(modName.toLowerCase());
    }

    add(modName) {
        this.modifiers.add(modName.toLowerCase());
        return this;
    }

    remove(modName) {
        this.modifiers.remove(modName.toLowerCase());
        return this;
    }

    set(modName, value) {
        if (value) {
            return this.add(modName);
        } else {
            return this.remove(modName);
        }
    }

    clone() {
        return new TagModifiers(new Set(this.modifiers));
    }

    static empty() {
        return new TagModifiers(new Set());
    }

    static from(...tags) {
        return new TagModifiers(new Set(tags));
    }

    static fromObject(obj) {
        let set = new Set();
        _.forOwn(obj, (value, key) => {
            if (value) {
                set.add(key);
            }
        });

        return new TagModifiers(set);
    }
}

class TagBody {

    constructor(tagType, key, value) {
        this.type = tagType;
        this.key = key;
        this.value = value;
    }

    get content() {
        if (this.key !== null) return this.key + ":" + this.value;
        return this.value;
    }

    set content(content) {
        argcheck({ content }, {
            content: argcheck.is(String)
        });

        let colonIdx = content.indexOf(":");
        if (colonIdx < 0) {
            this.key = null;
            this.value = content;
        } else {
            this.key = content.substring(0, colonIdx);
            this.value = content.substring(colonIdx + 1, content.length);
        }
    }

    get key() {
        return this.__key;
    }

    set key(key) {
        argcheck({ key }, {
            key: argcheck.maybe(
                argcheck.is(String)
            )
        });

        this.__key = key === null ? null : key.toLowerCase();
    }

    get value() {
        return this.__value;
    }

    set value(value) {
        argcheck({ value }, {
            value: argcheck.is(String)
        });

        this.__value = value.toLowerCase();
    }

    get type() {
        return this.__type;
    }

    set type(type) {
        argcheck({ type }, {
            type: checkValidType
        });
        this.__type = type;
    }

    validate() {
        if (this.content === "") {
            return ErrorCode.EmptyTag;
        }

        if (this.type === TagType.Meta && (this.key === null || this.key === "")) {
            return ErrorCode.EmptyKey;
        }

        if (this.value === "") {
            return ErrorCode.EmptyTag;
        }

        return ErrorCode.None;
    }

    clone() {
        return new TagBody(this.type, this.key, this.value);
    }

    toString() {
        let result = "";

        let prefix = tagPrefixes[this.type];
        if (prefix) {
            result += prefix + ":";
        }

        result += this.content;

        return result;
    }

    static parse(body) {
        let colonIdx = body.indexOf(":");

        if (colonIdx < 0) {
            return new TagBody(TagType.Unknown, null, body);
        } else {
            let key = body.substring(0, colonIdx).toLowerCase();
            let value = body.substring(colonIdx + 1, body.length);

            let ptype = possibleTagPrefixes[key];
            if (ptype) {
                return new TagBody(ptype, null, value);
            } else {
                return new TagBody(TagType.Meta, key, value);
            }
        }
    }

    static general(value) {
        return new TagBody(TagType.General, null, value);
    }

    static artist(value) {
        return new TagBody(TagType.Artist, null, value);
    }

    static character(value) {
        return new TagBody(TagType.Character, null, value);
    }

    static copyright(value) {
        return new TagBody(TagType.Copyright, null, value);
    }

    static meta(key, value) {
        return new TagBody(TagType.Meta, key, value);
    }
}

class TagInfo {
    constructor(body, modifiers) {
        this.body = body;
        this.modifiers = modifiers;
    }

    get type() {
        return this.body.type;
    }

    set type(type) {
        this.body.type = type;
    }

    get body() {
        return this.__body;
    }

    set body(body) {
        argcheck({ body }, {
            body: argcheck.is(TagBody)
        });

        this.__body = body;
    }

    get key() {
        return this.body.key;
    }

    set key(key) {
        this.body.key = key;
    }

    get value() {
        return this.body.value;
    }

    set value(value) {
        this.body.value = value;
    }

    get content() {
        return this.body.content;
    }

    set content(content) {
        this.body.content = content;
    }

    get modifiers() {
        return this.__modifiers;
    }

    set modifiers(mods) {
        argcheck({ mods }, {
            mods: argcheck.maybe(
                argcheck.is(TagModifiers)
            )
        });

        this.__modifiers = mods ? mods : TagModifiers.empty();
    }

    get isExcluded() {
        return this.modifiers.has("excluded");
    }

    set isExcluded(val) {
        return this.modifiers.set("excluded", val);
    }

    get isCombined() {
        return this.modifiers.has("combined");
    }

    set isCombined(val) {
        return this.modifiers.set("combined", val);
    }

    get isFuzzy() {
        return this.modifiers.has("fuzzy");
    }

    set isFuzzy(val) {
        return this.modifiers.set("fuzzy", val);
    }

    validate() {
        let bval = this.body.validate();
        if (bval) {
            return bval;
        }

        if (this.isExcluded && this.isCombined) {
            return ErrorCode.CombinationExclusion;
        }

        if (this.type === TagType.Meta && this.isFuzzy) {
            return ErrorCode.FuzzyMetatag;
        }
    }

    toString() {
        let result = "";

        if (this.isExcluded) {
            result += "-";
        } else if (this.isCombined) {
            result += "~";
        }

        result += this.body.toString();

        if (this.isFuzzy) {
            result += "~";
        }

        return result;
    }

    clone() {
        return new TagInfo(this.body.clone(), this.modifiers.clone());
    }

    static parse(tag) {
        let fuzzy = false;
        let combined = false;
        let excluded = false;

        let startMod = 0;
        for (let i = 0; i < tag.length; i++) {
            if (tag[i] === "-") {
                startMod++;
                excluded = true;
            } else if (tag[i] === "~") {
                startMod++;
                combined = true;
            } else {
                break;
            }
        }

        let endMod = 0;
        for (let i = tag.length - 1; i >= 0; i--) {
            if (tag[i] === "~") {
                endMod++;
                fuzzy = true;
            } else {
                break;
            }
        }

        let body = tag.substring(startMod, tag.length - endMod);
        return new TagInfo(TagBody.parse(body), TagModifiers.fromObject({ fuzzy, combined, excluded }));
    }

    static create(body) {
        return new TagInfo(body);
    }
}

module.exports = {};
module.exports.TagBody = TagBody;
module.exports.TagInfo = TagInfo;
module.exports.TagModifiers = TagModifiers;
module.exports.TagType = TagType;
module.exports.ErrorCode = ErrorCode;