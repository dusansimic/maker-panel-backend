const express = require('express');
const {MongoClient} = require('mongodb');
const nodemailer = require('nodemailer');
const config = require('./config');

const integrationsRouter = express.Router(); // eslint-disable-line new-cap
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'maker.lora@gmail.com',
		pass: 'makerpanel'
	}
});

integrationsRouter.post('/', async (req, res, next) => {
	try {
		const data = req.body;
		const client = await MongoClient.connect(config.serverUrl);

		const boundaryCollection = client.db(config.dbName).collection('boundary');

		const {bounds, recipients} = await boundaryCollection.findOne({
			app_id: data.app_id,	// eslint-disable-line camelcase
			dev_id: data.dev_id		// eslint-disable-line camelcase
		}, {bounds: 1, recipients: 1});

		for (const key in bounds) {	// eslint-disable-line guard-for-in
			let text;

			if (data[key] > bounds[key].max) {// eslint-disable-next-line camelcase
				text = `${key} on device ${data.dev_id} in app ${data.app_id} went over maximum value.\n${data[key]} > ${bounds[key].max}`;
			} else if (data[key] < bounds[key].min) {// eslint-disable-next-line camelcase
				text = `${key} on device ${data.dev_id} in app ${data.app_id} went over maximum value.\n${data[key]} > ${bounds[key].max}`;
			}

			const mailOptions = {
				from: 'maker.lora@gmail.com',
				to: recipients.join(', '),
				subject: `Alert: ${data.dev_id} in ${data.app_id}`,
				text
			};

			try {
				await transporter.sendMail(mailOptions);	// eslint-disable-line no-await-in-loop
			} catch (err) {
				// TODO: Find where to send error message
			}
		}

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
