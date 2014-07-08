var express = require('express')
var page = express.Router()
var db = require('db').db
var template = require('template')
var ObjectID = require('mongodb').ObjectID
var xss = require('xss')

//针对表格表达式，获取出变量名，group=title，_id等三个参数
var tableRe = template.tableRe


//添加模板
page.get(/^\/(add|edit-tpl(?:\/([a-z0-9]{24})))[\/]?$/, function (req, res) {

    if (req.params[0].indexOf('add') > -1) {
        res.render('page/add', {doc: false})
        return
    }
    try {
        var tplId = ObjectID(req.params[1])
    } catch (e) {
        res.end('参数错误')
        return
    }

    var tpl = db.collection('tpl')
    //查询出代码
    tpl.find({tplId: tplId}).sort({ts: -1}).limit(1).toArray(function (err, doc) {
        if (err || !doc || doc.length < 1) {
            res.status(404)
            res.end('该页面不存在')
            return
        }
        res.render('page/add', {doc: doc[0]})
    })
})

//保存页面
page.post('/add', add)

//预览页面
page.get(/^\/preview\/([a-z0-9]{24})[\/]?$/, preview)

//编辑数据页面
page.get(/^\/edit-data\/([a-z0-9]{24})[\/]?/, editData)

//保存编辑后的数据
page.post(/^\/save-data\/([a-z0-9]{24})[\/]?$/, saveData)

//预览页面
function preview(req, res) {
    var tpl = db.collection('tpl')

    try {
        var tplId = ObjectID(req.params[0])
    } catch (e) {
        res.end('error')
        return
    }

    //查询出代码
    tpl.find({tplId: tplId}).sort({ts: -1}).limit(1).toArray(function (err, doc) {
        if (err || !doc || doc.length < 1) {
            res.status(404)
            res.end('该页面不存在')
            return
        }

        //将表格表达式清空，并记录在ids变量中， {变量：数据ID,,,}
        var ids = Object.create(null)
        doc = doc[0]
        doc.content = doc.content.split(/\r\n/).filter(function (line) {
            if (tableRe.test(line)) {
                //$1：代表变量名
                //$2：group和title，group指组，title指组下某个“表”
                //$3：代表字段的定义
                ids[RegExp.$4] = {
                    name: RegExp.$1,
                    group: RegExp.$2,
                    fields: RegExp.$3
                }
                return false
            } else {
                return true
            }
        }).join('\r\n')

        var data = db.collection('data')

        data.aggregate(
            {$match: {
                dataId: {$in: Object.keys(ids)}
            }},
            {$sort: {ts: -1}},
            {
                $group: {
                    _id: "$dataId",
                    data: {$first: '$data'}
                }
            }, function (err, docs) {

                if (err) {
                    res.end('查询数据表出错' + err)
                    return
                }

                var objectIdList = docs.map(function (tb) {
                    return 'var _' + tb._id + ' = ' + JSON.stringify(tb.data)
                }).join('\r\n')


                //将本地变量指向objectID
                var dataStr = Object.keys(ids).map(function (tb) {
                    var _var = '_' + tb
                    //防止无数据时的报错
                    return 'var ' + ids[tb].name + ' = typeof ' + _var + '!=="undefined" ? ' + _var + ':[];\r\n' +
                        //如果记录只有一条，那么直接将变量指向数组的0，这样就不必写forEach了
                        ids[tb].name + ' = ' + ids[tb].name + '.length===1 ? ' + ids[tb].name + '[0] : ' + ids[tb].name
                }).join('\r\n')

                //需要调试时，打印 evalStr 进行检查
                var evalStr = objectIdList + '\r\n' + dataStr + '\r\n' + template.render(doc.content)
                try {
                    console.log(evalStr)
                    res.render('page/index', {
                        content: eval(evalStr), data: docs, _id: tplId.toString()
                    })
                } catch (e) {
                    res.end('模板解析出错，原因：\r\n' + e.toString() + '\r\n-----------------\r\n' + evalStr)
                }
            })
    })
}

