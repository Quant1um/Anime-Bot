"use strict";

const Path = require("path");
const FORMAT_ARG_REGEX = /{(\d+)}/g;

module.exports = class Utils {

    /**
     * Returns true if, and only if, given value is undefined or null.
     * @param {any} value Given value
     * @returns {boolean} True, if, and only if, given value is undefined or null, otherwise false.
     */
    static isValid(value) {
        return typeof value !== "undefined" && value !== null;
    }

    /**
     * Like String.prototype.split(string) but accepts array of delimitiers, instead of single delimitiers.
     * Node: Each delimitier must has length of 1, otherwise that delimities will be ignored!
     * @param {string} string Splittable string
     * @param {string[]} delimiters Array of delimitiers
     * @returns {string[]} Array of string that splittable one contains and separated using given array of delimitiers.
     */
    static splitString(string, delimiters) {
        if (typeof string !== "string")
            throw new Error("Argument error: string expected as first argument!");
        if (!Array.isArray(delimiters))
            throw new Error("Argument error: array expected as second argument!");

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
        for(let key in input){
            let obj = input[key];
            if (Array.isArray(obj)) {
                for (let value of obj) {
                    if (Utils.isValid(inverse[value]))
                        throw new Error("Dublication at value \"" + value + "\" of key \"" + key + "\".");
                    else
                        inverse[value] = key;
                }
            } else if (Utils.isValid(obj)) {
                if (Utils.isValid(inverse[obj]))
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
            throw new Error("Argument error: string expected as first argument!");

        return format.replace(FORMAT_ARG_REGEX, (match, key) =>
            typeof args[key] !== 'undefined' ? args[key] : match);
    }

    /**
     * Resolves path relative to current working directory
     * @param {string} path Path, relative to current working directory
     * @returns {string} Absolute path that refers to same file/direction as given path.
     */
    static resolvePath(path) {
        if (typeof path !== "string")
            throw new Error("Argument error: string expected as first argument!");

        return Path.resolve(process.cwd(), path);
    }
};