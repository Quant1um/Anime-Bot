"use strict";

var Config = require("./config/config");
global.config = new Config("./../config.json", "utf8");

var interfaces = {
    vk: require("./interfaces/vk/interface")
};

function startupInterfaces() {
    Object.keys(interfaces).forEach((key) => {
        interfaces[key] = new interfaces[key];
        interfaces[key].startup(global.config);
        console.log("Interface bound: \"" + key + "\".");
    });
}

function unloadInterfaces() {
    Object.keys(interfaces).forEach((key) => interfaces[key].unload(global.config));
}

startupInterfaces();

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("SIGUSR1", cleanup);
process.on("SIGUSR2", cleanup);
process.on("uncaughtException", cleanup);

//https://help.heroku.com/ROG3H81R/why-does-sigterm-handling-not-work-correctly-in-nodejs-with-npm
function cleanup(err) {
    console.log("Shutdown...");
    unloadInterfaces();
    if (err) console.error(err.stack || err);
    setTimeout(() => process.exit(err ? 1 : 0), 2000).unref();
}


