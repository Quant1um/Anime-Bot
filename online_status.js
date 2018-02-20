global.api.setOnline(true);

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("SIGUSR1", shutdown);
process.on("SIGUSR2", shutdown);
process.on("uncaughtException", shutdown);

//https://help.heroku.com/ROG3H81R/why-does-sigterm-handling-not-work-correctly-in-nodejs-with-npm
function shutdown(err) {
	console.log("Shutdown...");
	global.api.setOnline(false);
	if (err) console.error(err.stack || err);
	setTimeout(() => process.exit(err ? 1 : 0), 4000).unref();
}
