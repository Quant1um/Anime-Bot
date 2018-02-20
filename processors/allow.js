module.exports = function(context){
	if(context.isSubscribed())
		global.api.send(context.getUserId(), "messages allowed");
};