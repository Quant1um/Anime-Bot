const isNullOrUndefined = (variable) => typeof variable === "undefined" || variable === null;

const type = (variable, ...types) => {
    return types.some((type) => type === null ? isNullOrUndefined(variable) : variable.constructor === type);
};

module.exports = type;