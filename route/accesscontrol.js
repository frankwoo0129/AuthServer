/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var root = require('express').Router();
var ACL = require('../schema/acl');
var ACLEntry = require('../schema/aclentry');

root.get('/', function (req, res) {
	res.send('Home');
});

root.get('/:clientId', function (req, res, next) {
	// 取得ACL詳細資料
	ACL.getACL(req.params.clientId, function (err, result_ACL) {
		if (err) {
			next(err);
		} else {
			res.json({
				name: result_ACL.name,
				clientId: result_ACL.clientId,
				roles: result_ACL.roles,
			});
		}
	});
});

root.put('/:clientId/name', function (req, res, next) {
	// 更名ACL
	ACL.rename(req.params.clientId, req.body.name, function (err) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

root.put('/:clientId/role/:name', function (req, res, next) {
	// 更名client角色
	ACL.renameRole(req.params.clientId, req.params.name, req.body.name, function (err) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

root.post('/:clientId/role', function (req, res, next) {
	// 新增client角色
	ACL.addRole(req.params.clientId, req.body.name, function (err) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

root.delete('/:clientId/role', function (req, res, next) {
	// 刪除client角色
	ACL.deleteRole(req.params.clientId, req.body.name, function (err) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

root.get('/:clientId/entry', function (req, res, next) {
	// 取得client ACLEntry 所有names
	ACLEntry.getAllEntry(req.params.clientId, function (err, results) {
		if (err) {
			next(err);
		} else {
			res.json({
				entries: results
			});
		}
	});
});

root.post('/:clientId/entry', function (req, res, next) {
	// 新增一個client ACLEntry
	ACLEntry.createACLEntry(req.params.clientId, req.body.name, function (err) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

root.delete('/:clientId/entry', function (req, res, next) {
	// 刪除一個client ACLEntry
	ACLEntry.removeACLEntry(req.params.clientId, req.body.name, function (err) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

root.get('/:clientId/entry/:name', function (req, res, next) {
	// 取得client ACLEntry 詳細資料
	ACLEntry.getEntry(req.params.clientId, req.params.name, function (err, result) {
		if (err) {
			next(err);
		} else {
			res.json(result);
		}
	});
});

root.put('/:clientId/entry/:name/name', function (req, res, next) {
	// 更名client ACLEntry
	ACLEntry.rename(req.params.clientId, req.params.name, req.body.name, function (err) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

root.post('/:clientId/entry/:name/member', function (req, res, next) {
	// 新增人員或群組
});

root.delete('/:clientId/entry/:name/member', function (req, res, next) {
	// 刪除人員或群組
});

root.post('/:clientId/entry/:name/role', function (req, res, next) {
	// 新增client ACLEntry 角色
	ACLEntry.enableRole(req.params.clientId, req.params.name, req.body.role, function (err) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

root.delete('/:clientId/entry/:name/role', function (req, res, next) {
	// 刪除client ACLEntry 角色
	ACLEntry.disableRole(req.params.clientId, req.params.name, req.body.role, function (err) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

root.put('/:clientId/entry/:name/level', function (req, res, next) {
	// 變更client ACLEntry 權限
	ACLEntry.setLevel(req.params.clientId, req.params.name, req.body.level, function (err) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

root.put('/:clientId/entry/:name/description', function (req, res, next) {
	// 變更client ACLEntry 敘述
	ACLEntry.setDescription(req.params.clientId, req.params.name, req.body.description, function (err) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});
