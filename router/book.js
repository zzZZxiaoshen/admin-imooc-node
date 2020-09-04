const multer = require('multer')
const express = require('express')
const Result = require('../models/Result')
const Book = require('../models/Book')
const {decode} = require("./jwt");
const {UPLOAD_PATH} = require('../utils/constant')
const  bookService = require("../service/book")
const boom = require('boom')



const router = express.Router()

/**
 * 电子书上传
 */
router.post("/upload",
    multer({ dest: `${UPLOAD_PATH}\\book` }).single('file'),
    function (req, res, next) {

        const decoder = decode(req)
        if (decoder && decoder.username) {
            if (!req.file || req.file.length === 0) {
                new Result("上传文件失败").fail(res);
            } else {
                // 创建跟封装book对象
                const book = new Book(req.file)
                book.parse()
                    .then(book => {
                        new Result(book.toJson()).success(res)
                    })
                    .catch((err) => {
                        console.log('/book/upload', err)
                        next(boom.badImplementation(err))
                        book.reset()
                    })
            }
        } else {
            new Result('上传电子书失败').fail(res)
        }
    })

/**
 * 新增电子书数据
 */
router.post("/create",function (req, res, next) {

    const decoder = decode(req)
    if (decoder && decoder.username) {
        req.body.username = decoder.username
    }
    //封装新增书籍对象
    const book = new Book(null, req.body);
    bookService.insertBook(book).then(()=>{
        new Result().success(res);
    }).catch(err=>{
        console.log('/book/create', err)
        next(boom.badImplementation(err))
    })

})

/**
 * 获取书籍信息
 */
router.get("/get",function (req, res, next) {
    decode(req)
    // 获取解析传入参数
    const {fileName} = req.query
    console.log("-------------------:"+fileName)
    //查询数据局数据信息
    bookService.getBook(fileName).then(book=>{
        new Result(book).success(res)
    }).catch(err=>{
        console.log('/book/get', err)
        next(boom.badImplementation(err))
    })


})

module.exports = router