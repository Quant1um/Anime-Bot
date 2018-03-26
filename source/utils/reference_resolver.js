module.exports = class ReferenceResolver {

    constructor(target) {
        this.target = target;

        if (!defined(target))
            throw new Error("Target is not valid!");
    }

    get(reference) {
        if (!defined(reference))
            return null;

        var splitted = Utils.splitString(reference, ["."]);
        if (!splitted.length)
            return null;

        var object = this.target;
        for (let ref of splitted) {
            object = object[ref];
            if (!defined(object))
                return null;
        }

        return object;
    }

    modify(reference, modificator) {
        if (!defined(reference))
            return null;

        if (Object.isFrozen(this.target))
            throw new Error("Target object is frozen!");

        var splitted = Utils.splitString(reference, ["."]);
        if (!splitted.length)
            return null;

        var parent = null;
        var object = this.target;
        for (let i = 0; i < splitted.length; i++) {
            if (!defined(object))
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