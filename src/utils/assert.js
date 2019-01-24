class AssertionError extends Error { }

/**
 * Throws error if variable is falsy
 * @param {any} variable Variable to check
 * @param {string} message Error message
 */
const assert = (variable, message) => {
    if (!variable) {
        throw new AssertionError(message);
    }
};

module.exports = assert;