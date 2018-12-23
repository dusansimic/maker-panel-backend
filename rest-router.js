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

restRouter.get('/application/:applicationId/devices', async (req, res, next) => {
	try {
		const client = await MongoClient.connect(config.serverUrl);

		const dataCollection = client.db(config.dbName).collection('data');

		// eslint-disable-next-line camelcase
		const devs = await dataCollection.distinct('dev_id', {app_id: req.params.applicationId});

		const devices = [];
		for (const dev of devs) {
			// Get last updated time
			const lastUpdated = await dataCollection.find	({'dev_id': dev}, {_id: 0, metadata: 1}).limit(1).sort({'metadata.time': -1}).toArray();
			// Push data to devices list
			devices.push({name: dev, lastUpdated: lastUpdated.metadata.time});
		}

		client.close();

		res.send(devices);
		next();
	} catch (err) {
		return next(err);
	}
});

restRouter.get('/application/:applicationId/device/:deviceId', async (req, res, next) => {
	try {
		let query = {app_id: req.params.applicationId, dev_id: req.params.deviceId}; // eslint-disable-line camelcase, prefer-const
		const amount = req.query.amount ? parseInt(req.query.amount, 10) : 30;

		const client = await MongoClient.connect(config.serverUrl);

		const dataCollection = client.db(config.dbName).collection('data');

		// eslint-disable-next-line camelcase
		const docs = await dataCollection.find(query, {_id: 0, payload_fields: 1, metadata: 1}).limit(amount).sort({'metadata.time': -1}).toArray();
		client.close();

		res.send(docs);
		next();
	} catch (err) {
		return next(err);
	}
});

module.exports = restRouter;
