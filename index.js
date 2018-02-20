//imports
var Config = require("./config");
var ApiWrapper = require("./api_wrapper");
var Listener = require("./listener");

//initialization
global.config = new Config("./config.json", "utf8");
global.api = new ApiWrapper(global.config.access_token);
require("./online_status");

var listener = new Listener({
	port: global.config.port,
	input_limit: global.config.max_input_size,
	method: "POST"
});

listener.on("start", () => console.log("Listener started!"));
listener.on("stop", () => console.log("Listener stopped!"));
listener.on("data", (data, request, response, drop) => {
	if(!processData(data, drop))
		drop(400);
});
listener.start();

//processing events received from VK Callback API
var processors = {
	message_new: require("./processors/message"),
	message_allow: require("./processors/allow"),
	confirmation: require("./processors/confirmation")
};

function processData(queryData, drop){
	if(typeof queryData !== "object") return false;
	if(typeof queryData.type !== "string") return false;
	if(typeof queryData.group_id !== "number") return false;
	if(typeof queryData.secret !== "string") return false;
	if(queryData.group_id != global.config.group_id) return false;
	if(queryData.secret != global.config.secret_key) return false;
	if(typeof processors[queryData.type] !== "function") return false;

	processors[queryData.type](queryData.object, drop);
	return true;
}
