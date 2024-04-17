import handlebars from 'handlebars'

handlebars.registerHelper(
    'valueTypeMapper',
    function (typeMapper: string, renderAs: 'typeOnly' | 'asGeneric') {
        if (renderAs === 'typeOnly') {
            return typeMapper.split('<')[0]
        } else {
            return typeMapper
        }
    }
)
