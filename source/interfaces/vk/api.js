const VK = require("vk-io");
const Debug = require("#debug");

module.exports = class VKApi{
	
	constructor(options){
		options = options || {};
		this.vk = new VK.VK(options);
		this.group_id = options.group_id;
	}
	
	setOnline(online){
        return (online ?
            this.vk.api.groups.enableOnline({ group_id: this.group_id }) :
            this.vk.api.groups.disableOnline({ group_id: this.group_id }))
            .catch((err) => Debug.error("vk interface", err.stack || err.message || err));
	}
	
	startListener(options, callback){
		options = options || {};
		this.vk.updates.use(callback);
		this.vk.updates.startWebhook({
			port: options.port || 8000,
            tls: options.https || false
        }).catch((err) => Debug.error("vk interface", err.stack || err.message || err));
	}
	
	static stringifyAttachements(attachements){
		if(!Array.isArray(attachements))
			return;
		var strings = [];
		attachements.forEach((attachement) => strings.push(attachement.toString()));
		return strings.join(", ");
	}
};