const fetch = require("node-fetch");
const sharp = require("sharp");

class ImageLoader {

    constructor({ maxWidth = +Infinity, maxHeight = +Infinity, quality = 80 }) {
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
