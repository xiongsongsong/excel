var express = require('express')
var page = express.Router()
var db = require('db').db
var template = require('template')
var ObjectID = require('mongodb').ObjectID
var xss = require('xss')


//针对表格表达式，获取出变量名，group=title，_id等三个参数
var tableRe = /^[\s]*-[\s]*([a-z]+[a-z0-9]*)[\s]*[=＝][\s]*([^\s]+?[=＝][^\s]+?)[,，](.+?)[,，]_id=([a-z0-9]{24})$/

page.get(/^\/preview\/([a-z0-9]{24})[\/]?$/, function (req, res) {

    var tpl = db.collection('tpl')
    //查询出代码
    tpl.findOne({_id: ObjectID(req.params[0])}, function (err, doc) {
        if (err || !doc) {
            res.status(404)
            res.end('该页面不存在')
            return
        }
        //将表格表达式清空，并记录在ids变量中， {变量：数据ID,,,}
        var ids = Object.create(null)
        doc.content = doc.content.split(/[\r\n]/m).map(function (line) {
            if (tableRe.test(line)) {
                ids[RegExp.$1] = {
                    group: RegExp.$2,
                    fields: RegExp.$3,
                    _id: RegExp.$4
                }
                return ''
            } else {
                return line + '\r\n'
            }
        }).join('')

        tpl.find({
            '_id': { $in: Object.keys(ids)}
        }).toArray(function (err, docs) {
            res.render('page/index', {_id: req.params[0]})
        })
    })
})

/*
 * 编辑页面数据
 * */
page.get(/^\/edit-data\/([a-z0-9]{24})[\/]?/, function (req, res) {
    //查询出源代码并扫描出ID，生成前端表格
    var tpl = db.collection('tpl')
    tpl.findOne({_id: ObjectID(req.params[0])}, function (err, doc) {
        if (err || !doc) {
            res.status(404)
            res.end('该页面不存在')
            return
        }
        //将表格表达式清空，并记录在ids变量中， {变量：数据ID,,,}
        var ids = Object.create(null)
        doc.content = doc.content.split(/[\r\n]/m).map(function (line) {
            if (tableRe.test(line)) {
                ids[RegExp.$4] = {
                    name: RegExp.$1,
                    group: RegExp.$2,
                    fields: RegExp.$3
                }
                return ''
            } else {
                return line + '\r\n'
            }
        }).join('')

        var data = db.collection('data')
        data.find({
            'dataId': { $in: Object.keys(ids)}
        }).sort({ts: -1}).limit(Object.keys(ids).length).toArray(function (err, docs) {
            console.log(docs.length)
            res.render('page/edit-data', {_id: req.params[0], ids: ids, docs: docs})
        })
    })
})

//保存编辑数据
//warning:入库暂不做xss，出库的时候才做
page.post(/^\/save-data\/([a-z0-9]{24})[\/]?$/, function (req, res) {

    var arr = []
    Object.keys(req.body).forEach(function (key) {
        if (/^[a-z0-9]{24}$/.test(key)) {
            var obj = {
                data: req.body[key],
                pageId: req.params[0],
                //对应模板中的_id
                dataId: key,
                ts: Date.now()
            }
            arr.push(obj)
        }
    })

    var data = db.collection('data')

    function save() {
        var cur = arr.shift()
        if (!cur) {
            res.end('保存成功')
            return
        }
        data.insert(cur, function (err, result) {
            console.log(err, result)
            save()
        })
    }

    save()

})

module.exports = page
