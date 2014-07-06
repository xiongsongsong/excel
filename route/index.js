module.exports = function (app) {
    //添加页面、编辑数据等等
    app.use('/page', require('./page'))

    app.use('/', require('./home'))
}