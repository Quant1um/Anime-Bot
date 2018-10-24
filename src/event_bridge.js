class EventBridge {
    constructor() {
        this.handlers = {};
    }

    addHandler(event, handler) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
    }

    pushEvent(event, ...args) {
        if (!Array.isArray(event)) {
            event = [event];
        }

        for (let e of event) {
            if (this.handlers[e]) {
                for (let handler of this.handlers[e]) {
                    handler(...args);
                }
            }
        }
    }
}

module.exports = EventBridge;