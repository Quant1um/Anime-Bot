var vk = require("vk-io");

module.exports = class ApiWrapper{
	
	constructor(token){
		this.vk = new vk.VK({
			token: global.config.access_token
		});
	}
	
	send(user_id, message, attachements){
		var options = {
			user_id: user_id,
			random_id: Math.floor(Math.random() * 1e9),
			message: message
		};
		
		if(Array.isArray(attachements))
			options.attachements = stringifyAttachements(attachements);
		
		return this.vk.api.messages.send(options);
	}
	
	setOnline(online){
		return online ?
			this.vk.api.groups.enableOnline({group_id: global.config.group_id}) :
			this.vk.api.groups.disableOnline({group_id: global.config.group_id});
	}
	
	static stringifyAttachements(attachements){
		if(!Array.isArray(attachements))
			return;
	
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
};