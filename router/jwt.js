const expressJwt = require('express-jwt')
const { PRIVATE_KEY } = require('../utils/constant')
const jwt = require('jsonwebtoken')

/**
 * 解密token
 * @param req 请求参数
 * @returns {*}
 */
function decode(req) {
    const authorization = req.get("Authorization")
    let token = ''
    if (authorization.indexOf("Bearer") >= 0) {
        token = authorization.replace("Bearer ", "");
    } else {
        token= authorization
    }
    //解密token
    return jwt.verify(token, PRIVATE_KEY);
}

module.exports= {
    decode
}