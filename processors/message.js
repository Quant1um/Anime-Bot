module.exports = function(context){
	global.api.send(context.getPeerId(), context.getText() || "no text");
};