import handlebars from 'handlebars'
handlebars.registerHelper('neq', (val1, val2) => {
    return val1 !== val2
})
