var express = require('express')
var home = express.Router()
var db = require('db').db
var template = require('template')
var ObjectID = require('mongodb').ObjectID
var xss = require('xss')

home.get('/', function (req, res) {
    res.header('Cache-Control', 'no-cache')
    var tpl = db.collection('tpl')
    //查询所有最后修改后的文档，倒序排列
    tpl.aggregate([
        {
            $sort: {ts: 1}
        },
        {
            $group: {
                _id: "$tplId",
                last_url: {$last: "$ts"},
                name: {$last: '$name'}
            }
        }
    ], function (err, docs) {
        res.render('index', {docs: docs})
    })

})

module.exports = home
