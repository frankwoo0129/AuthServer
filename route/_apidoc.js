/**
 * @apiDefine SystemError
 * @apiError (Error 500) message="server error"
 */

/**
 * @apiDefine UserError
 * @apiError message
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "UserNotFound"
 *     }
 */
