/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var async = require('async');
var root = require('express').Router();
var ACL = require('../schema/oauth').ACL;
var ACLEntry = require('../schema/oauth').ACLEntry;

root.route('/')
	/**
	 * @api {get} / Get ACL List
	 * @apiName getAllACL
	 * @apiGroup ACL
	 *
	 * @apiHeader {String} authorization Access Token.
	 *
	 * @apiSuccess {Object[]} acls List of ACL.
	 * @apiSuccess {String} acls.name Name.
	 * @apiSuccess {String} acls.clientId ClientId.
	 * @apiSuccess {Object[]} acls.roles Roles
	 * @apiSuccess {String} acls.roles.name Rolename
	 */
	.get(function (req, res, next) {
		// 取得所有ACL
		ACL.getAllACL(function (err, results_all_acl) {
			async.map(results_all_acl, function (acl, callback_outer) {
				async.map(acl.roles, function (rolename, callback_inner) {
					callback_inner(null, {name: rolename});
				}, function (err, results) {
					callback_outer(null, {
						name: acl.name,
						clientId: acl.clientId,
						roles: results
					});
				});
			}, function (err, results) {
				res.json(results);
			});
		});
	/**
	 * @api {post} / Create ACL
	 * @apiName createACL
	 * @apiGroup ACL
	 *
	 * @apiHeader {String} authorization Access Token.
	 * @apiParam {String} clientId
	 * @apiParam {String} name
	 *
	 */
	}).post(function (req, res, next) {
		// 新增ACL
		ACL.createACL(req.body.clientId, req.body.name, function (err) {
			if (err) {
				next(err);
			} else {
				res.sendStatus(200);
			}
		});
	});


root.route('/:clientId')
	/**
	 * @api {get} /:clientId Get ACL Info
	 * @apiName getACL
	 * @apiGroup ACL
	 *
	 * @apiHeader {String} authorization Access Token.
	 * @apiParam {String} clientId
	 *
	 * @apiSuccess {String} name Client Name.
	 * @apiSuccess {String} clientId Client ID.
	 * @apiSuccess {Object[]} roles Roles
	 * @apiSuccess {String} roles.name Rolename
	 */
	.get(function (req, res, next) {
		// 取得ACL詳細資料
		ACL.getACL(req.params.clientId, function (err, result_ACL) {
			if (err) {
				next(err);
			} else {
				async.map(result_ACL.roles, function (rolename, callback) {
					callback(null, {name: rolename});
				}, function (err, results) {
					res.json({
						name: result_ACL.name,
						clientId: result_ACL.clientId,
						roles: results
					});
				});
			}
		});
	}).post(function (req, res, next) {
		next();
	}).put(function (req, res, next) {
		next();
	/**
	 * @api {delete} /:clientId Delete ACL
	 * @apiName removeACL
	 * @apiGroup ACL
	 *
	 * @apiHeader {String} authorization Access Token.
	 * @apiParam {String} clientId
	 */
	}).delete(function (req, res, next) {
		// 刪除ACL
		ACL.removeACL(req.params.clientId, function (err) {
			if (err) {
				next(err);
			} else {
				res.sendStatus(200);
			}
		});
	});

root.route('/:clientId/_role')
	/**
	 * @api {get} /:clientId/_role Get ACL Roles
	 * @apiName getACLRoles
	 * @apiGroup ACL
	 *
	 * @apiHeader {String} authorization Access Token.
	 * @apiParam {String} clientId
	 *
	 * @apiSuccess {Object[]} roles Roles
	 * @apiSuccess {String} roles.name Rolename
	 */
	.get(function (req, res, next) {
		// 取得所有角色
		ACL.getACL(req.params.clientId, function (err, result_ACL) {
			if (err) {
				next(err);
			} else {
				async.map(result_ACL.roles, function (rolename, callback) {
					callback(null, {name: rolename});
				}, function (err, results) {
					res.json(results);
				});
			}
		});
	/**
	 * @api {post} /:clientId/_role Add ACL Role
	 * @apiName addRole
	 * @apiGroup ACL
	 *
	 * @apiHeader {String} authorization Access Token.
	 * @apiParam {String} clientId
	 * @apiParam {String} rolename
	 */
	}).post(function (req, res, next) {
		// 新增client角色
		ACL.addRole(req.params.clientId, req.body.rolename, function (err) {
			if (err) {
				next(err);
			} else {
				res.sendStatus(200);
			}
		});
	}).put(function (req, res, next) {
		next();
	/**
	 * @api {delete} /:clientId/_role Delete All ACL Roles
	 * @apiName deleteAllRole
	 * @apiGroup ACL
	 *
	 * @apiHeader {String} authorization Access Token.
	 * @apiParam {String} clientId
	 */
	}).delete(function (req, res, next) {
		// 刪除所有角色
		ACL.deleteAllRole(req.params.clientId, function (err) {
			if (err) {
				next(err);
			} else {
				res.sendStatus(200);
			}
		});
	});

