module.exports = function(data){
	data.vk.send(data.object.user_id, "incoming message");
	data.end(200, "ok");
};