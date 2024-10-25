import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const vscodeNotInstalledSchema: SpruceErrors.SpruceCli.VscodeNotInstalledSchema  = {
	id: 'vscodeNotInstalled',
	namespace: 'SpruceCli',
	name: 'vscode not installed',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(vscodeNotInstalledSchema)

export default vscodeNotInstalledSchema
