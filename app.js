const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const api = require('./api');
const errorHandler = require('./error-handler');

const app = express();
const server = http.createServer(app);

if (process.env.IS_PROD === false) {
	const morgan = require('morgan');
	app.use(morgan('dev'));
}
app.use(bodyParser.json());
app.use(cors());
app.use('/api', api);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', err => {
	if (err) {
		throw err;
	}
	console.log('Listening on port 3000');
});
