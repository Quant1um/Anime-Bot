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
    
    resizeIfNecessary(image) {
        if (image.bitmap.width > this.maxWidth ||
            image.bitmap.height > this.maxHeight) {
            return image.scaleToFit(this.maxWidth, this.maxHeight, jimp.AUTO);
        }

        return image;
    }
}

module.exports = ImageLoader;
