let booru = require("booru");
booru.search("danbooru", ["rating:e"], { limit: 1, random: true }).then((e) => console.log(e, "e"));
booru.search("danbooru", ["rating:s"], { limit: 1, random: true }).then((e) => console.log(e, "s"));
booru.search("danbooru", ["cute", "rating:s"], { limit: 1, random: true }).then((e) => console.log(e, "cutes"));
booru.search("danbooru", ["cute", "rating:e"], { limit: 1, random: true }).then((e) => console.log(e, "cutee"));
//require("./src/index.js");