root.route('/:clientId/_role/:rolename')
	.get(function (req, res, next) {
		next();
	}).post(function (req, res, next) {
		next();
	/**
	 * @api {put} /:clientId/_role/:rolename Change ACL Rolename
	 * @apiName renameRole
	 * @apiGroup ACL
	 *
	 * @apiHeader {String} authorization Access Token.
	 * @apiParam {String} clientId
	 * @apiParam {String} rolename
	 * @apiParam {String} rolename
	 */
	}).put(function (req, res, next) {
		// 更名client角色
		ACL.renameRole(req.params.clientId, req.params.rolename, req.body.rolename, function (err) {
			if (err) {
				next(err);
			} else {
				res.sendStatus(200);
			}
		});
	/**
	 * @api {delete} /:clientId/_role/:rolename Delete ACL role
	 * @apiName deleteRole
	 * @apiGroup ACL
	 *
	 * @apiHeader {String} authorization Access Token.
	 * @apiParam {String} clientId
	 * @apiParam {String} rolename
	 */
	}).delete(function (req, res, next) {
		// 刪除client角色
		ACL.deleteRole(req.params.clientId, req.params.rolename, function (err) {
			if (err) {
				next(err);
			} else {
				res.sendStatus(200);
			}
		});
	});

root.route('/:clientId/_entry')
	/**
	 * @api {get} /:clientId/_entry Get All ACL Entries
	 * @apiName getAllEntry
	 * @apiGroup ACL
	 *
	 * @apiHeader {String} authorization Access Token.
	 * @apiParam {String} clientId
	 *
	 * @apiSuccess {Object[]} entries Entries
	 * @apiSuccess {String} entries.name Entry name
	 * @apiSuccess {String} entries.description Entry description
	 */
	.get(function (req, res, next) {
		// 取得client ACLEntry 所有names
		ACLEntry.getAllEntry(req.params.clientId, function (err, results) {
			if (err) {
				next(err);
			} else {
				res.json(results);
			}
		});
	/**
	 * @api {post} /:clientId/_entry Create ACL Entry
	 * @apiName createACLEntry
	 * @apiGroup ACL
	 *
	 * @apiHeader {String} authorization Access Token.
	 * @apiParam {String} clientId
	 * @apiParam {String} name
	 */
	}).post(function (req, res, next) {
		// 新增一個client ACLEntry
		ACLEntry.createACLEntry(req.params.clientId, req.body.name, function (err) {
			if (err) {
				next(err);
			} else {
				res.sendStatus(200);
			}
		});
	}).put(function (req, res, next) {
		next();
	}).delete(function (req, res, next) {
		next();
	});

