module.exports = (err, _req, res, next) => {
	if (err) {
		res.status(err.status || 500).send({
			error: err.error,
			message: err.message,
			status: err.status
		});
	}
	next();
};
