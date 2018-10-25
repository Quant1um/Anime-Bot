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

    pushEvent(events, ...args) {
        if (!Array.isArray(events)) {
            events = [events];
        }

        events.forEach((event) => {
            let handlers = this.handlers[event] || [];
            handlers.forEach((handler) => handler(...args));
        })
    }
}

module.exports = EventBridge;