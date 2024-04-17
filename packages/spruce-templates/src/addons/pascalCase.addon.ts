import handlebars from 'handlebars'
import { upperFirst } from 'lodash'
/* Start case (cap first letter, lower rest) */
handlebars.registerHelper('pascalCase', (val) => {
    return upperFirst(val)
})
