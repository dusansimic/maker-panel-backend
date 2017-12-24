const http = require('http');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const api = require('./api');

const app = express();
const server = http.createServer(app);

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', api);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', err => {
	if (err) {
		throw err;
	}
	console.log('Listening on port 3000');
});
