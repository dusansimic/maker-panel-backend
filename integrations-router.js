const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config.json');

const integrationsRouter = express.Router(); // eslint-disable-line new-cap

integrationsRouter.post('/', (req, res, next) => {
	const data = req.body;
	MongoClient.connect(config.serverUrl, (err, client) => {
		if (err) {
			return next(err);
		}

		const dataCollection = client.db(config.dbName).collection('data');

		dataCollection.insertOne(data, (err, response) => {
			if (err) {
				return next(err);
			}
			if (response.result.ok !== 1) {
				return next(new Error('Data not inserted!'));
			}
      client.close();
			res.send(response);
			next();
		});
	});
});

integrationsRouter.use((err, req, res, next) => {
	if (err) {
		res.status(err.status).send({
			error: err.error,
			message: err.message
		});
	}
	next();
});

module.exports = integrationsRouter;
