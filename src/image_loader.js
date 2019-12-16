const fetch = require("node-fetch");
const jimp = require("jimp");

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
        return jimp.read(buffer)
            .then((image) => this.resizeIfNecessary(metadata, image))
            .then((image) => image.quality(this.quality))
            .then((image) => image.getBufferAsync(jimp.MIME_JPEG));
    }
    
    resizeIfNecessary(metadata, image) {
        if (metadata.width > this.maxWidth ||
            metadata.maxHeight > this.maxHeight) {
            return image.scaleToFit(this.maxWidth, this.maxHeight, jimp.AUTO);
        }
        return image;
    }
}

module.exports = ImageLoader;
