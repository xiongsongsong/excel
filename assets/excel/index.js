define(function (require) {

        require('/jquery/jquery-2.1.1.min')

        var $head = $('head')
        var $document = $(document)

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
            this.$wrapper = $wrapper
            this.$content = $wrapper.find('>div.excel-content')
            this.colNode = $fields[0].getElementsByTagName('span')
            this.rowNode = $rows[0].getElementsByTagName('div')

            var self = this

            //插入编辑节点
            self.$content.append($('<div class="input"><textarea></textarea></div>'))

            //输入框节点
            self.$select = self.$content.find('>div.input')
            self.$input = self.$select.find('>textarea')

            this.$input.on('input', function (ev) {
                console.log('正在输入', this.value)
            })

            var initX, initY, stopX, stopY;
            var initPageX, initPageY

            self.$content.on('mousedown', bind)

            function bind(ev) {
                initX = ev.offsetX, initY = ev.offsetY
                initPageX = ev.pageX, initPageY = ev.pageY
                recordXY(ev)
                $document.on('mousemove', recordXY)
                $document.on('mouseup', off)
            }

            function off() {
                $document.off('mousemove', recordXY)
                $document.off('mouseup', off)
                initX = initY = stopX = stopY = initPageX = initPageY = 0
            }

            //记录相对于content的xy
            function recordXY(ev) {
                stopX = ev.pageX -initPageX + initX
                stopY = ev.pageY - initPageY + initY
                self.resetInput({start: self.getPoint(initX, initY), stop: self.getPoint(stopX, stopY)})
            }

        }

        /*
         * 重置网格线
         * */
        Excel.prototype.resetGridPosition = function () {

            var cssText = []

            for (var i = 0; i < this.colNode.length; i++) {
                cssText.push('url(field.png) ' + this.colNode[i].offsetLeft + 'px 0 repeat-y')
            }

            for (var j = 0; j < this.rowNode.length; j++) {
                cssText.push('url(rows.png) 0 ' + this.rowNode[j].offsetTop + 'px repeat-x')
            }

            var lastField = this.colNode[this.colNode.length - 1]
            var lastRow = this.rowNode[this.rowNode.length - 1]
            this.$content.css({
                width: lastField.offsetLeft + lastField.offsetWidth,
                height: lastRow.offsetTop + lastRow.offsetHeight
            })

            this.$styleNode.html(this.nodeId + ' .excel-content{background:' + cssText.join(',') + ';' + '}')
        }

        /*
         * 获取x,y所在的单元格范围
         * @x {Number} x坐标
         * @y {Number} y坐标
         * @Return {colIndex:Number,rowIndex:Number} 返回列和行索引
         * */
        Excel.prototype.getPoint = function (x, y) {
            var rowIndex = 0, columnIndex = 0

            for (var i = 0; i < this.colNode.length; i++) {
                var obj = this.colNode[i]
                if (obj.offsetLeft > x) {
                    columnIndex = i - 1
                    break
                }
            }

            for (var j = 0; j < this.rowNode.length; j++) {
                if (this.rowNode[j].offsetTop > y) {
                    rowIndex = j - 1
                    break
                }
            }

            return {
                colIndex: columnIndex,
                rowIndex: rowIndex
            }

        }

        /*
         *
         * 定位单元格到某个字段或区域
         * */

        Excel.prototype.resetInput = function (o) {


            var startCol = o.start.colIndex <= o.stop.colIndex ? o.start.colIndex : o.stop.colIndex
            var startRow = o.start.rowIndex <= o.stop.rowIndex ? o.start.rowIndex : o.stop.rowIndex

            var endCol = o.stop.colIndex >= o.start.colIndex ? o.stop.colIndex : o.start.colIndex
            var endRow = o.stop.rowIndex >= o.start.rowIndex ? o.stop.rowIndex : o.start.rowIndex

            console.log(startCol, startRow, endCol, endRow)

            //

            if (startCol < 0) startCol = 0
            if (startRow < 0) startRow = 0
            if (endCol > this.colNode.length) endCol = this.colNode.length - 1
            if (endRow > this.rowNode.length) endRow = this.rowNode.length - 1

            this.$select.css({
                left: this.colNode[startCol].offsetLeft,
                width: this.colNode[endCol].offsetWidth + this.colNode[endCol].offsetLeft - this.colNode[startCol].offsetLeft,
                top: this.rowNode[startRow].offsetTop,
                height: this.rowNode[endRow].offsetHeight + this.rowNode[endRow].offsetTop - this.rowNode[startRow].offsetTop
            })

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

    }
)