module.exports = function(data){
	data.vk.api.messages.send(data.object.user_id, "test message");
	data.end(200, "ok");
};