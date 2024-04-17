import { SchemaRegistry } from '@sprucelabs/schema'
import missingDependenciesDependencySchema from '#spruce/errors/spruceCli/missingDependenciesDependency.schema'
import { SpruceErrors } from '../errors.types'

const missingDependenciesSchema: SpruceErrors.SpruceCli.MissingDependenciesSchema =
    {
        id: 'missingDependencies',
        namespace: 'SpruceCli',
        name: 'Missing dependencies',
        fields: {
            /** . */
            dependencies: {
                type: 'schema',
                isRequired: true,
                isArray: true,
                options: { schema: missingDependenciesDependencySchema },
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(missingDependenciesSchema)

export default missingDependenciesSchema
