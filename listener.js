var http = require("http");
var events = require("events");

module.exports = class Listener extends events.EventEmitter{
	
	constructor(options){
		super();
		options = options || {};
		this.input_limit = options.input_limit || 1e5;
		this.port = options.port || 8000;
		this.method = options.method || "POST";
	}
	
	start(){
		if(this.running)
			throw new Error("Listener already running!");
		
		(this.server = http.createServer(function(request, response) {
			if(request.method === this.method) {
				//https://stackoverflow.com/questions/4295782/how-do-you-extract-post-data-in-node-js
				var query_data = "";
				request.on("data", function(data) {
					query_data += data;
					if(query_data.length > this.input_limit) {
						query_data = "";
						Listener.drop(response, 413);
						request.connection.destroy();
					}
				});
	
				request.on("end", () => this.emit("data", JSON.parse(query_data), request, response, (code, message) => Listener.drop(response, code, message)));
			}else
				Listener.drop(response, 405)
		})).listen(this.port);
		this.emit("start");
	}
	
	stop(){
		if(!this.running)
			throw new Error("Listener is not running!");
		
		this.emit("stop");
		this.server.close();
		this.server = undefined;
	}
	
	get running(){
		return typeof this.server !== "undefined";
	}
	
	static drop(response, code, message){
		response.writeHead(code, {"Content-Type": "text/plain"});
		if(typeof message !== "undefined") 
			response.write(message);
		response.end();
	}
}