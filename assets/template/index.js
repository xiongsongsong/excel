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

        this.compileStr = GLOBAL_ESCAPE.toString() + ';var echo=\'\';' +
            this.tpl.split(/[\r\n]/gm).map(function (item) {
                if (/^[\s]*-(.+)$/.test(item)) {
                    return RegExp.$1
                }
                //首先保护注释
                var _item = item.replace(/'/g, '\\\'')
                _item = _item.replace(/(\\)*?([!#])\{([^}]+)?\}/g, function (a, b, c, d) {
                    //说明b是注释型
                    if (b !== undefined) {
                        return a.replace(/\\/gmi, '\\\\')
                    } else {
                        return '\'+' + (c === '#' ? 'GLOBAL_ESCAPE' : '') + '(' + d.replace(/\\'/g, '\'') + ')+\''
                    }
                })
                return 'echo+=(\'' + _item + '\\r\\n\')'

            }).join('\r\n')
        this.compileStr += ';return echo;'
        output.value = this.compileStr
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
function GLOBAL_ESCAPE(html) {
    var result = String(html)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    return result === '' + html ? html : result;
};var echo=''; var good = fields (title_标题_text,price_价格_number,date_日期_date)
var category = fields (title_标题_text,price_价格_number,date_日期_date)
good.forEach(function(i,item){
    echo+=('    <li>'+GLOBAL_ESCAPE(b)+'</li>\r\n')
    var abc=123
    if($index/2==0) {
        echo+=('        <li>偶竖行</li>\r\n')
    }else{
        echo+=('        <li>奇数行</li>\r\n')
    }
    echo+=('    <li class="'+GLOBAL_ESCAPE( i / 2 == 0 ? 'odd' : 'add' )+'"></li>\r\n')
    echo+=(''+GLOBAL_ESCAPE(item.first)+' }}}</li>'+GLOBAL_ESCAPE(item.first2)+' }}}</li>\r\n')
    echo+=('\\#{item.first}</li>\r\n')
})
echo+=('\r\n');return echo;