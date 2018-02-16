module.exports = function(data){
	console.log("Application validated!");
	data.end(200, process.env.confirmation_code);
};