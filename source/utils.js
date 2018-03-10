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
     * @param {object} args Arguments that need to insert into format string.
     * @returns {string} Formatted string
     */
    static format(format, args) {
        return format.replace(FORMAT_ARG_REGEX, (match, key) =>
            typeof args[key] !== 'undefined' ? args[key] : match);
    }

    /**
     * Transforms string of one format to string of another.
     * @param {string} source Source format as regular expression (for example, "orderby:([A-Za-z0-9\.]+)").
     * @param {string} destination Destination format (for example, "order:{0}" where 0 - mathing group index)
     * @param {string} input Input string that matches source regexp (for example, "orderby:random")
     * @returns {string} String that has destination format (within given examples, "order:random"). Arguments ("{0}") will be replaced with source's matching groups
     */
    static transform(source, destination, input) {
        var regex = new RegExp("^" + source + "$", "i");
        var args = regex.exec(input);
        if (Utils.isValid(args))
            return Utils.format(destination, args.slice(1));
        else
            return null;
    }

    /**
     * Resolves reference to object ("object1.object2.object3") of given object.
     * @param {object} object Root object
     * @param {string} reference Reference to nested object of format "object1.object2.object3"
     * @returns {any} Nested object that referred by given reference.
     */
    static resolveReference(object, reference) {
        var splitted = Utils.splitString(reference, ["."]);

        for (let ref of splitted) {
            object = object[ref];
            if (!Utils.isValid(object))
                return null;
        }

        return object;
    }

    /**
     * Resolves path relative to current working directory
     * @param {string} path Path, relative to current working directory
     * @returns {string} Absolute path that refers to same file/direction as given path.
     */
    static resolvePath(path) {
        return Path.resolve(process.cwd(), path);
    }
};