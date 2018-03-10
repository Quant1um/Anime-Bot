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

    static type(value) {
        if (Array.isArray(value))
            return "array";
        return typeof value;
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
     * Resolves reference to object ("object1.object2.object3") of given object and returns nested object that referred by given reference.
     * Example: call Utils.resolveReference({ root: object, reference: "inner.innermore.innermost" }) is the same as object.inner.innermore.innermost or object["inner"]["innermore"]["innermost"]
     * TODO: test
     * @param {object} options Options object
     * @param {object} options.root Base object
     * @param {string} options.reference String reference in format "object1.object2.object3" that points to nested base object's object.
     * @param {boolean} options.create Boolean flag, if true, then if any of nested objects are not exist, it will be created (except last/innermost), otherwise, if non-existent nested object found, null will be returned
     * @param {any} options.value This value will be assigned to innermost nested object if value is defined (if null, then null will be assigned), but if value is a function (that takes one argument - current value of the innermost nested object), then result of a function will be assigned
     * @returns {any} Nested object that referred by given reference.
     */
    static resolveReference(options) {
        var root = options.root;
        var reference = options.reference;
        var create = options.create || false;
        var value = options.value;

        if (!(Utils.isValid(root) && Utils.isValid(reference)))
            return null;

        var splitted = Utils.splitString(reference, ["."]);
        if (!splitted.length)
            return null;

        var parent = null;
        var object = root;
        for (let i = 0; i < splitted.length; i++) {
            if (!Utils.isValid(object)) {
                if(create) parent[splitted[i - 1]] = object = {};
                else return null;
            }

            parent = object;
            object = parent[splitted[i]] || null;
        }

        if (typeof value !== "undefined")
            parent[splitted[splitted.length - 1]] =
                typeof value === "function" ? value(object) : value;

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