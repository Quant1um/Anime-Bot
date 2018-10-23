class EventBridge {
    constructor() {
        this.handlers = {};
    }

    addHandler(event, handler) {
        if (!this.handlers[event])
            this.handlers[event] = [];
        this.handlers[event].push(handler);
    }

    pushEvent(event, ...args) {
        if (Array.isArray(event)) {
            for (let e of event) {
                this.pushEvent(e, ...args);
            }
        } else if (typeof event === "string") {
            if (this.handlers[event]) {
                for (let handler of this.handlers[event]) {
                    handler(...args);
                }
            }
        } else {
            throw new Error("Invalid event type (got " + typeof event + ", array or string expected)");
        }
    }
}

module.exports = EventBridge;