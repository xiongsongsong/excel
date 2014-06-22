define(function (require) {

    require('/jquery/jquery-2.1.1.min')

    var $head = $('head')

    function Excel(selector) {

        var id = Math.random().toString().substring(2) + Date.now()
        this.styleNodeId = 'style' + id

        $('<style style="text/css" id="' + this.styleNodeId + '"></style>').appendTo($head)

        this.$styleNode = $('#' + this.styleNodeId)

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

        $('<div id="excel-' + id + '">' +
            '<div class="excel-wrapper">' +
            '<div class="excel-content">' +
            '<div class="fields">' + fieldsStr + '</div>' +
            '<div class="rows">' + rowStr + '</div>' +
            '</div>' +
            '</div>' +
            '</div>').appendTo($(selector))

        this.nodeId = '#excel-' + id
        var $node = $(this.nodeId)
        var $wrapper = $node.find('div.excel-wrapper')
        var $fields = $node.find('>div.excel-wrapper>div.excel-content>div.fields')
        var $rows = $node.find('>div.excel-wrapper>div.excel-content>div.rows')

        $wrapper.on('scroll', function () {
            var $this = $(this)
            var left = $this.scrollTop()
            var top = $this.scrollLeft()
            $fields.css('top', $this.scrollTop()).toggleClass('overflow', top > 10)
            $rows.css('left', $this.scrollLeft()).toggleClass('overflow', left > 10)
        })

        //存放几个关键元素的引用
        this.$content = $wrapper.find('>div.excel-content')
        this.fieldsNode = $fields[0].getElementsByTagName('span')
        this.rowsNode = $rows[0].getElementsByTagName('div')
    }

    /*
     * 重置网格线
     * */
    Excel.prototype.resetGridPosition = function () {

        var cssText = []

        for (var i = 0; i < this.fieldsNode.length; i++) {
            cssText.push('url(field.png) ' + this.fieldsNode[i].offsetLeft + 'px 0 repeat-y')
        }

        for (var j = 0; j < this.rowsNode.length; j++) {
            cssText.push('url(rows.png) 0 ' + this.rowsNode[j].offsetTop + 'px repeat-x')
        }

        this.$content.css({
            width: this.fieldsNode[this.fieldsNode.length - 1].offsetLeft + this.fieldsNode[this.fieldsNode.length - 1].offsetWidth,
            height: this.rowsNode[this.rowsNode.length - 1].offsetTop + this.rowsNode[this.rowsNode.length - 1].offsetHeight
        })

        this.$styleNode.html(this.nodeId + ' .excel-content{background:' + cssText.join(',') + ';' + '}')
        console.log(this.nodeId + ' .excel-content{' + cssText.join(',') + ';' + '}')

    }

//    Excel.prototype.resetRowsPosition = function () {
//
//    }

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


    var excel = new Excel('#data-container')
    setInterval(function () {
        excel.resetGridPosition()
    }, 1000)

})