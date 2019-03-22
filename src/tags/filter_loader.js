const Path = require("path");
const _ = require("lodash");

class FilterLoader {

    static loadClass(path, name) {
        try {
            return require(path);
        } catch (e) {
            throw new Error(`Failed to load filter ${name} at ${path}`);
        }
    }

    static resolveOrder(filtersInfo, priority) {
        let defFilters = new Set(Object.keys(filtersInfo));

        if (!priority.some((val) => val === null)) {
            priority.push(null);
        }

        priority.forEach((filter) => {
            if (filter !== null) {
                if (filtersInfo[filter]) {
                    defFilters.delete(filter);
                } else {
                    throw new Error("priority list contains undefined filter: " + filter);
                }
            } 
        });

        return _.flatMap(priority, (filter) => filter === null ? Array.from(defFilters.values()) : filter);
    }

    static load(directory, filtersInfo, priority) {
        return FilterLoader.resolveOrder(filtersInfo, priority).map((filterName) => {
            let path = Path.resolve(directory, filterName);
            let config = filtersInfo[filterName];

            let FilterClass = FilterLoader.loadClass(path, filterName);
            let object = new FilterClass(config);

            return object.filter.bind(object);
        });
    }
}

module.exports = FilterLoader;