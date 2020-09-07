const db = require("../db")
const Book = require("../models/Book")
const _ = require('lodash')

/**
 * 校验图书是否存在
 */
function  exists(book){
    const {title, author, publisher} = book;
    const sql = `select * from book where title='${title}' and author='${author}' and publisher='${publisher}'`
    return db.queryOne(sql)
}

/**
 * 移除书籍
 * @param book
 * @returns {Promise<unknown>}
 */
async function removeBook(book) {
    if (book) {
        book.reset()
        if (book.fileName) {
            const removeBookSql = `delete from book where fileName='${book.fileName}'`
            const removeContentsSql = `delete from contents where fileName='${book.fileName}'`
            await db.querySql(removeBookSql)
            await db.querySql(removeContentsSql)
        }
    }
}

/**
 * 新增章节目录
 * @param book
 * @returns {Promise<void>}
 */
async function insertContents(book) {
    let contents = book.getContents()
    if (!contents) {
        const newBook = await book.parse()
        contents = newBook.getContents()
    }
    if (contents && contents.length > 0) {
        for (let i = 0; i < contents.length; i++) {
            const content = contents[i]
            const _content = _.pick(content, [
                'fileName',
                'id',
                'href',
                'order',
                'level',
                'text',
                'label',
                'pid',
                'navId'
            ])
            await db.insert(_content, 'contents')
        }
    }
}
/**
 * 新增书籍
 * @param book
 * @returns {Promise<unknown>}
 */
function insertBook(book) {
    return new Promise( async  (resolve,reject) =>{
        try{
            if (book instanceof Book) {
                //校验书籍是否存在
                const result = await exists(book);
                if (result) {
                    await removeBook(book);
                    reject(new Error("电子书已经存在"));
                } else {
                    //插入书本信息
                    await db.insert(book.toDb(), 'book')
                    //插入章节信息
                    await insertContents(book)
                    resolve()
                }
            } else {
                reject(new Error("添加的图书对象不合法"))
            }
        } catch (e) {
            reject(e)
        }
    })

}


/**
 * 根据书名查询书籍信息
 * @param fileName 书籍名字
 */
async function getBook(fileName) {
    //查询数据库电子书信息
    const bookSql = `select * from book where fileName='${fileName}'`
    const contentsSql = `select * from contents where fileName='${fileName}' order by \`order\` asc`
    const book = await db.queryOne(bookSql)
    const contents = await db.querySql(contentsSql)

    //处理封装电子书信息
    if (book) {
        book.cover = Book.genCoverUrl(book);
        book.contents = contents;
        book.contentsTree = [];
        contents.forEach(_ => _.children = []);
        contents.forEach(c => {
            if (c.pid === '') {
                book.contentsTree.push(c);
            } else {
                const parent = contents.find(_ => _.navId === c.pid);
                parent.children.push(c);
            }
        }); // 将目录转化为树状结构
        return book;
    } else {
        throw new Error('电子书不存在')
    }
}

/**
 * 删除电子书
 */
function deleteBook(fileName){
    return new Promise(async (resolve, reject) => {
        try {
            let book = getBook(fileName);
            if (book) {
                if (Number(book.updateType) === 0) {
                    reject(new Error('默认电子书不能删除'));
                } else {
                    const bookObject = new Book(null, book);
                    const sql = `DELETE FROM book WHERE fileName='${fileName}'`
                    db.querySql(sql).then(() => {
                        bookObject.reset();
                        resolve();
                    })
                }
            } else {
                reject(new Error('电子书不存在'))
            }
        } catch (e) {
            reject(e)
        }
    })


}

/**
 * 图书列表
 */
 async function listBook( p){
     // 结构查询条件
    const {
        page = 1,
        pageSize = 20,
        sort,
        title,
        category,
        author
    } = p;
    const offset = (page - 1) * pageSize;
    let bookSql = 'select * from book'
    let where = 'where'
    title && (where = db.andLike(where, 'title', title))
    author && (where = db.andLike(where, 'author', author))
    category && (where = db.and(where, 'categoryText', category))
    if (where !== 'where') {
        bookSql = `${bookSql} ${where}`
    }
    if (sort) {
        const symbol = sort[0]
        const column = sort.slice(1, sort.length)
        const order = symbol === '+' ? 'asc' : 'desc'
        bookSql = `${bookSql} order by ${column} ${order}`
    }
    bookSql = `${bookSql} limit ${pageSize} offset ${offset}`
    let countSql = `select count(*) as count from book`
    if (where !== 'where') {
        countSql = `${countSql} ${where}`
    }
    const list = await db.querySql(bookSql)
    console.log(bookSql, '\n', countSql)
    list.forEach(book => book.cover = Book.genCoverUrl(book))
    const count = await db.querySql(countSql)
    return { list, count: count[0].count, page, pageSize }
 }

 /**
 *  书籍分类
  */
 function getCategory(){
     return new Promise((resolve, reject) => {
         try {
             const sql = 'select * from category order by category asc'
             const result = db.querySql(sql);
             const categoryList = []
             console.log("-----------------:"+JSON.stringify(result))
             result.forEach(item => {
                 categoryList.push({
                     label: item.categoryText,
                     value: item.category,
                     num: item.num
                 })
             })
             resolve(categoryList)
         } catch (e) {
             reject(e);
         }
     })
 }



module.exports = {
    insertBook,
    getBook,
    deleteBook,
    listBook,
    getCategory
}


