import handlebars from 'handlebars'
handlebars.registerHelper('gt', (num, min) => {
    return num > min
})