root.route('/:clientId/_entry/:entryname')
	/**
	 * @api {get} /:clientId/_entry/:entryname Get ACL Entry Info
	 * @apiName getEntry
	 * @apiGroup ACL
	 *
	 * @apiHeader {String} authorization Access Token.
	 * @apiParam {String} clientId
	 * @apiParam {String} entryname
	 *
	 * @apiSuccess {String} clientId Client ID
	 * @apiSuccess {String} name Entry name
	 * @apiSuccess {String} level Entry Level
	 * @apiSuccess {Object[]} roles Entry Roles
	 * @apiSuccess {String} roles.name Rolename
	 * @apiSuccess {Object[]} members Entry Members
	 * @apiSuccess {String} members.name
	 * @apiSuccess {String} members.org
	 * @apiSuccess {String} members.type
	 * @apiSuccess {String} description Entry description
	 */
	.get(function (req, res, next) {
		// 取得client ACLEntry 詳細資料
		ACLEntry.getEntry(req.params.clientId, req.params.entryname, function (err, result) {
			if (err) {
				next(err);
			} else {
				async.map(result.roles, function (rolename, callback) {
					callback(null, {name: rolename});
				}, function (err, results) {
					result.roles = results;
					res.json(result);
				});
			}
		});
	}).post(function (req, res, next) {
		next();
	}).put(function (req, res, next) {
		next();
	/**
	 * @api {delete} /:clientId/_entry/:entryname Delete ACL Entry
	 * @apiName getAllEntry
	 * @apiGroup ACL
	 *
	 * @apiHeader {String} authorization Access Token.
	 * @apiParam {String} clientId
	 * @apiParam {String} entryname
	 */
	}).delete(function (req, res, next) {
		// 刪除一個client ACLEntry
		ACLEntry.removeACLEntry(req.params.clientId, req.params.entryname, function (err) {
			if (err) {
				next(err);
			} else {
				res.sendStatus(200);
			}
		});
	});

root.route('/:clientId/_entry/:entryname/_role')
	.get(function (req, res, next) {
		// 取得entry所有角色
	}).post(function (req, res, next) {
		// 新增client ACLEntry 角色
		ACLEntry.enableRole(req.params.clientId, req.params.entryname, req.body.rolename, function (err) {
			if (err) {
				next(err);
			} else {
				res.sendStatus(200);
			}
		});
	}).put(function (req, res, next) {
		next();
	}).delete(function (req, res, next) {
		// 刪除entry所有角色
	});

root.route('/:clientId/_entry/:entryname/_role/:rolename')
	.get(function (req, res, next) {
		// entry有無此角色
		ACLEntry.isEnableRole(req.params.clientId, req.params.entryname, req.params.rolename, function (err, enable) {
			if (err) {
				next(err);
			} else if (enable) {
				res.sendStatus(200);
			} else {
				res.sendStatus(400);
			}
		});
	}).post(function (req, res, next) {
		next();
	}).put(function (req, res, next) {
		next();
	}).delete(function (req, res, next) {
		// 刪除entry單一角色
		ACLEntry.disableRole(req.params.clientId, req.params.entryname, req.params.rolename, function (err) {
			if (err) {
				next(err);
			} else {
				res.sendStatus(200);
			}
		});
	});

root.route('/:clientId/_entry/:entryname/_member')
	.get(function (req, res, next) {
		// 取得所有人員和群組
	}).post(function (req, res, next) {
		// 新增人員或群組
	}).put(function (req, res, next) {
		// 設定人員群組
	}).delete(function (req, res, next) {
		// 刪除所有人員群組
	});

root.route('/:clientId/_entry/:entryname/_member/:org/:name')
	.get(function (req, res, next) {
		// 取得特定人員或群組
	}).post(function (req, res, next) {
		next();
	}).put(function (req, res, next) {
		next();
	}).delete(function (req, res, next) {
		// 刪除人員或群組
	});

root.put('/:clientId/_entry/:entryname/_name', function (req, res, next) {
	// 更名client ACLEntry
	ACLEntry.rename(req.params.clientId, req.params.entryname, req.body.name, function (err) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

root.put('/:clientId/_entry/:entryname/_level', function (req, res, next) {
	// 變更client ACLEntry 權限
	ACLEntry.setLevel(req.params.clientId, req.params.entryname, req.body.level, function (err) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

root.put('/:clientId/_entry/:entryname/_description', function (req, res, next) {
	// 變更client ACLEntry 敘述
	ACLEntry.setDescription(req.params.clientId, req.params.entryname, req.body.description, function (err) {
		if (err) {
			next(err);
		} else {
			res.sendStatus(200);
		}
	});
});

root.use(function (req, res, next) {
	next({
		method: req.method,
		url: req.originalUrl,
		message: 'no this url',
		status: 404
	});
});

module.exports = root;
