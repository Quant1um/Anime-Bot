module.exports = function(object, end){
	global.api.send(object.user_id, JSON.stringify(object));
	end(200, "ok");
};