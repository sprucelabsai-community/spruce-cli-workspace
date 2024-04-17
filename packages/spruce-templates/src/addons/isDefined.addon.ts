import handlebars from 'handlebars'

/* Quick way to do an equals check against 2 values */
handlebars.registerHelper('isDefined', function (value) {
    return value !== undefined
})
