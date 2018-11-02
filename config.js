module.exports = {
	serverUrl: process.env.SERVER_URL || 'mongodb://localhost:27017',
	dbName: process.env.DB_NAME || 'makerpanel',
	emailAddres: process.env.EMAIL_ADDR,
	emailPass: process.env.EMAIL_PASS
};
