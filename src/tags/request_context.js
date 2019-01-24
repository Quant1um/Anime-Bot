const assert = require("../utils/assert");
const type = require("../utils/type");

class RequestContext {

    constructor({ tags, booru, count = 1, random = true }) {
        assert(type(tags, Array), "Failed to request context: invalid tags type (array expected)!");
        assert(type(booru, String), "Failed to request context: invalid booru type (string expected)!");
        assert(type(count, Number), "Failed to request context: invalid count type (number expected)!");
        assert(type(random, Boolean), "Failed to request context: invalid random type (boolean expected)!");
        
        this.tags = tags;
        this.booru = booru;
        this.count = count;
        this.random = random;
    }
}

module.exports = RequestContext;