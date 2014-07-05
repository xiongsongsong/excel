define(function (require, exports, module) {

    var Excel = require('../excel/index')
    var excel = new Excel('#data-container', {
        fields: ['姓名', '年龄', '身高', '体重'],
        rows: 10
    })


})