define(function (require, exports, module) {

    var Excel = require('/excel/index')

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

    function selectStart() {
        //获得第一个节点的坐标信息
        var x = this.point.startCol
        var y = this.point.startRow
        saveCellData.call(this, x, y)
    }

    function blur() {
        //获得第一个节点的坐标信息
        var x = this.point.startCol
        var y = this.point.startRow
        saveCellData.call(this, x, y)
    }

    function select() {
        //获得第一个节点的坐标信息
        var x = this.point.startCol
        var y = this.point.startRow
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
    }

    Object.keys(ids).forEach(function (group, index) {

        //数组含义为：id,描述,类型
        var fields = ids[group].fields.replace(/[＝]+/g, '=').replace(/[，]/g, ',').split(',').map(function (field) {
            return field.split('=').length == 3 ? field.split('=') : undefined;
        }).filter(function (field) {
            return field
        })

        var excel = new Excel('#data-' + index, {
            fields: fields,
            rows: 10
        })

        excel.on('selectStart', function () {
            selectStart.call(excel)
        })

        excel.$input.on('blur', function () {
            blur.call(excel)
        })

        excel.on('select', function () {
            select.call(excel)
        })

        excel.$input.on('mousedown', function (ev) {
            ev.stopPropagation()
        })

        excel.resetGridPosition()

    })

})