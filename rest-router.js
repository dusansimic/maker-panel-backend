const express = require('express');
const {MongoClient} = require('mongodb');
const config = require('./config');

const restRouter = express.Router(); // eslint-disable-line new-cap

restRouter.get('/', (req, res, next) => {
	MongoClient.connect(config.serverUrl, (err, client) => {
		if (err) {
			return next(err);
		}

		const dataCollection = client.db(config.dbName).collection('data');

		dataCollection.find({}).toArray((err, docs) => {
			client.close();
			if (err) {
				return next(err);
			}

			res.send(docs);
			next();
		});
	});
});

restRouter.get('/applications', (req, res, next) => {
	MongoClient.connect(config.serverUrl, (err, client) => {
		if (err) {
			return next(err);
		}

		const dataCollection = client.db(config.dbName).collection('data');

		dataCollection.find({}, {_id: 0, app_id: 1}).toArray((err, docs) => { // eslint-disable-line camelcase
			client.close();
			if (err) {
				return next(err);
			}

			const apps = [];
			for (let i = 0; i < docs.length; i++) {
				if (!apps.includes(docs[i].app_id)) {
					apps.push(docs[i].app_id);
				}
			}

			res.send(apps);
			next();
		});
	});
});

restRouter.get('/:applicationId/devices', (req, res, next) => {
	MongoClient.connect(config.serverUrl, (err, client) => {
		if (err) {
			return next(err);
		}

		const dataCollection = client.db(config.dbName).collection('data');

		dataCollection.find({app_id: req.params.applicationId}, {_id: 0, dev_id: 1}).toArray((err, docs) => { // eslint-disable-line camelcase
			client.close();
			if (err) {
				return next(err);
			}

			const devs = [];
			for (let i = 0; i < docs.length; i++) {
				if (!devs.includes(docs[i].dev_id)) {
					devs.push(docs[i].dev_id);
				}
			}

			res.send(devs);
			next();
		});
	});
});

restRouter.get('/:applicationId/device/:deviceId', (req, res, next) => {
	const query = {app_id: req.params.applicationId, dev_id: req.params.deviceId}; // eslint-disable-line camelcase
	if (req.query.time) {
		query['metadata.time'] = {$gte: (new Date(req.query.time)).toISOString()};
	}

	MongoClient.connect(config.serverUrl, (err, client) => {
		if (err) {
			return next(err);
		}

		const dataCollection = client.db(config.dbName).collection('data');

		dataCollection.find(query, {_id: 0, payload_fields: 1, metadata: 1}).toArray((err, docs) => { // eslint-disable-line camelcase
			client.close();
			if (err) {
				return next(err);
			}

			res.send(docs);
			next();
		});
	});
});

restRouter.use((err, req, res, next) => {
	if (err) {
		res.status(err.status || 500).json({
			message: err.message,
			error: err.error,
			status: err.status
		});
	}
	next();
});

module.exports = restRouter;
