const express = require('express');
const {MongoClient} = require('mongodb');
const config = require('./config');

const integrationsRouter = express.Router(); // eslint-disable-line new-cap

integrationsRouter.post('/', (req, res, next) => {
	const data = req.body;
	MongoClient.connect(config.get('serverUrl'), (err, client) => {
		if (err) {
			return next(err);
		}

		const dataCollection = client.db(config.get('dbName')).collection('data');

		dataCollection.insertOne(data, (err, response) => {
			client.close();
			if (err) {
				return next(err);
			}
			if (response.result.ok !== 1) {
				return next(new Error('Data not inserted!'));
			}

			res.send(response);
			next();
		});
	});
});

integrationsRouter.use((err, req, res, next) => {
	if (err) {
		res.status(err.status || 500).send({
			error: err.error,
			message: err.message
		});
	}
	next();
});

module.exports = integrationsRouter;
