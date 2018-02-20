module.exports = function(rawTags){
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
			if(typeof tag.taglist_name !== "string")
				if(tag.taglist_name !== null)
					tag.taglist_name = tag.aliases[0];
		
			tag.name = tag.name.trim();
			tag.booru_tag = tag.booru_tag.trim();
			for(var i = 0; i < tag.aliases.length; i++)
				tag.aliases[i] = tag.aliases[i].trim();
		
			tags[tag.name] = tag;
			if(tag.taglist_name !== null)
				taglist.push(tag.taglist_name);
			tag.aliases.forEach((alias) => aliases[alias] = tag);
		});
	
		return {
			tags_info: tags,
			aliases: aliases,
			taglist: taglist
		};
	}else
		throw new Error("Invalid data type: tags list must be an array!");
};