import handlebars from 'handlebars'

/* Quick way to do an equals check against 2 values */
handlebars.registerHelper('json', function (arg1) {
    //@ts-ignore // TODO how should this work in a typed environment?
    const value = JSON.stringify(arg1)
    return value
})
