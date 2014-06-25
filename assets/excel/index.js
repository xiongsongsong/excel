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
                '<p id="info"></p>' +
                '</div>').appendTo($(selector))


            this.nodeId = '#excel-' + id
            var $node = $(this.nodeId)
            var $wrapper = $node.find('div.excel-wrapper')
            var $fields = $node.find('>div.excel-wrapper>div.excel-content>div.fields')
            var $rows = $node.find('>div.excel-wrapper>div.excel-content>div.rows')

            this.$fields = $fields
            this.$rows = $rows


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

            var initX, initY, initPageX, initPageY

            var initScrollLeft = 0, initScrollTop = 0, currentScrollLeftOffset = 0, currentScrollTopOffset = 0

            self.$content.on('mousedown', bind)

            function bind(ev) {

                self.$input.trigger('blur')

                var offset = self.$content.offset()

                //记录初始点击的坐标
                initX = ev.pageX - offset.left, initY = ev.pageY - offset.top

                //记录初始的pageX，pageY
                initPageX = ev.pageX, initPageY = ev.pageY

                //记录初始的的scrollLeft,scrollTop
                initScrollLeft = self.$wrapper.scrollLeft()
                initScrollTop = self.$wrapper.scrollTop()

                recordXY(ev)
                $document.on('mousemove', recordXY)
                $document.on('selectstart', preventDefaultSelectStart)
                $document.on('mouseup', off)
                self.$wrapper.on('scroll', scrollOffset)
                setTimeout(function () {
                    self.$input.focus()
                }, 0)
            }

            function preventDefaultSelectStart(ev) {
                ev.preventDefault()
            }

            function off() {
                $document.off('mousemove', recordXY)
                $document.off('selectstart', preventDefaultSelectStart)
                initX = initY = initPageX = initPageY = 0
                initScrollLeft = 0
                initScrollTop = 0
                currentScrollLeftOffset = 0
                currentScrollTopOffset = 0
                $document.off('mouseup', off)
                self.$wrapper.off('scroll', scrollOffset)
            }

            //计算scroll滚动后的差值
            function scrollOffset() {
                currentScrollLeftOffset = self.$wrapper.scrollLeft() - initScrollLeft
                currentScrollTopOffset = self.$wrapper.scrollTop() - initScrollTop
            }

            //记录相对于content的xy
            function recordXY(ev) {
                var stopX = ev.pageX - initPageX + initX + currentScrollLeftOffset
                var stopY = ev.pageY - initPageY + initY + currentScrollTopOffset
                self.getPointOffset({start: self.getPoint(initX, initY), stop: self.getPoint(stopX, stopY)})
                self.setPointOffset()
            }

            //默认选中第0个单元格
            this.point = {
                startCol: 0,
                startRow: 0,
                endCol: 0,
                endRow: 0
            }

            this.setPointOffset()

            //开始绑定输入框

            this.$input.on('blur', function (ev) {

                var value = this.value
                console.log('当前位置', self.point.startCol, self.point.startRow, '内容' + value)
                var startCol = self.point.startCol
                var startRow = self.point.startRow
                var selector = 'i[x=' + startCol + '][y=' + startRow + ']'

                var $node = self.$content.find(selector)
                if ($node.length < 1) {
                    self.$content.append('<i x="' + startCol + '" y="' + startRow + '"></i>')
                    $node = self.$content.find(selector)
                }
                $node.text(value).show()
                this.value = ''
            })

            this.$input.on('focus', function () {
                var startCol = self.point.startCol
                var startRow = self.point.startRow
                var selector = 'i[x=' + startCol + '][y=' + startRow + ']'
                $node = self.$content.find(selector)
                if ($node.length > 0) {
                    this.value = $node.text()
                    $node.hide()
                }
            })


        }

        /*
         * 重置网格线
         * */
        Excel.prototype.resetGridPosition = function () {

            var cssText = []
            var gridOffset = []

            var fieldHeight = this.$fields.height()
            var rowWidth = this.$rows.width()
            for (var i = 0; i < this.colNode.length; i++) {
                var left = this.colNode[i].offsetLeft
                var width = this.colNode[i].offsetWidth
                cssText.push('url(field.png) ' + left + 'px 0 repeat-y')
                //字段x方位的坐标
                gridOffset.push(this.nodeId + ' [x="' + i + '"]{' +
                    'left:' + ( left + rowWidth) + 'px;' +
                    'width:' + width + 'px;' +
                    '}')
            }

            for (var j = 0; j < this.rowNode.length; j++) {
                var top = this.rowNode[j].offsetTop
                var height = this.rowNode[j].offsetHeight
                cssText.push('url(rows.png) 0 ' + top + 'px repeat-x')
                gridOffset.push(this.nodeId + ' [y="' + j + '"]{' +
                    'top:' + (top + fieldHeight) + 'px;' +
                    'height:' + height + 'px;' +
                    '}')
            }

            var lastField = this.colNode[this.colNode.length - 1]
            var lastRow = this.rowNode[this.rowNode.length - 1]
            this.$content.css({
                width: lastField.offsetLeft + lastField.offsetWidth,
                height: lastRow.offsetTop + lastRow.offsetHeight
            })

            //网格线的坐标
            var rule = this.nodeId + ' .excel-content{background:' + cssText.join(',') + ';' + '}'
            rule += gridOffset.join('\r\n')
            //各个单元格的坐标

            this.$styleNode.html(rule)


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
                if (obj.offsetLeft + obj.offsetWidth >= x) {
                    columnIndex = i
                    break
                }
            }

            for (var j = 0; j < this.rowNode.length; j++) {
                if (this.rowNode[j].offsetTop + this.rowNode[j].offsetHeight >= y) {
                    rowIndex = j
                    break
                }
            }

            //判断x或y是否超过了任何一个元素
            if (x >= this.$wrapper[0].scrollWidth - this.$rows.width()) {
                columnIndex = this.colNode.length - 1
            }

            if (y >= this.$wrapper[0].scrollHeight - this.$fields.height()) {
                rowIndex = this.rowNode.length - 1
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

        Excel.prototype.getPointOffset = function (o) {


            var startCol = o.start.colIndex < o.stop.colIndex ? o.start.colIndex : o.stop.colIndex
            var startRow = o.start.rowIndex < o.stop.rowIndex ? o.start.rowIndex : o.stop.rowIndex

            var endCol = o.stop.colIndex > o.start.colIndex ? o.stop.colIndex : o.start.colIndex
            var endRow = o.stop.rowIndex > o.start.rowIndex ? o.stop.rowIndex : o.start.rowIndex

            if (startCol < 0) startCol = 0
            if (startRow < 0) startRow = 0
            if (endCol > this.colNode.length) endCol = this.colNode.length - 1
            if (endRow > this.rowNode.length) endRow = this.rowNode.length - 1

            console.log(startCol, startRow, endCol, endRow)

            this.point = {
                startCol: startCol,
                startRow: startRow,
                endCol: endCol,
                endRow: endRow
            }
        }

        Excel.prototype.setPointOffset = function () {
            var point = this.point
            this.$select.css({
                left: this.colNode[point.startCol].offsetLeft,
                width: this.colNode[point.endCol].offsetWidth + this.colNode[point.endCol].offsetLeft - this.colNode[point.startCol].offsetLeft,
                top: this.rowNode[point.startRow].offsetTop + this.rowNode[point.startRow].offsetHeight,
                height: this.rowNode[point.endRow].offsetHeight + this.rowNode[point.endRow].offsetTop - this.rowNode[point.startRow].offsetTop
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