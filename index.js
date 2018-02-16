var http = require("http");
var queryString = require("querystring");

http.createServer(function(request, response) {
    if(request.method === "POST") {
        readAll(request, response, function(data) {
			if(!process(request, response, data))
				endResponse(response, 400);
        });
    }else
		endResponse(response, 405)

}).listen(8000);
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

function process(request, response, queryData){
	if(typeof queryData !== "object") return false;
	if(typeof queryData.type !== "string") return false;
	if(typeof queryData.object !== "object") return false;
	if(typeof queryData.group_id !== "number") return false;
	if(queryData.group_id !== process.env.group_id) return false;
	if(typeof processors[queryData.type] !== "function") return false;
	
	processors[queryData.type]({
		object: queryData.object,
		end: function(code, message){
			endResponse(response, message, code);
		}
	});
	return true;
}
