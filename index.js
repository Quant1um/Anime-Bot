var http = require("http");
var queryString = require("querystring");

var port = process.env.PORT || 8000;
http.createServer(function(request, response) {
    if(request.method === "POST") {
        readAll(request, response, function(data) {
			if(!processData(request, response, data))
				endResponse(response, 400);
        });
    }else
		endResponse(response, 405)

}).listen(port);
console.log("Server created!");

//https://stackoverflow.com/questions/4295782/how-do-you-extract-post-data-in-node-js
function readAll(request, response, callback) {
    if(typeof callback !== "function") return null;

	var queryData = "";
    request.on("data", function(data) {
        queryData += data;
        if(queryData.length > 1e6) {
            queryData = "";
            endResponse(response, 413);
            request.connection.destroy();
        }
    });
	
    request.on("end", function() {
        request.post = JSON.parse(queryData);
		console.info(request.post);
        callback(request.post);
    });
}

function endResponse(response, code, message){
	response.writeHead(code, message, {'Content-Type': 'text/plain'});
	response.end();
}

var processors = {
	message_new: require("./processors/message"),
	confirmation: require("./processors/confirmation")
};

function processData(request, response, queryData){
	if(typeof queryData !== "object") return false;
	console.log("query is defined");
	if(typeof queryData.type !== "string") return false;
	console.log("type validated");
	if(typeof queryData.group_id !== "number") return false;
	console.log("id validated");
	if(typeof queryData.secret_key !== "string") return false;
	console.log("key validated");
	if(queryData.group_id !== process.env.group_id) return false;
	console.log("id validated (comparison with " + process.env.group_id + ")");
	if(queryData.secret_key !== process.env.secret_key) return false;
	console.log("key validated (comparison with " + process.env.secret_key + ")");
	if(typeof processors[queryData.type] !== "function") return false;
	console.log("processor validated");
	
	processors[queryData.type]({
		object: queryData.object,
		end: function(code, message){
			endResponse(response, message, code);
		}
	});
	return true;
}
