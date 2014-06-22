module.exports = function (app) {

    app.use('/song', require('./song'))

    app.get('/', function (req, res) {
        res.render('index')
    })
}