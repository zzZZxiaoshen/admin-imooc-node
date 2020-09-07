const multer = require('multer')
const express = require('express')
const Result = require('../models/Result')
const Book = require('../models/Book')
const {decode} = require("./jwt");
const {UPLOAD_PATH} = require('../utils/constant')
const bookService = require("../service/book")
const boom = require('boom')


const router = express.Router()

/**
 * 电子书上传
 */
router.post("/upload",
    multer({dest: `${UPLOAD_PATH}\\book`}).single('file'),
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
router.post("/create", function (req, res, next) {

    const decoder = decode(req)
    if (decoder && decoder.username) {
        req.body.username = decoder.username
    }
    //封装新增书籍对象
    const book = new Book(null, req.body);
    bookService.insertBook(book).then(() => {
        new Result().success(res);
    }).catch(err => {
        console.log('/book/create', err)
        next(boom.badImplementation(err))
    })

})

/**
 * 获取书籍信息
 */
router.get("/get", function (req, res, next) {
    decode(req)
    // 获取解析传入参数
    const {fileName} = req.query
    //查询数据局数据信息
    bookService.getBook(fileName).then(book => {
        new Result(book).success(res)
    }).catch(err => {
        console.log('/book/get', err)
        next(boom.badImplementation(err))
    })
})

/**
 * 获取图书列表
 */
router.get("/list", function (req, res, next) {

    console.log("------------------:"+JSON.stringify(req.query))
    decode(req)
    //查询数据局数据信息
    bookService.listBook(req.query).then(({list, count, page, pageSize}) => {
        new Result(
            list,
            '获取图书列表成功',
            {
                        page: Number(page),
                        pageSize: Number(pageSize),
                        total: count || 0}
        ).success(res)
    }).catch(err => {
        console.log('/book/list', err)
        next(boom.badImplementation(err))
    })
})

/**
 * 删除电子书
 */
router.get("/delete", function (req, res, next) {
    decode(req)
    // 获取解析传入参数
    const {fileName} = req.query;
    //从数据库中删除电子书与存储的电子书
    if (!fileName) {
        next(boom.badRequest(new Error('参数fileName不能为空')));
    } else {
        bookService.deleteBook(fileName)
            .then(() => {
                new Result(null, "删除成功").success(res);
            }).catch(err => {
            console.log('/book/delete', err)
            next(boom.badImplementation(err))
        })
    }

});
/**
 * 获取图书分类
 */
 router.get("/category",function (req,res,next) {
     decode(req);
     bookService.getCategory().then(category=>{
         new Result(category).success(res);
     }).catch(err=>{
         console.log('/book/delete', err)
         next(boom.badImplementation(err))
     })

 })





module.exports = router