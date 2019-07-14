
class InfoCollector {

    constructor() {
        this.tags = new Set();
        this.count = 0;
    }
    
    update(post) {
        post.tags.forEach((tag) => this.tags.add(tag));
        this.count++;
    }

    toUserdata() {
        return {
            tags: Array.from(this.tags)
        };
    }
}

module.exports = InfoCollector;