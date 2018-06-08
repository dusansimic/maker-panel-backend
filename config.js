const Config = require('conf');

module.exports = new Config({
	defaults: {
		serverUrl: process.env.SERVER_URL || 'mongodb://localhost:27017',
		dbName: process.env.DB_NAME || 'makerpanel'
	}
});
