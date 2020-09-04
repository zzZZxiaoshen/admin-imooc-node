const express = require('express')
const Result = require('../models/Result')
const {login} = require('../service/user')
const { body, validationResult } = require('express-validator')
const boom = require('boom')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constant')
const crypto = require('crypto')
const {decode}=  require("./jwt");


const router = express.Router()

router.get('/info', function(req, res, next) {
    const decoded = decode(req);
    if (decoded && decoded.username) {
        new Result({
            roles: ["admin"],
            name: "xiaoshen",
            avatar: "https://fuss10.elemecdn.com/8/27/f01c15bb73e1ef3793e64e6b7bbccjpeg.jpeg",
            introduction: "111"
        }, "user info ").success(res);
    } else {
        new Result('用户信息解析失败').fail(res)
    }
})

router.post('/login',
    [
    body('username').isString().withMessage('username类型不正确'),
    body('password').isString().withMessage('password类型不正确')
    ], function(req, res, next) {
    const err = validationResult(req)
    if (!err.isEmpty()) {
        const [{msg}] = err.errors;
        next(boom.badRequest(msg));
    } else {
        const username = req.body.username
        const password = md5(`${req.body.password}`)
        login(username,password).then(user=>{
            if (!user || user.length === 0) {
                new Result("登入失败").fail(res);
            } else {
                const token=  jwt.sign({username},PRIVATE_KEY,  { expiresIn: JWT_EXPIRED })
                new Result({token},'登录成功').success(res)
            }
        })
    }
})

router.post('/logout',function(req, res, next) {
    new Result('登出成功').success(res)
})

function md5(s) {
    // 注意参数需要为 String 类型，否则会出错
    return crypto.createHash('md5')
        .update(String(s)).digest('hex');
}


module.exports = router