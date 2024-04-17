import handlebars from 'handlebars'

/* Escape quotes */
handlebars.registerHelper('escape', function (variable) {
    return variable && variable.replace && variable.replace(/(['])/g, '\\$1')
})
