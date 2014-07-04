var express = require('express')
var app = express(), path = require('path')
var bodyParser = require('body-parser')

require('db').connect(function () {

    app.locals.basedir = './views'
    app.set('view engine', 'jade')
    app.set('view cache', false)

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded())

    // parse application/json
    app.use(bodyParser.json())

    app.use(require('stylus').middleware(__dirname + '/assets'))
    app.use(express.static(path.join(__dirname, 'assets')))

    require('./route')(app)
    app.listen(3000)
})
