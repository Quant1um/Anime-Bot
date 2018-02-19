//reading config.json
var fs = require("fs");
var contents = fs.readFileSync("./config.json", "utf8");
var parsedConfig = JSON.parse(contents);
if(typeof parsedConfig === "undefined")
	throw new Error("Config is empty!");

module.exports = {};

//config entries with default values
var entries = {
	port: 8000,
	max_input_size: 1e5,
	group_id: undefined,
	secret_key: undefined,
	access_token: undefined,
	confirmation_code: undefined
};

Object.keys(entries).forEach((entry) => {
	module.exports[entry] = parsedConfig[entry] || 
							process.env[entry] || 
							entries[entry];
							
	if(typeof module.exports[entry] === "undefined")
		console.warn("Config entry " + entry + " is not defined!");
});

var rawTags = parsedConfig.tags;
if(Array.isArray(rawTags)){
	var tags = {};
	var aliases = {};
	var taglist = [];

	rawTags.forEach((tag) => {
		if(typeof tag !== "object") return;
		if(typeof tag.name !== "string")
			console.warn("One of tags has no name! (Name is required for tag and must be string!)");
		if(typeof tag.booru_tag !== "string")
			tag.booru_tag = tag.name;
		if(!Array.isArray(tag.aliases) || tag.aliases.length === 0)
			tag.aliases = [tag.name];
		if(typeof tag.taglist_name !== "string"){
			if(tag.taglist_name !== null)
				tag.taglist_name = tag.aliases[0];
			}
		
		tags[tag.name] = tag;
		if(tag.taglist_name !== null)
			taglist.push(tag.taglist_name);
		tag.aliases.forEach((alias) => {
			aliases[alias] = tag;
		});
	});
	
	module.exports.tags = tags;
	module.exports.aliases = aliases;
	module.exports.taglist = taglist;
}else
	throw new Error("Invalid data type: tags list must be an array!");