function editData(req, res) {

    //查询出源代码并扫描出ID，生成表格
    var tpl = db.collection('tpl')

    //查询出模板源码
    tpl.findOne({tplId: ObjectID(req.params[0])}, {sort: [
        ['ts', -1]
    ]}, function (err, doc) {
        if (err || !doc) {
            res.status(404)
            res.end('该页面不存在')
            return
        }
        //将表格表达式清空，并记录在ids变量中， {变量：数据ID,,,}
        var ids = Object.create(null)
        doc.content = doc.content.split(/\r\n/).filter(function (line) {
            //$1：代表变量名
            //$2：group和title，group指组，title指组下某个“表”
            //$3：代表字段的定义
            //
            if (tableRe.test(line)) {
                ids[RegExp.$4] = {
                    name: RegExp.$1,
                    group: RegExp.$2,
                    fields: RegExp.$3
                }
                return false
            } else {
                return true
            }
        }).join('\r\n')

        var data = db.collection('data')
        data.find({
            'dataId': { $in: Object.keys(ids)}
        }).sort({ts: -1}).limit(Object.keys(ids).length).toArray(function (err, docs) {
            res.render('page/edit-data', {_id: req.params[0], ids: ids, docs: docs})
        })
    })
}


function saveData(req, res) {
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
            save()
        })
    }

    save()

}


//新建和编辑模板，使用同一个方法
function add(req, res) {

    var body = req.body

    body.name = body.name ? body.name.trim() : ''
    body.url = body.url ? body.url.trim() : ''

    var err = []

    try {
        var tplId = ObjectID(body.tplId)
    } catch (e) {
        res.end('error')
        return
    }

    //检测名称
    if (!/^[\u4E00-\u9FA5\w\d\?？!！，,.。-]+$/gi.test(body.name)) {
        err.push('标题只允许汉字、字母、数字、下划线和连字符')
    }

    //更新模板时，只需要检测模板内容和模板名称，下面的就不需要检测了
    if (body.tplId === undefined) {
        //检测URL
        if (!/^[\/a-z0-9-_+]+$/.test(body.url)) {
            err.push('页面URL只允许字母、数字、下划线')
        }

        //模板内容不能为空
        if (!body.content || body.content.length < 1) {
            err.push('模板不能为空')
        }

        //查询页面路径是否已被使用
        //多余的斜杠缩减为1个
        body.url = body.url.replace(/[\/]+/g, '/')

        //重要：去掉首斜杠
        if (body.url.indexOf('/') === 0) {
            body.url = body.url.substring(1)
        }

        //并且防止超过6层的路径
        var slashNum = body.url.match(/[\/]/g)
        if (slashNum && slashNum.length > 6) {
            err.push('目录层级超过6层限制')
        }


        //url不能超过100个字符，为什么是100个？随便定的，100个够长了
        if (body.url.length > 100) {
            err.push('自定义url部分，长度不能超过100个字符')

        }
    }

    if (err.length > 0) {
        res.json({code: -1, msg: err})
        return
    }

    //todo:权限控制尚未完成，目前可以随意篡改编辑历史

    var tpl = db.collection('tpl');
    tpl.findOne({tplId: tplId}, {sort: [
        ['ts', -1]
    ]}, function (err, doc) {

        if (err) {
            res.json({code: -2, err: ['查询页面出错，请稍后再试']})
            return
        }

        //如果不存在tplId，则说明是新建模板
        //并进一步检查是否已经有该记录了，有则说明url重复，则拒绝添加
        //一个tplID对应一个url
        if (!req.body.tplId && doc) {
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

        var _id = new ObjectID()
        var data = {
            _id: _id,
            name: body.name,
            //初建的模板，doc是查不出来的，因此从body.url中获取
            //修改模板的时候，doc必然有值，因此从doc.url中获取
            url: doc ? doc.url : body.url,
            content: body.content,
            ts: Date.now()
        }

        //如果存在tplId，则为更新模板操作，否则认为是新建页面
        if (body.tplId && /^[a-z0-9]{24}$/.test(body.tplId)) {
            data['tplId'] = ObjectID(body.tplId)
        } else {
            data['tplId'] = _id
        }

        //每次修改模板都是新增记录
        tpl.insert(data, function (err, docs) {
            if (err) {
                res.json({code: -4, err: ['入库失败']})
            } else {
                res.json({code: 200, doc: docs[0]})
            }
        });
    })
}

module.exports = page



