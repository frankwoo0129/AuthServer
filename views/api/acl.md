root.get('/:clientId', function (req, res, next) {
	// 取得ACL詳細資料
	{
		name: 
		clientId: 
		roles: [
			{
				name:
			}
			
		]
	}
});

root.route('/:clientId/_role')
	.get(function (req, res, next) {
		// 取得所有角色
		[
			{
				name:
			}
			
		]
	}).post(function (req, res, next) {
		// 新增client角色
		parameter:
			rolename
	}).delete(function (req, res, next) {
		// 刪除所有角色
	});

root.route('/:clientId/_role/:rolename')
	.put(function (req, res, next) {
		// 更名client角色
		parameter:
			rolename
	}).delete(function (req, res, next) {
		// 刪除client角色
	});

root.route('/:clientId/_entry')
	.get(function (req, res, next) {
		// 取得client ACLEntry 所有names
		[
			{
				name:
				description:
			}
		]
	}).post(function (req, res, next) {
		// 新增一個client ACLEntry
		paramter:
			name
	});

root.route('/:clientId/_entry/:entryname')
	.get(function (req, res, next) {
		// 取得client ACLEntry 詳細資料
		{
			clientId:
			name:
			level:
			roles: [
				{
					name:
				}
			]
			members:
			description:
		}
	}).delete(function (req, res, next) {
		// 刪除一個client ACLEntry
	});

root.route('/:clientId/_entry/:entryname/_role')
	.get(function (req, res, next) {
		// 取得entry所有角色
		[
			{
				name:
			}
		]
	}).post(function (req, res, next) {
		// 新增client ACLEntry 角色
		paramter:
			rolename
	});

root.route('/:clientId/_entry/:entryname/_role/:rolename')
	.get(function (req, res, next) {
		// entry有無此角色
	}).delete(function (req, res, next) {
		// 刪除entry單一角色
		parameter:
			rolename
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
	}).delete(function (req, res, next) {
		// 刪除人員或群組
	});

root.put('/:clientId/_entry/:entryname/_name', function (req, res, next) {
	// 更名client ACLEntry
	parameter:
		name
});

root.put('/:clientId/_entry/:entryname/_level', function (req, res, next) {
	// 變更client ACLEntry 權限
	parameter:
		level
});

root.put('/:clientId/_entry/:entryname/_description', function (req, res, next) {
	// 變更client ACLEntry 敘述
	parameter:
		description
});
