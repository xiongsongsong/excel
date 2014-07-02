define(function (require, exports, module) {

    var Excel = require('../excel/index')
    var excel = new Excel('#data-container', {
        fields: ['姓名', '年龄', '身高', '体重'],
        rows: 8
    })


    excel.on('select', function () {
        //获得第一个节点的坐标信息
        var x = excel.point.startCol
        var y = excel.point.startRow
    })

    excel.resetGridPosition()

})