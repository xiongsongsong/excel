define(function (require, exports, module) {

        require('/jquery/jquery-2.1.1.min')

        var $head = $('head')
        var $document = $(document)
        var maxRow = 10000
        var maxField = 26

        function Excel(selector, cfg) {
            var self = this

            var id = +(new Date()) + '' + Math.random().toString().substring(2, 8)
            this.styleNodeId = 'excel-style-' + id

            $('<style style="text/css" id="' + this.styleNodeId + '"></style>').appendTo($head)

            this.$styleNode = $('#' + this.styleNodeId)

            var fieldsStr = ''

            cfg.fields.forEach(function (item) {
                fieldsStr += '<span data-name="' + item[0] + '" data-type="' + item[2] + '">' + item[1] + '</span>'
            })

            var rowStr = ''
            for (var j = 0; j < cfg.rows; j++) {
                rowStr += '<div class="r' + j + '"><p>' + (j + 1) + '</p></div>'
            }

            //创建字段

            $('<div id="excel-' + id + '">' +
                '<div class="excel-wrapper" tabindex="0">' +
                '<div class="excel-content">' +
                '<div class="fields">' + fieldsStr + '</div>' +
                '<div class="rows">' + rowStr + '</div>' +
                '</div>' +
                '</div>' +
                '<p id="info"></p>' +
                '</div>').appendTo($(selector).attr('data-table', cfg.dataId).data('table', self))


            this.nodeId = '#excel-' + id
            var $node = $(this.nodeId)
            var $wrapper = $node.find('div.excel-wrapper')
            var $fields = $node.find('>div.excel-wrapper>div.excel-content>div.fields')
            var $rows = $node.find('>div.excel-wrapper>div.excel-content>div.rows')

            this.$fields = $fields
            this.$rows = $rows

            //存储事件队列
            this.eventQueue = []

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


            //插入编辑节点
            self.$content.append($('<div class="select"><textarea></textarea></div>'))
            //输入框节点
            self.$select = self.$content.find('>div.select')
            self.$input = self.$content.find('textarea')

            var initX, initY, initPageX, initPageY

            var initScrollLeft = 0, initScrollTop = 0, currentScrollLeftOffset = 0, currentScrollTopOffset = 0

            self.$content.on('mousedown', bind)

            function bind(ev) {
                self.trigger('selectStart', self.point)

                var offset = self.$content.offset()

                //记录初始点击的坐标
                initX = ev.pageX - offset.left, initY = ev.pageY - offset.top

                //记录初始的pageX，pageY
                initPageX = ev.pageX, initPageY = ev.pageY

                //记录初始的的scrollLeft,scrollTop
                initScrollLeft = self.$wrapper.scrollLeft()
                initScrollTop = self.$wrapper.scrollTop()

                recordXY(ev)
                /*$document.on('mousemove', recordXY)
                 $document.on('selectstart', preventDefaultSelectStart)*/
                $document.on('mouseup', off)
                self.$wrapper.on('scroll', scrollOffset)
            }

            function preventDefaultSelectStart(ev) {
                ev.preventDefault()
            }

            function off() {

                self.trigger('select', self.point)

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
                self.getPointOffset(initX, initY, {start: self.getPoint(initX, initY), stop: self.getPoint(stopX, stopY)})

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


            //键盘控制单元格
            self.$wrapper.on('keydown', function (ev) {

                if ([9, 13, 38, 40].indexOf(ev.keyCode) < 0) {
                    return
                }

                var shift = ev.shiftKey
                var alt = ev.altKey

                if (ev.keyCode == 13 && alt) return;

                self.trigger('selectStart')

                ev.preventDefault()

                var colLength = self.colNode.length
                var rowLength = self.rowNode.length

                function left() {
                    self.point.startCol -= 1
                    if (self.point.startCol < 0) {
                        self.point.startCol = 0
                        if (self.point.startRow > 0) {
                            self.point.startCol = colLength - 1
                            up()
                        }
                    }
                    self.point.endRow = self.point.startRow
                    self.point.endCol = self.point.startCol
                }

                function up() {
                    self.point.startRow -= 1
                    if (self.point.startRow < 0) self.point.startRow = 0
                    if (self.point.endRow < 0) self.point.endRow = 0
                    self.point.endRow = self.point.startRow
                    self.point.endCol = self.point.startCol
                }

                function right() {
                    self.point.startCol += 1
                    self.point.endCol = self.point.startCol
                    if (self.point.startCol > colLength - 1) {
                        if (self.point.startRow < rowLength - 1) {
                            self.point.startCol = self.point.endCol = 0
                            down()
                        } else {
                            self.point.startCol = self.point.endCol = colLength - 1
                        }
                    }
                    self.point.endRow = self.point.startRow
                }

                function down() {
                    self.point.endRow = self.point.startRow
                    self.point.endRow += 1
                    if (self.point.startRow > rowLength - 1) self.point.startRow = rowLength - 1
                    if (self.point.endRow > rowLength - 1) self.point.endRow = rowLength - 1
                    self.point.startRow = self.point.endRow
                    self.point.endCol = self.point.startCol
                }

                if (ev.keyCode == 9) {
                    shift ? left() : right()
                } else if (ev.keyCode == 13) {
                    shift ? up() : down()
                } else if (ev.keyCode === 38) {

                    up()
                } else if (ev.keyCode == 40) {
                    down()
                }
                self.setPointOffset()
                self.trigger('select')
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
                cssText.push('url(/excel/field.png) ' + left + 'px 0 repeat-y')
                //字段x方位的坐标
                gridOffset.push(this.nodeId + ' [x="' + i + '"]{' +
                    'left:' + ( left + rowWidth) + 'px;' +
                    'width:' + width + 'px;' +
                    '}')
            }

            for (var j = 0; j < this.rowNode.length; j++) {
                var top = this.rowNode[j].offsetTop
                var height = this.rowNode[j].offsetHeight
                cssText.push('url(/excel/rows.png) 0 ' + top + 'px repeat-x')
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
         * 添加事件
         * @type {String} 事件类型
         * @fn {Function} 回调
         * */
        Excel.prototype.on = function (type, fn) {
            if (!this.eventQueue[type]) this.eventQueue[type] = []
            this.eventQueue[type].push(fn)
        }

        /*
         * 触发某个事件
         * @type {Sting} 触发的事件类型
         * */
        Excel.prototype.trigger = function (type, result) {
            var bingo = this.eventQueue[type]
            if (!bingo) return
            for (var i = 0; i < bingo.length; i++) {
                bingo[i].call(this, result)
            }
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

        Excel.prototype.getPointOffset = function (x, y, o) {

            var startCol = o.start.colIndex < o.stop.colIndex ? o.start.colIndex : o.stop.colIndex
            var startRow = o.start.rowIndex < o.stop.rowIndex ? o.start.rowIndex : o.stop.rowIndex

            var endCol = o.stop.colIndex > o.start.colIndex ? o.stop.colIndex : o.start.colIndex
            var endRow = o.stop.rowIndex > o.start.rowIndex ? o.stop.rowIndex : o.start.rowIndex

            if (startCol < 0) startCol = 0
            if (startRow < 0) startRow = 0
            if (endCol > this.colNode.length) endCol = this.colNode.length - 1
            if (endRow > this.rowNode.length) endRow = this.rowNode.length - 1

            if (x < 0) {
                startCol = 0
                endCol = this.colNode.length - 1
            }

            if (y < 0) {
                startRow = 0
                endRow = this.rowNode.length - 1
            }

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

        /*获取当前表格的数据*/
        Excel.prototype.getData = function () {
            var self = this
            var iNode = self.$content.find('i[x][y]')
            var data = []
            var field = []
            for (var i = 0; i < this.colNode.length; i++) {
                var col = this.colNode[i];
                field.push(col.getAttribute('data-name'))
            }

            //当整条记录不存在时，用这个记录代替
            var nullStr = {}
            field.forEach(function (f) {
                nullStr[f] = ''
            })
            nullStr = JSON.stringify(nullStr)

            for (var i = 0; i < iNode.length; i++) {
                var node = iNode[i];
                var x = parseInt(node.getAttribute('x'))
                var y = parseInt(node.getAttribute('y'))
                if (isNaN(x) || isNaN(y) || x < 0 || y < 0 || x > maxRow || y > maxField) {
                    continue;
                }

                //如果记录不存在，则设置记录为一个新的空对象
                if (!data[y]) data[y] = JSON.parse(nullStr)

                data[y][field[x]] = node.innerText.trim()
            }
            //未有的记录，设置一行为空的数据
            for (var k = 0; k < data.length; k++) {
                if (!data[k]) data[k] = JSON.parse(nullStr)
            }
            return data
        }

        module.exports = Excel

    }
)
