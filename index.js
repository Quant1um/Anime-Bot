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

function processData(query_data, drop){
	if(typeof query_data !== "object") return false;
	if(typeof query_data.type !== "string") return false;
	if(typeof query_data.group_id !== "number") return false;
	if(typeof query_data.secret !== "string") return false;
	if(query_data.group_id != global.config.group_id) return false;
	if(query_data.secret != global.config.secret_key) return false;
	if(typeof processors[query_data.type] !== "function") return false;

	processors[query_data.type](query_data.object, drop);
	return true;
}
