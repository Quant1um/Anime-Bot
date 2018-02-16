module.exports = function(data){
	data.end(200, process.env.confirmation_code);
};