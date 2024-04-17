import handlebars from 'handlebars'

handlebars.registerHelper({
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and(...params) {
        return Array.prototype.every.call(params, Boolean)
    },
    or(...params) {
        return Array.prototype.slice.call(params, 0, -1).some(Boolean)
    },
})
