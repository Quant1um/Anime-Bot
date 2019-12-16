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
            .then((image) => 
                this.resizeIfNecessary(image)
                    .quality(this.quality)
                    .getBufferAsync(jimp.MIME_JPEG)
            );
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
