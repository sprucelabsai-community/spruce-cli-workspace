import handlebars from 'handlebars'
handlebars.registerHelper('eq', (num, min) => {
    return num === min
})
