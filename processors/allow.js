module.exports = function(data){
	data.vk.send(data.object.user_id, "message_allow: " + JSON.stringify(data.object));
	data.end(200, "ok");
};