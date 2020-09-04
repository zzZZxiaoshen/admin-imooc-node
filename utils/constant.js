const env = require('./env')

const UPLOAD_PATH = env.env === 'dev' ?
    'E:\\install\\nginx-1.19.2\\nginx-1.19.2\\upload' :
    '/usr/local/nginx_upload'

const UPLOAD_URL = env.env === 'dev' ?
    'localhost:8089' :
    'http://106.13.58.146:8089/nginx_upload'

const OLD_UPLOAD_URL = env.env === 'dev' ?
    'localhost:8089' :
    'http://106.13.58.146:8089/nginx_upload'



module.exports = {
    CODE_ERROR: -1,
    CODE_SUCCESS:0,
    debug:true,
    PRIVATE_KEY:"admin-test",
    JWT_EXPIRED: 5000,
    UPLOAD_PATH, // 上传文件路径 部署的服务的路径地址  程序操作的都是本地目录
    UPLOAD_URL, // 上传文件URL前缀 部署服务器请求地址
    OLD_UPLOAD_URL:OLD_UPLOAD_URL,
    MIME_TYPE_EPUB: 'application/epub+zip',
    CODE_TOKEN_EXPIRED:-2,
    UPDATE_TYPE_FROM_WEB: 1,
}