var vk = require("vk-io");
var vk_api = new vk.VK({
	token: process.env.access_token
});

module.exports = {
	vk: vk_api,
	send: function(user_id, message, attachements){
		var options = {
			user_id: user_id,
			random_id: Math.floor(Math.random() * 1e9),
			message: message
		};
		
		if(Array.isArray(attachements))
			options.attachements = stringifyAttachements(attachements);
		
		vk_api.call("messages.send", options);
	}
};

function stringifyAttachements(attachements){
	if(!Array.isArray(attachements))
		return null;
	
	var strings = [];
	attachements.forEach((attachement) => {
		if(typeof attachement !== "object") return;
		if(typeof attachement.type !== "string") return;
		if(typeof attachement.owner_id !== "number") return;
		if(typeof attachement.media_id !== "number") return;
		
		var string = `${attachement.type}_${attachement.owner_id}_${attachement.media_id}`;
		if(typeof attachement.access_key === "string")
			string += `_${attachement.access_key}`;
		strings.push(string);
	});
	
	return strings.join(", ");
}