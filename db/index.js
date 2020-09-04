const config = require('./config')
const mysql = require('mysql')
const debug = require('../utils/constant').debug
const {isObject} = require('../utils/index')

function connect() {
    return mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database:config.database,
        multipleStatements: true
    })
}


function querySql(sql) {
    const conn = connect()
    debug && console.log(sql)
    return new Promise((resolve, reject) => {
        try {
            conn.query(sql, (err, results) => {
                if (err) {
                    debug && console.log('查询失败，原因:' + JSON.stringify(err))
                    reject(err)
                } else {
                    debug && console.log('查询成功', JSON.stringify(results))
                    resolve(results)
                }
            })
        } catch (e) {
            reject(e)
        } finally {
            conn.end()
        }
    })
}

function queryOne(sql){
    return new Promise((resolve ,reject) =>{
        querySql(sql).then(result =>{
            if (result && result.length > 0) {
                resolve(result[0]);
            } else {
                resolve(null);
            }
        }).catch(err =>{
            reject(err)
        })
    })
}

function insert(model, tableName) {
    return new Promise((resolve, reject) => {
        if (!isObject(model)) {
            reject(new Error('插入数据库失败，插入数据非对象'))
        } else {
            const keys = []
            const values = []
            Object.keys(model).forEach(key => {
                if (model.hasOwnProperty(key)) {
                    keys.push(`\`${key}\``)
                    values.push(`'${model[key]}'`)
                }
            })
            if (keys.length > 0 && values.length > 0) {
                let sql = `INSERT INTO \`${tableName}\`(`
                const keysString = keys.join(',')
                const valuesString = values.join(',')
                sql = `${sql}${keysString}) VALUES (${valuesString})`
                const conn = connect()
                try {
                    conn.query(sql, (err, result) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(result)
                        }
                    })
                } catch (e) {
                    reject(e)
                } finally {
                    conn.end()
                }
            } else {
                reject(new Error('SQL解析失败'))
            }
        }
    })
}


module.exports= {
    querySql,
    queryOne,
    insert
}