var fs = require("fs");
var contents = fs.readFileSync("./tags.json", "utf8");
var parsedTags = JSON.parse(contents);

if(!Array.isArray(parsedTags))
	throw new Error("Parsed tags data in not an array!");

var tags = {};
var aliases = {};
var taglist = [];

parsedTags.forEach((tag) => {
	if(typeof tag !== "object") return;
	if(typeof tag.name !== "string")
		console.warn("One of tags has no name! (Name is required for tag and must be string!)");
	if(typeof tag.booru_tag !== "string")
		tag.booru_tag = tag.name;
	if(!Array.isArray(tag.aliases))
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

module.exports = {
	tags: tags,
	aliases: aliases,
	taglist: taglist
};

