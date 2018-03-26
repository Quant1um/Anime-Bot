"use strict";

require("./easy");

const Timers = require("timers");
const Bootstrap = require("./core/bootstrap");

process.env.access_token = "test";
process.env.secret_key = "test 2";
process.env.confirmation_code = "test 3";
process.env.PORT = 102;

Bootstrap.load();

process.on("SIGINT", unload);
process.on("SIGTERM", unload);
process.on("SIGUSR1", unload);
process.on("SIGUSR2", unload);
process.on("beforeExit", unload);
process.on("uncaughtException", unload);

var unloaded = false;
function unload(error) {
    const TAG = "unloading";

    if (unloaded) return;
    unloaded = true;

    if (error) Debug.error("error", error);
    try {
        Bootstrap.unload();
    } catch (unloading_error) {
        Debug.error(TAG, unloading_error);
    }

    Debug.log(TAG, "Exiting process...");
    Timers.setTimeout(() => process.exit(0), 2000).unref();
}
