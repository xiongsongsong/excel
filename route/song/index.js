var express = require('express')
var song = express.Router()

song.get('/', function (req, res) {
    res.end('home')
})

song.get('/song/list', function (req, res) {
    res.end('list')
})

module.exports = song