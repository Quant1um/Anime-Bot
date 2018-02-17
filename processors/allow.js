module.exports = function(data){
	console.log("message_allow");
	data.end(200, "ok");
};