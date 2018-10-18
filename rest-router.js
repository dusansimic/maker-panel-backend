const express = require('express');
const {MongoClient} = require('mongodb');
const config = require('./config');

const restRouter = express.Router(); // eslint-disable-line new-cap

restRouter.get('/', async (_req, res, next) => {
	try {
		const client = await MongoClient.connect(config.serverUrl);

		const dataCollection = client.db(config.dbName).collection('data');

		const docs = await dataCollection.find({}).toArray();
		client.close();

		res.send(docs);
		next();
	} catch (err) {
		return next(err);
	}
});

restRouter.get('/applications', async (_req, res, next) => {
	try {
		const client = await MongoClient.connect(config.serverUrl);

		const dataCollection = client.db(config.dbName).collection('data');

		const apps = await dataCollection.distinct('app_id');
		client.close();

		res.send(apps);
		next();
	} catch (err) {
		return next(err);
	}
});

restRouter.get('/:applicationId/devices', async (req, res, next) => {
	try {
		const client = await MongoClient.connect(config.serverUrl);

		const dataCollection = client.db(config.dbName).collection('data');

		// eslint-disable-next-line camelcase
		const devs = await dataCollection.distinct('dev_id', {app_id: req.params.applicationId});
		client.close();

		res.send(devs);
		next();
	} catch (err) {
		return next(err);
	}
});

restRouter.get('/:applicationId/device/:deviceId', async (req, res, next) => {
	try {
		let query = {app_id: req.params.applicationId, dev_id: req.params.deviceId}; // eslint-disable-line camelcase
		if (req.query.time) {
			const metadata = {
				'metadata.time': {
					$gte: (new Date(req.query.time)).toISOString()
				}
			};

			query = {...query, ...metadata};
		}

		const client = await MongoClient.connect(config.serverUrl);

		const dataCollection = client.db(config.dbName).collection('data');

		// eslint-disable-next-line camelcase
		const docs = await dataCollection.find(query, {_id: 0, payload_fields: 1, metadata: 1}).toArray();
		client.close();

		res.send(docs);
		next();
	} catch (err) {
		return next(err);
	}
});

module.exports = restRouter;
