module.exports = function(data){
	console.log("Application validated!");
	data.end(200, global.config.confirmation_code);
};