const _ = require("lodash");

class ArgumentCheckError extends Error { }

const argcheck = (farguments, funcs) => {
    _.forOwn(funcs, (func, key) => {
        try {
            func(farguments[key]);
        } catch (e) {
            throw new ArgumentCheckError(`Invalid argument '${farguments[key]}' at ${key}: ${e.message}!`);
        }
    });
};

argcheck.is = (constructor) => {
    return (val) => {
        if (val === null) {
            throw new Error(`${constructor.name} expected, got null`);
        } else if (typeof val === "undefined") {
            throw new Error(`${constructor.name} expected, got undefined`);
        } else if (val.constructor !== constructor) {
            throw new Error(`${constructor.name} expected, got ${val.constructor}`);
        }
    };
};

argcheck.instanceof = (constructor) => {
    return (val) => {
        if (val === null) {
            throw new Error(`${constructor.name} expected, got null`);
        } else if (typeof val === "undefined") {
            throw new Error(`${constructor.name} expected, got undefined`);
        } else if (val instanceof constructor) {
            throw new Error(`instance of ${constructor.name} expected, got ${val.constructor}`);
        }
    };
};

argcheck.between = (min, max) => {
    return (val) => {
        if (val < min || val > max) {
            throw new Error(`must be in range of [${min}; ${max}]`);
        }
    };
};

argcheck.integer = () => {
    return (val) => {
        if (val !== Math.floor(val)) {
            throw new Error("integer expected");
        }
    };
};

argcheck.every = (...funcs) => {
    return (val) => {
        funcs.forEach((func) => func(val));
    };
};

argcheck.any = (...funcs) => {
    return (val) => {
        let exception = null;
        for (let func of funcs) {
            try {
                func(val);
                return;
            } catch (e) {
                exception = e;
            }
        }
        throw exception;
    };
};

argcheck.maybe = (func) => {
    return (val) => {
        if (val === null || typeof val === "undefined") {
            return;
        } else {
            func(val);
        }
    };
};

argcheck.values = (func) => {
    return (val) => {
        _.forOwn(val, (value) => {
            try {
                func(value);
            } catch (e) {
                e.message = e.message + ` (at element '${value}')`;
                throw e;
            }
        });
    };
};

module.exports = argcheck;

