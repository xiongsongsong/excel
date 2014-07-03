define(function (require, exports, module) {

    function Template(tpl) {
        this.tpl = tpl
    }

    /*
     * 编译模板
     * */
    Template.prototype.compile = function () {
        //首先筛选字段创建函数

        this.tpl = good.value
        //转换成JSON的字段型表示方法
        //output.value = this.tpl.replace(/^[\s]*-[\s]*var[\s]+([\w_]+)[\s]*=[\s]*fields[\s]*\((.+)\)[\s]*$/gmi, '//$1=$2')

        //ref : jade
        function GLOBAL_ESCAPE(html) {
            var result = String(html)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
            return result === '' + html ? html : result;
        }

        this.compileStr = GLOBAL_ESCAPE.toString() + ';var MMD=\'\';' +
            this.tpl.split(/[\r\n]/gm).map(function (item) {
                if (/^[\s]*-(.+)$/.test(item)) {
                    return RegExp.$1
                }
                //首先保护注释
                var _item = item.replace(/'/g, '\\\'')
                _item = _item.replace(/(\\)?([!#])\{([^}]+)?\}/g, function (a, b, c, d) {
                    //说明b是注释型
                    if (b !== undefined) {
                        return a
                    } else {
                        return '\'+' + (c === '#' ? 'GLOBAL_ESCAPE' : '') + '(' + d.replace(/\\'/g, '\'') + ')+\''
                    }
                })
                return 'MMD+=(\'' + _item + '\')'

            }).join('\r\n')
        this.compileStr += ';return MMD;'
        return this
    }

    /*
     * 渲染模板
     * */
    Template.prototype.render = function (data) {
        //将变量塞入模板头部
    }

    module.exports = Template
})
