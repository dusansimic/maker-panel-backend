const express = require('express');

const api = express.Router(); // eslint-disable-line new-cap
const integrationsRouter = require('./integrations-router');
const restRouter = require('./rest-router');

api.use('/integrations', integrationsRouter);
api.use('/rest', restRouter);

module.exports = api;
