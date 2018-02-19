var api = require("./apiwrapper");
api.setOnline(true);

process.on("exit", onExit);
process.on("SIGINT", onExit);
process.on("SIGTERM", onExit);
process.on("SIGUSR1", onExit);
process.on("SIGUSR2", onExit);
process.on("uncaughtException", onExit);

function onExit(){ //hacky way to wait async operation to complete
	var done = false;
	function setDone(error){
		done = true;
		throw error;
	}
	
	api.setOnline(false).then(setDone, setDone);
	while(!done);
	console.log("done");
}