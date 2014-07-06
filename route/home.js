var express = require('express')
var home = express.Router()
var db = require('db').db
var template = require('template')
var ObjectID = require('mongodb').ObjectID
var xss = require('xss')

home.get('/', function (req, res) {
    var tpl = db.collection('tpl')
    tpl.find({}, {_id: 1, name: 1, ts: 1, url: 1})
        .sort({ts: -1}).toArray(function (err, docs) {
            res.render('index', {docs: docs})
        })
})

module.exports = home
