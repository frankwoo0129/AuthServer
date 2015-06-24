/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	members: {
		type: [String],
		default: []
	},
	expired: {
		type: Boolean,
		default: false
	}
});

module.exports = function (connection) {
	var Group = connection.model('Group', GroupSchema);
	return Group;
};
