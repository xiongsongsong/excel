var express = require('express')
var home = express.Router()
var db = require('db').db
var ObjectID = require('mongodb').ObjectID
var xss = require('xss')
var moment = require('moment')
moment.lang('zh-cn')

home.get('/', function (req, res) {
    res.header('Cache-Control', 'no-cache')
    var tpl = db.collection('tpl')
    //查询所有最后修改后的文档，倒序排列
    tpl.aggregate([
        {$project: { name: 1, url: 1, ts: 1, tplId: 1 }},
        {$sort: {ts: -1}},
        {
            $group: {
                _id: "$tplId",
                ts: {$first: "$ts"},
                url: {$first: '$url'},
                name: {$first: '$name'}
            }
        }
    ], function (err, docs) {
        //待解决问题：aggregate不能对返回结果进行再排序？
        //此处临时解决方案，手动排序下
        res.render('index', {docs: docs.reverse(), moment: moment})
    })

})

module.exports = home
