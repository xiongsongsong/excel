module.exports = function (app) {

    app.use('/add', require('./add'))

    app.get('/', function (req, res) {
        res.render('index')
    })
}