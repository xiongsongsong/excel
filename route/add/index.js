var express = require('express')
var add = express.Router()
var db = require('db').db
var template = require('template')
var ObjectID = require('mongodb').ObjectID

//检测是否table表达式
var tableRe = template.tableRe

add.get('/page', function (req, res) {
    res.render('add/page')
})

add.post('/page', function (req, res) {

    var body = req.body

    body.name = body.name ? body.name.trim() : ''
    body.url = body.url ? body.url.trim() : ''

    var err = []

    //检测名称
    if (!/^[\u4E00-\u9FA5\w\d\?？!！，,.。-]+$/gi.test(body.name)) {
        err.push('标题只允许汉字、字母、数字、下划线和连字符')
    }

    //检测URL
    if (!/^[\/a-z0-9-_+]+[a-z0-9-_+]+(\.php)?$/.test(body.url)) {
        err.push('页面URL只允许字母、数字、下划线，以php结尾')
    }

    //模板内容不能为空
    if (!body.content || body.content.length < 1) {
        err.push('模板不能为空')
    }

    //检查末尾是否以php结尾
    if (!/\.php$/i.test(body.url)) {
        body.url += '.php'
    }

    //查询页面路径是否已被使用
    //多余的斜杠缩减为1个
    body.url = body.url.replace(/[\/]+/g, '/')

    //重要：约定url第一个字符必须是/
    if (body.url.indexOf('/') !== 0) {
        body.url = '/' + body.url
    }

    //并且防止超过6层的路径
    if (body.url.match(/[\/]/g).length > 6) {
        err.push('目录层级超过6层限制')
    }


    //url不能超过100个字符，为什么是100个？随便定的，100个够长了
    if (body.url.length > 100) {
        err.push('自定义url部分，长度不能超过100个字符')
    }

    if (err.length > 0) {
        res.json({code: -1, msg: err})
        return
    }

    var tpl = db.collection('tpl');
    tpl.findOne({url: body.url}, function (err, item) {
        if (err) {
            res.json({code: -2, err: ['查询页面出错，请稍后再试']})
            return
        }
        if (item) {
            res.json({code: -3, err: ['页面已经存在，请换一个路径']})
            return
        }

        //检索并处理为table表达式的行
        body.content = body.content.split(/\r\n/).map(function (line) {
            //在保存前，生成一个ID放置在模板引擎的末尾
            //此处的ID，在data集合中的key为pageId
            if (tableRe.test(line) && !/_id=[a-z0-9]{24}/.test(line)) {
                return line + ',_id=' + new ObjectID()
            } else {
                return line
            }
        }).join('\r\n')


        tpl.insert({
            name: body.name,
            url: body.url,
            content: body.content,
            ts: Date.now()
        }, function (err, docs) {
            if (err) {
                res.json({code: -4, err: ['入库失败']})
            } else {
                res.json({code: 200, doc: docs[0]})
            }
        });
    })
})

add.get('/block', function (req, res) {
    res.end('list')
})

module.exports = add