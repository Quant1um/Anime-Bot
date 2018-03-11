const Utils = require("#utils/utils");

module.exports = class ReferenceResolver {

    constructor(target) {
        this.target = target;

        if (!Utils.isValid(target))
            throw new Error("Target is not valid!");
    }

    get(reference) {
        if (!Utils.isValid(reference))
            return null;

        var splitted = Utils.splitString(reference, ["."]);
        if (!splitted.length)
            return null;

        var object = this.target;
        for (let ref of splitted) {
            object = object[ref];
            if (!Utils.isValid(object))
                return null;
        }

        return object;
    }

    modify(reference, modificator) {
        if (!Utils.isValid(reference))
            return null;

        var splitted = Utils.splitString(reference, ["."]);
        if (!splitted.length)
            return null;

        var parent = null;
        var object = this.target;
        for (let i = 0; i < splitted.length; i++) {
            if (!Utils.isValid(object))
                parent[splitted[i - 1]] = object = {};
            parent = object;
            object = parent[splitted[i]];
        }

        parent[splitted[splitted.length - 1]] = modificator(object);
    }

    set(reference, value) {
        this.modify(reference, () => value);
    }
};