import handlebars from 'handlebars'

handlebars.registerHelper('hasKeys', function (value) {
    return typeof value === 'object' ? Object.keys(value).length > 0 : false
})
