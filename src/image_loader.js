const assert = require("./utils/assert");
const type = require("./utils/type");

const fetch = require("node-fetch");
const sharp = require("sharp");

class ImageLoader {

    constructor({ maxWidth = +Infinity, maxHeight = +Infinity, quality = 80 }) {
        assert(type(maxWidth, Number), "Cannot create image loader: invalid max width type (expected number)!");
        assert(type(maxHeight, Number), "Cannot create image loader: invalid max height type (expected number)!");
        assert(type(quality, Number), "Cannot create image loader: invalid quality type (expected number)!");

        assert(maxWidth >= 0, "Cannot create image loader: max width must be higher than 0!");
        assert(maxHeight >= 0, "Cannot create image loader: max height must be higher than 0!");
        assert(quality > 0 && quality <= 100, "Cannot create image loader: quality must be in range of (0, 100]!");

        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.quality = quality;
    }

    load(url) {
        return fetch(url)
            .then((res) => res.buffer())
            .then((buffer) => this.process(buffer))
            .catch(() => null);
    }

    process(buffer) {
        const image = sharp(buffer);
        return image
            .metadata()
            .then((metadata) => this.resizeIfNecessary(metadata, image))
            .then((image) => image.jpeg({ quality: this.quality }).toBuffer());
    }
    
    resizeIfNecessary(metadata, image) {
        if (metadata.width > this.maxWidth ||
            metadata.maxHeight > this.maxHeight) {
            return image.resize(this.maxWidth, this.maxHeight, { fit: "inside" });
        }
        return image;
    }
}

module.exports = ImageLoader;
