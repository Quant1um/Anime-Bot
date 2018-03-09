"use strict";

module.exports = {

    isValid: function (value) {
        return typeof value !== "undefined" && value !== null;
    },

    splitString: function (string, delimiters) {
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

        return result;
    }
};