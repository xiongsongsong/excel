define(function (require) {

    require('/jquery/jquery-2.1.1.min')

    var $head = $('head')

    function Excel(selector, config) {

        var id = Math.random().toString().substring(2) + Date.now()
        $('<style style="text/css" id="style-' + id + '"></style>').appendTo($head)

        console.log(config)

        var fieldsStr = ''
        for (var i = 65; i <= 90; i++) {
            var word = String.fromCharCode(i)
            fieldsStr += '<span class="' + word.toLowerCase() + '">' + word + '</span>'
        }

        var rowStr = ''
        for (var j = 1; j < 50; j++) {
            rowStr += '<div class="r' + j + '"><p>' + j + '</p></div>'
        }

        //创建字段

        $('<div id="' + id + '">' +
            '<div class="excel-wrapper">' +
            '<div class="excel-content">' +
            '<div class="fields">' + fieldsStr + '</div>' +
            '<div class="rows">' + rowStr + '</div>' +
            '</div>' +
            '</div>' +
            '</div>').appendTo($(selector))

        var $node = $('#' + id)
        var $wrapper = $node.find('div.excel-wrapper')
        var $fields = $node.find('>div.excel-wrapper>div.excel-content>div.fields')
        var $rows = $node.find('>div.excel-wrapper>div.excel-content>div.rows')


        $wrapper.on('scroll', function (ev) {
            var $this = $(this)
            var left = $this.scrollTop()
            var top = $this.scrollLeft()
            $fields.css('top', $this.scrollTop()).toggleClass('overflow', top > 10)
            $rows.css('left', $this.scrollLeft()).toggleClass('overflow', left > 10)
        })

    }

    /*
     * 重置列宽
     * */
    Excel.prototype.resetColumnsPosition = function () {

    }

    Excel.prototype.resetRowsPosition = function () {

    }

    /*
     * 增加一行
     * @index {Number} 行号
     * @before {boolean} 在前插入还是在之后
     * */
//    Excel.prototype.addRow = function (index, boolean) {
//
//    }
//
//    /*
//     * 增加一列行
//     * @index {Number} 字段号
//     * @before {boolean} 在前插入还是在之后
//     * */
//    Excel.prototype.addColumn = function (index, boolean) {
//
//    }


    new Excel('#data-container', {})

})