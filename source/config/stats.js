module.exports = class Statistics {

    get(key) {
        return Utils.resolveReference(this.parsedData, key) || key;
    }

    //TODO
};