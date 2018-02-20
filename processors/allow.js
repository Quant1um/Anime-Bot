module.exports = function(context){
	if(context.isSubscribed())
		global.api.send(object.getUserId(), "messages allowed");
};