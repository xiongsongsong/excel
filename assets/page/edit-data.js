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
        var x = this.point.startRow
        var y = this.point.startCol
        saveCellData.call(this, x, y)
    }

    function blur() {
        //获得第一个节点的坐标信息
        var x = this.point.startRow
        var y = this.point.startCol
        saveCellData.call(this, x, y)
    }

    function select() {
        //获得第一个节点的坐标信息
        var x = this.point.startRow
        var y = this.point.startCol
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
        var fields = ids[group].fields.replace(/[：:]+/g, ':').replace(/[，]/g, ',').split(',').map(function (field) {
            var f = field.split(':')
            //如果没有填写第三个参数，则默认认为是string类型的
            if (f.length === 3) {
                return f
            } else if (f.length === 2) {
                f.push('string')
                return f
            }
        }).filter(function (field) {
            return field
        })

        var excel = new Excel('#data-' + index, {
            fields: fields,
            rows: 10,
            dataId: group
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
            if (excel.$input.val().trim().length > 0) {
                ev.stopPropagation()
            }

        })

        excel.resetGridPosition()

    })

    //回填数据
    docs.forEach(function (doc) {
        var $table = $('div[data-table=' + doc.dataId + ']')
        var fieldMap = {}
        var colNode = $table.data('table').colNode
        var $content = $table.data('table').$content
        for (var i = 0; i < colNode.length; i++) {
            var obj = colNode[i];
            fieldMap[obj.getAttribute('data-name')] = i
        }

        doc.data.forEach(function (result, x) {
            Object.keys(result).forEach(function (fieldName) {
                if (fieldMap[fieldName] === undefined) return;
                $content.append($('<i x="' + x + '" y="' + fieldMap[fieldName] + '">' + result[fieldName] + '</i>'))
            })
        })
    })

    //点击保存数据的时候
    //todo:只应该对修改过的数据进行保存，而不是每次都全部保存一份
    $('.save-btn').on('click', function () {
        var data = {}
        $('div[data-table]').each(function (i, $table) {
            $table = $($table)
            var dataId = $table.attr('data-table')
            data[dataId] = $table.data('table').getData()
        })

        var $this = $(this)
        $.ajax({
            url: '/page/save-data/' + $this.attr('_id'),
            type: 'POST',
            data: data
        }).done(function (data) {
            location.href = '/page/preview/' + $this.attr('_id')
        })

    })

})