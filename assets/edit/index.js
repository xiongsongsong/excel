define(function (require, exports, module) {

    var Excel = require('../excel/index')
    var excel = new Excel('#data-container', {
        fields: ['姓名', '年龄', '身高', '体重'],
        rows: 10
    })

    function saveCellData(x, y) {
        var val = this.$input.val().trim()
        if (!val) return;
        var $node = this.$content.find('i[x=' + x + '][y=' + y + ']')
        if ($node.length < 1) {
            $('<i x="' + x + '" y="' + y + '"></i>').text(val).appendTo(this.$content)
        } else {
            $node.text(val)
        }
        $node.show()
        this.$input.val('')
    }

    function readCellData() {

    }

    excel.on('selectStart', function () {
        //获得第一个节点的坐标信息
        var x = excel.point.startCol
        var y = excel.point.startRow
        saveCellData.call(excel, x, y)
    })

    excel.$input.on('blur', function () {
        //获得第一个节点的坐标信息
        var x = excel.point.startCol
        var y = excel.point.startRow
        saveCellData.call(excel, x, y)
    })

    excel.on('select', function () {
        //获得第一个节点的坐标信息
        var x = excel.point.startCol
        var y = excel.point.startRow
        //读取那个节点的数据
        var $node = this.$content.find('i[x=' + x + '][y=' + y + ']')
        if ($node.length > 0) {
            this.$input.val($node.text())
        }
        $node.hide()
        var self = this
        setTimeout(function () {
            self.$input.focus()
        }, 0)
    })

    excel.$input.on('mousedown', function (ev) {
        ev.stopPropagation()
    })

    excel.resetGridPosition()

})