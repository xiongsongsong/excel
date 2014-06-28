var express = require('express')
var app = express(), path = require('path')

require('db')
require('./route')(app)

app.set('view engine', 'jade')
app.set('view cache', false)

app.use(require('stylus').middleware(__dirname + '/assets'))
app.use(express.static(path.join(__dirname, 'assets')))

app.listen(3000)


