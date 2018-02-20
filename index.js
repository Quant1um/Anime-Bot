//imports
var Config = require("./config");
var ApiWrapper = require("./api_wrapper");
var Listener = require("./listener");

//initialization
global.config = new Config("./config.json", "utf8");
global.api = new ApiWrapper({
	group_id: global.config.group_id,
	token: global.config.access_token,
	apiMode: "parallel_selected",
	webhookPath: "/",
	webhookSecret: global.config.secret_key,
	webhookConfirmation: global.config.confirmation_code,
});
require("./online_status");

var processors = {
	message: require("./processors/message"),
	message_subscribe: require("./processors/allow")
};

global.api.startListener({
	port: global.config.port,
	https: global.config.use_https
}, async (context, next) => {
	if(typeof processors[context.type] !== "undefined"){
		if(typeof processors[context.type] === "function")
			processors[context.type](context);
		else
			throw new Error("Processor for contexts of type \"" + context.type + "\" not a function!");
	}

	await next();
});

