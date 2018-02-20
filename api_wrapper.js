var vk = require("vk-io");

module.exports = class ApiWrapper{
	
	constructor(options){
		options = options || {};
		this.vk = new vk.VK(options);
		this.group_id = options.group_id;
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
			this.vk.api.groups.enableOnline({group_id: this.group_id}) :
			this.vk.api.groups.disableOnline({group_id: this.group_id});
	}
	
	startListener(options, callback){
		options = options || {};
		this.vk.updates.use(callback);
		this.vk.updates.startWebhook({
			port: options.port || 8000,
			tls: options.https || false
		}).catch(console.error);
	}
	
	static stringifyAttachements(attachements){
		if(!Array.isArray(attachements))
			return;
		var strings = [];
		attachements.forEach((attachement) => strings.push(attachement.toString()));
		return strings.join(", ");
	}
};