/*jslint node: true */
"use strict";

var crypto = require('crypto');

var randomString = function (chars, leng1) {
	return function (leng2) {
		var rnd = crypto.randomBytes(leng1 || leng2),
			value = [],
			len = chars.length,
			i;
		for (i = 0; i < (leng1 || leng2); i = i + 1) {
			value.push(chars[rnd[i] % len]);
		}
		return value.join('');
	};
};

module.exports.randomString = randomString;
