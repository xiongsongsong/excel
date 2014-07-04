/*
 * 模拟jade语法，但基于html的模板引擎
 * */

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
        function escape(html) {
            var result = String(html)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
            return result === '' + html ? html : result;
        }

        this.compileStr = escape.toString() + ';var echo=\'\';' +
            this.tpl.split(/[\r\n]/gm).map(function (item) {
                if (/^[\s]*-(.+)$/.test(item)) {
                    return RegExp.$1
                }
                // 1：将标识符：#{ } !{}，查询并解析出来，保存到map变量中，并用prefix变量进行替换，index指定是第几个标识符
                var map = {}, index = 0, prefix = '¶_sQ_JG_mGj_TpL_pLaCeHoLdEr_¶'
                item = item.replace(/(\\)*?([!#])\{([^}]+?)\}/g, function (a, b, c, d) {
                    if (b !== undefined) return a
                    map[(++index)] = '\'+' + (c === '#' ? 'escape' : '') + '(' + (d ? d.replace(/\\'/g, '\'') : "''") + ')+\''
                    return prefix + index
                })
                // 2：进行单引号和双引号转义
                item = 'echo+=(\'' + item.replace(/('|\\)/g, '\\$1') + '\\r\\n\')'
                // 3：将标识符从map中再替换回来
                for (var k in map) item = item.replace(prefix + k, map[k])
                return item
            }).join('\r\n')
        this.compileStr += ';return echo;'
    }

    /*
     * 渲染模板
     * */
    Template.prototype.render = function (data) {
        //将变量塞入模板头部
    }

    module.exports = Template

})
