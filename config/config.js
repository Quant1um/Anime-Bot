var fs = require("fs");
const CONFIG_ENTRIES = {
	port: process.env.PORT || 8000,
	max_input_size: 1e5,
	use_https: false,
	group_id: undefined,
	secret_key: undefined,
	access_token: undefined,
	confirmation_code: undefined,
	tags: require("./tags"),
	album_name: "Bot Content Album"
};

module.exports = class Config{
	
	constructor(filename, encoding){
		this.filename = filename;
		this.encoding = encoding || "utf8";
		this.load();
	}
	
	load(){
		var content = fs.readFileSync(this.filename, this.encoding);
		var parsedConfig = JSON.parse(content);
		if(typeof parsedConfig === "undefined")
			throw new Error("Config is empty!");
		
		Object.keys(CONFIG_ENTRIES).forEach((entry) => {
			var value = undefined;
			if(typeof CONFIG_ENTRIES[entry] === "function")
				value = CONFIG_ENTRIES[entry](parsedConfig[entry]);
			else
				value = parsedConfig[entry] || 
						process.env[entry] || 
						CONFIG_ENTRIES[entry];
						
			if(typeof value === "undefined")
				console.warn("Config entry " + entry + " is not defined!");
			else 
				Object.defineProperty(this, entry, { get: () => value });
		});
	}
}