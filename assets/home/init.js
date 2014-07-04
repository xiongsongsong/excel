/**
 * Created by song on 14-7-4.
 */
define(function () {
    var form = document.forms['editor']
    var $form = $(form)
    $form.on('submit', function (e) {
        e.preventDefault()
        form.elements.content.value = content.getSession()
        $.post(form.action, $form.serialize())
            .done(function (data) {
                console.log(data)
            })
    })
})
