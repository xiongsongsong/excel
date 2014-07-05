module.exports = function (app) {

    //添加页面或区块
    app.use('/add', require('./add'))
    //显示页面效果、编辑页面数据、发布页面
    app.use('/page', require('./page'))

    app.get('/', function (req, res) {
        res.render('index')
    })
}