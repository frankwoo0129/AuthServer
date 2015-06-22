/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');

var RefreshTokenSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true
	},
	clientId: {
		type: String,
		required: true
	},
	userId: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 60 * 24 * 7
	},
	expires: {
		type: Date
	}
});

module.exports = function (connection) {
	RefreshTokenSchema.path('id').validate(function (value, response) {
		connection.model('RefreshToken').findOne({id: value}, function (err, result) {
			if (err) {
				response(false);
			} else if (!result) {
				response(true);
			} else {
				response(false);
			}
		});
	}, 'Validation of {id} failed');

	var RefreshToken = connection.model('RefreshToken', RefreshTokenSchema);
	return RefreshToken;
};
