"use strict";

const Path = require("path");
const FORMAT_ARG_REGEX = /{(\d+)}/g;

module.exports = class Utils {

    /**
     * Like String.prototype.split(string) but accepts array of delimitiers, instead of single delimitiers.
     * Node: Each delimitier must has length of 1, demilimiers that has length different from 1 will be ignored!
     * @param {string} string Splittable string
     * @param {string[]} delimiters Array of delimitiers
     * @returns {string[]} Array of string that splittable one contains and separated using given array of delimitiers.
     */
    static splitString(string, delimiters) {
        if (typeof string !== "string")
            throw new Error("Argument error: first argument expected to be string!");
        if (!Array.isArray(delimiters))
            throw new Error("Argument error: second argument expected to be array!");

        var result = [];
        var temp = "";
        for (let i = 0; i < string.length; i++) {
            let char = string[i];
            if (delimiters.includes(char)) {
                if (temp.length > 0) {
                    result.push(temp);
                    temp = "";
                }
            } else
                temp += char;
        }

        if (temp.length > 0)
            result.push(temp);

        return result;
    }

    /**
     * Transforms object (key -> value) to another object (value -> key).
     * Array values will be threated as multiple values belongs to the same key.
     * Example: 
     * { "one": [1, "first"], "two": [2, "second", true] }
     * will be transformed to
     * { 1: "one", "first": "one", 2: "two", "second": "two", true: "two"}
     * @param {object} input Key -> value pair set
     * @returns {object} Value -> key pair set
     */
    static invert(input) {
        if (typeof input !== "object")
            return {};

        var inverse = {};
        for (let key in input) {
            let obj = input[key];
            if (Array.isArray(obj)) {
                for (let value of obj) {
                    if (defined(inverse[value]))
                        throw new Error("Dublication at value \"" + value + "\" of key \"" + key + "\".");
                    else
                        inverse[value] = key;
                }
            } else if (defined(obj)) {
                if (defined(inverse[obj]))
                    throw new Error("Dublication at value \"" + obj + "\" of key \"" + key + "\".");
                else
                    inverse[obj] = key;
            }
        }

        return inverse;
    }

    /**
     * Formats string: replaces any "{n}" with argument given in args parameter.
     * https://stackoverflow.com/a/4673436
     * @param {string} format Base format string
     * @param {any[] | object} args Arguments that need to insert into format string.
     * @returns {string} Formatted string
     */
    static format(format, args) {
        if (typeof format !== "string")
            throw new Error("Argument error: first argument expected to be string!");

        return format.replace(FORMAT_ARG_REGEX, (match, key) =>
            typeof args[key] !== 'undefined' ? args[key] : match);
    }

    /**
     * Resolves path relative to "source" directory
     * @param {string} path Path, relative to "source" directory
     * @returns {string} Absolute path that refers to same file/direction as given path.
     */
    static resolvePath(path) {
        if (typeof path !== "string")
            throw new Error("Argument error: first argument expected to be string!");

        return Path.resolve(PROJECT_ROOT, path);
    }

    static type(value) {
        if (value === null)
            return "null";
        if (Array.isArray(value))
            return "array";
        return typeof value;
    }

    static convert(type, value) {
        if (!defined(value))
            return null;

        var ctype = Utils.type(value);
        if (type === ctype)
            return value;

        switch (type) {
            case "string": return value.toString();
            case "number": return +value;
            case "boolean": return !!value;
            case "symbol": return Symbol(value);
            case "null": return null;
            case "undefined": return;
            case "array": return [value];
        }

        throw new Error("Cannot convert from " + ctype + " to " + type + "!");
    }
};