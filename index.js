//initialization
var http = require("http");
global.config = require("./config");
global.api = require("./apiwrapper");
require("./onlinestatus");

//creating listener
http.createServer(function(request, response) {
	if(request.method === "POST") {
		readAll(request, response, function(data) {
			if(!processData(request, response, data))
				endResponse(response, 400);
		});
	}else
		endResponse(response, 405)

}).listen(global.config.port);
console.log("Server created!");

//https://stackoverflow.com/questions/4295782/how-do-you-extract-post-data-in-node-js
function readAll(request, response, callback) {
	if(typeof callback !== "function") return;

	var query_data = "";
	request.on("data", function(data) {
		query_data += data;
		if(query_data.length > global.config.max_input_size) {
			query_data = "";
			endResponse(response, 413);
			request.connection.destroy();
		}
	});
	
	request.on("end", function() {
		request.post = JSON.parse(query_data);
		callback(request.post);
	});
}

function endResponse(response, code, message){
	response.writeHead(code, {"Content-Type": "text/plain"});
	if(typeof message !== "undefined") 
		response.write(message);
	response.end();
}

//processing events received from VK Callback API
var processors = {
	message_new: require("./processors/message"),
	message_allow: require("./processors/allow"),
	confirmation: require("./processors/confirmation")
};

function processData(request, response, queryData){
	if(typeof queryData !== "object") return false;
	if(typeof queryData.type !== "string") return false;
	if(typeof queryData.group_id !== "number") return false;
	if(typeof queryData.secret !== "string") return false;
	if(queryData.group_id != global.config.group_id) return false;
	if(queryData.secret != global.config.secret_key) return false;
	if(typeof processors[queryData.type] !== "function") return false;

	processors[queryData.type]({
		object: queryData.object,
		end: function(code, message){
			endResponse(response, code, message);
		}
	});
	return true;
}
