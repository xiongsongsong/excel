define(function () {
    var form = document.forms['editor']
    var $form = $(form)
    $form.on('submit', function (e) {
        e.preventDefault()
        form.elements.content.value = content.getSession()
        $.post(form.action, $form.serialize())
            .done(function (data) {
                if (data.code === 200 && data.doc._id) {
                    location.href = '/page/preview/' + data.doc.tplId
                } else {
                    alert(JSON.stringify(data, undefined, 4))
                }
            })
    })

    //input自适应宽度
    $form.find('input', 'input[name=name],input[name=url]').on('input', function () {
        $(this).css('width', $form.find('span.' + this.name).text(this.value).width())
        $(this).toggleClass('empty', this.value.trim().length < 1)
    }).trigger('input')
})
