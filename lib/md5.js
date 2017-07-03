/*jslint node: true */
/*jslint es5: true */
'use strict';

var crypto = require('crypto');

var md5sum = function (msg) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(msg);
    return md5sum.digest('hex');
};

module.exports.md5sum = md5sum;
