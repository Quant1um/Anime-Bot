module.exports = function(data){
	vk.send(data.object.user_id, "incoming message");
	data.end(200, "ok");
};