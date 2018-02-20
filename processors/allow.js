module.exports = function(object, end){
	global.api.send(object.user_id, "message_allow: " + JSON.stringify(object));
	end(200, "ok");
};