module.exports = function(data){
	console.log("incoming message");
	data.end(200, "ok");
};