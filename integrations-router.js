const express = require('express');
const {MongoClient} = require('mongodb');
const config = require('./config');

const integrationsRouter = express.Router(); // eslint-disable-line new-cap

integrationsRouter.post('/', async (req, res, next) => {
	try {
		const data = req.body;
		const client = await MongoClient.connect(config.serverUrl);

		const dataCollection = client.db(config.dbName).collection('data');

		const response = await dataCollection.insertOne(data);
		client.close();
		if (response.result.ok !== 1) {
			return next(new Error('Data not inserted!'));
		}

		res.send(response);
		next();
	} catch (err) {
		return next(err);
	}
});

module.exports = integrationsRouter;
