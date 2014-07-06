var express = require('express')
var home = express.Router()
var db = require('db').db
var template = require('template')
var ObjectID = require('mongodb').ObjectID
var xss = require('xss')

home.get('/', function (req, res) {
    var tpl = db.collection('tpl')
    //初建立的模板，tplId等于自身的_id
    tpl.find({ $where: "this._id.toString() == this.tplId.toString()" }).toArray(function (err, docs) {
        res.render('index', {docs: docs})
    })
})

module.exports = home
