const Loadable = require("#config/loadable");
const Utils = require("#utils");

module.exports = class L18n extends Loadable{

    get(key) {
        return Utils.resolveReference(this.parsedData, key) || key;
    }
};