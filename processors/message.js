module.exports = function(data){
	data.vk.api.call("messages.send", {
		user_id: data.object.user_id,
		message: "incoming message"
	});
	data.end(200, "ok");
};