const express = require('express');
const {MongoClient} = require('mongodb');
const config = require('./config');

const restRouter = express.Router(); // eslint-disable-line new-cap

restRouter.get('/', async (_req, res, next) => {
	try {
		const client = await MongoClient.connect(config.serverUrl, config.settings);

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
		const client = await MongoClient.connect(config.serverUrl, config.settings);

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
		const client = await MongoClient.connect(config.serverUrl, config.settings);

		const dataCollection = client.db(config.dbName).collection('data');

		// eslint-disable-next-line camelcase
		const devs = await dataCollection.distinct('dev_id', {app_id: req.params.applicationId});

		const devices = [];
		for (const dev of devs) {
			// Get last updated time
			// eslint-disable-next-line camelcase, no-await-in-loop
			const lastUpdated = (await dataCollection.find({dev_id: dev}, {_id: 0, metadata: 1}).limit(1).sort({'metadata.time': -1}).toArray())[0];
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
		const query = {app_id: req.params.applicationId, dev_id: req.params.deviceId}; // eslint-disable-line camelcase
		const amount = req.query.amount ? parseInt(req.query.amount, 10) : 30;

		const getOnlyLocation = req.query.hasOwnProperty('onlyLocation') && req.query.onlyLocation === 'true'; // eslint-disable-line no-prototype-builtins
		const options = getOnlyLocation ? {metadata: 1} : {payload_fields: 1, metadata: 1}; // eslint-disable-line camelcase

		const client = await MongoClient.connect(config.serverUrl, config.settings);

		const dataCollection = client.db(config.dbName).collection('data');

		if (getOnlyLocation) {
			let location = (await dataCollection.find(query, options).limit(1).sort({'metadata.time': -1}).toArray())[0];
			client.close();

			const hasLocation = location.metadata.hasOwnProperty('latitude'); // eslint-disable-line no-prototype-builtins
			location = hasLocation ? [location.metadata.latitude, location.metadata.longitude] : [0, 0];

			res.send({hasLocation, location});
			return next();
		}

		// eslint-disable-next-line camelcase
		const docs = await dataCollection.find(query, options).limit(amount).sort({'metadata.time': -1}).toArray();
		client.close();

		res.send(docs);
		next();
	} catch (err) {
		console.error(err);
		return next(err);
	}
});

module.exports = restRouter;
