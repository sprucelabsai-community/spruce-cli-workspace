/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-redeclare */

export { SpruceSchemas } from '@sprucelabs/spruce-core-schemas/build/.spruce/schemas/core.schemas.types'

import { default as SchemaEntity } from '@sprucelabs/schema'



import * as SpruceSchema from '@sprucelabs/schema'

import { SkillViewControllerId } from '@sprucelabs/heartwood-view-controllers'
import { BaseWidget } from '#spruce/../widgets/types/widgets.types'

declare module '@sprucelabs/spruce-core-schemas/build/.spruce/schemas/core.schemas.types' {


	namespace SpruceSchemas.Appointments.v2021_06_23 {

		
		interface DidBookAppointmentsEmitTarget {
			
				
				'organizationId'?: string| undefined | null
		}

		interface DidBookAppointmentsEmitTargetSchema extends SpruceSchema.Schema {
			id: 'didBookAppointmentsEmitTarget',
			version: 'v2021_06_23',
			namespace: 'Appointments',
			name: '',
			    fields: {
			            /** . */
			            'organizationId': {
			                type: 'id',
			                options: undefined
			            },
			    }
		}

		type DidBookAppointmentsEmitTargetEntity = SchemaEntity<SpruceSchemas.Appointments.v2021_06_23.DidBookAppointmentsEmitTargetSchema>

	}


	namespace SpruceSchemas.Appointments.v2021_06_23 {

		
		interface Appointments {
			
				
				'guestId'?: string| undefined | null
		}

		interface AppointmentsSchema extends SpruceSchema.Schema {
			id: 'appointments',
			version: 'v2021_06_23',
			namespace: 'Appointments',
			name: '',
			    fields: {
			            /** . */
			            'guestId': {
			                type: 'text',
			                options: undefined
			            },
			    }
		}

		type AppointmentsEntity = SchemaEntity<SpruceSchemas.Appointments.v2021_06_23.AppointmentsSchema>

	}


	namespace SpruceSchemas.Appointments.v2021_06_23 {

		
		interface DidBookAppointmentsEmitPayload {
			
				
				'appointments': SpruceSchemas.Appointments.v2021_06_23.Appointments[]
		}

		interface DidBookAppointmentsEmitPayloadSchema extends SpruceSchema.Schema {
			id: 'didBookAppointmentsEmitPayload',
			version: 'v2021_06_23',
			namespace: 'Appointments',
			name: '',
			    fields: {
			            /** . */
			            'appointments': {
			                type: 'schema',
			                isRequired: true,
			                isArray: true,
			                options: {schema: SpruceSchemas.Appointments.v2021_06_23.AppointmentsSchema,}
			            },
			    }
		}

		type DidBookAppointmentsEmitPayloadEntity = SchemaEntity<SpruceSchemas.Appointments.v2021_06_23.DidBookAppointmentsEmitPayloadSchema>

	}


	namespace SpruceSchemas.Appointments.v2021_06_23 {

		
		interface DidBookAppointmentsEmitTargetAndPayload {
			
				
				'target'?: SpruceSchemas.Appointments.v2021_06_23.DidBookAppointmentsEmitTarget| undefined | null
				
				'payload': SpruceSchemas.Appointments.v2021_06_23.DidBookAppointmentsEmitPayload
		}

		interface DidBookAppointmentsEmitTargetAndPayloadSchema extends SpruceSchema.Schema {
			id: 'didBookAppointmentsEmitTargetAndPayload',
			version: 'v2021_06_23',
			namespace: 'Appointments',
			name: '',
			    fields: {
			            /** . */
			            'target': {
			                type: 'schema',
			                options: {schema: SpruceSchemas.Appointments.v2021_06_23.DidBookAppointmentsEmitTargetSchema,}
			            },
			            /** . */
			            'payload': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.Appointments.v2021_06_23.DidBookAppointmentsEmitPayloadSchema,}
			            },
			    }
		}

		type DidBookAppointmentsEmitTargetAndPayloadEntity = SchemaEntity<SpruceSchemas.Appointments.v2021_06_23.DidBookAppointmentsEmitTargetAndPayloadSchema>

	}


	namespace SpruceSchemas.Appointments.v2021_06_23 {

		
		interface DidBookAppointmentsResponsePayload {
			
				
				'optionalField'?: string| undefined | null
		}

		interface DidBookAppointmentsResponsePayloadSchema extends SpruceSchema.Schema {
			id: 'didBookAppointmentsResponsePayload',
			version: 'v2021_06_23',
			namespace: 'Appointments',
			name: '',
			    fields: {
			            /** . */
			            'optionalField': {
			                type: 'text',
			                options: undefined
			            },
			    }
		}

		type DidBookAppointmentsResponsePayloadEntity = SchemaEntity<SpruceSchemas.Appointments.v2021_06_23.DidBookAppointmentsResponsePayloadSchema>

	}


	namespace SpruceSchemas.Heartwood.v2021_02_11 {

		
		interface DidRegisterSkillViewsEmitPayload {
			
				/** View namespace. */
				'namespace': string
		}

		interface DidRegisterSkillViewsEmitPayloadSchema extends SpruceSchema.Schema {
			id: 'didRegisterSkillViewsEmitPayload',
			version: 'v2021_02_11',
			namespace: 'Heartwood',
			name: '',
			    fields: {
			            /** View namespace. */
			            'namespace': {
			                label: 'View namespace',
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			    }
		}

		type DidRegisterSkillViewsEmitPayloadEntity = SchemaEntity<SpruceSchemas.Heartwood.v2021_02_11.DidRegisterSkillViewsEmitPayloadSchema>

	}


	namespace SpruceSchemas.Heartwood.v2021_02_11 {

		
		interface DidRegisterSkillViewsEmitTargetAndPayload {
			
				
				'payload': SpruceSchemas.Heartwood.v2021_02_11.DidRegisterSkillViewsEmitPayload
		}

		interface DidRegisterSkillViewsEmitTargetAndPayloadSchema extends SpruceSchema.Schema {
			id: 'didRegisterSkillViewsEmitTargetAndPayload',
			version: 'v2021_02_11',
			namespace: 'Heartwood',
			name: '',
			    fields: {
			            /** . */
			            'payload': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.Heartwood.v2021_02_11.DidRegisterSkillViewsEmitPayloadSchema,}
			            },
			    }
		}

		type DidRegisterSkillViewsEmitTargetAndPayloadEntity = SchemaEntity<SpruceSchemas.Heartwood.v2021_02_11.DidRegisterSkillViewsEmitTargetAndPayloadSchema>

	}


	namespace SpruceSchemas.Heartwood.v2021_02_11 {

		
		interface GenerateUrlEmitTarget {
			
				/** Skill View Id. */
				'skillViewId'?: (SkillViewControllerId)| undefined | null
		}

		interface GenerateUrlEmitTargetSchema extends SpruceSchema.Schema {
			id: 'generateUrlEmitTarget',
			version: 'v2021_02_11',
			namespace: 'Heartwood',
			name: '',
			importsWhenRemote: ['import { SkillViewControllerId } from \'@sprucelabs/heartwood-view-controllers\'',],
			    fields: {
			            /** Skill View Id. */
			            'skillViewId': {
			                label: 'Skill View Id',
			                type: 'raw',
			                options: {valueType: `SkillViewControllerId`,}
			            },
			    }
		}

		type GenerateUrlEmitTargetEntity = SchemaEntity<SpruceSchemas.Heartwood.v2021_02_11.GenerateUrlEmitTargetSchema>

	}


	namespace SpruceSchemas.Heartwood.v2021_02_11 {

		
		interface GenerateUrlEmitPayload {
			
				/** Load args. */
				'args'?: (Record<string, any>)| undefined | null
		}

		interface GenerateUrlEmitPayloadSchema extends SpruceSchema.Schema {
			id: 'generateUrlEmitPayload',
			version: 'v2021_02_11',
			namespace: 'Heartwood',
			name: '',
			    fields: {
			            /** Load args. */
			            'args': {
			                label: 'Load args',
			                type: 'raw',
			                options: {valueType: `Record<string, any>`,}
			            },
			    }
		}

		type GenerateUrlEmitPayloadEntity = SchemaEntity<SpruceSchemas.Heartwood.v2021_02_11.GenerateUrlEmitPayloadSchema>

	}


	namespace SpruceSchemas.Heartwood.v2021_02_11 {

		
		interface GenerateUrlEmitTargetAndPayload {
			
				
				'target'?: SpruceSchemas.Heartwood.v2021_02_11.GenerateUrlEmitTarget| undefined | null
				
				'payload'?: SpruceSchemas.Heartwood.v2021_02_11.GenerateUrlEmitPayload| undefined | null
		}

		interface GenerateUrlEmitTargetAndPayloadSchema extends SpruceSchema.Schema {
			id: 'generateUrlEmitTargetAndPayload',
			version: 'v2021_02_11',
			namespace: 'Heartwood',
			name: '',
			    fields: {
			            /** . */
			            'target': {
			                type: 'schema',
			                options: {schema: SpruceSchemas.Heartwood.v2021_02_11.GenerateUrlEmitTargetSchema,}
			            },
			            /** . */
			            'payload': {
			                type: 'schema',
			                options: {schema: SpruceSchemas.Heartwood.v2021_02_11.GenerateUrlEmitPayloadSchema,}
			            },
			    }
		}

		type GenerateUrlEmitTargetAndPayloadEntity = SchemaEntity<SpruceSchemas.Heartwood.v2021_02_11.GenerateUrlEmitTargetAndPayloadSchema>

	}


	namespace SpruceSchemas.Heartwood.v2021_02_11 {

		
		interface GenerateUrlResponsePayload {
			
				/** Url. */
				'url': string
		}

		interface GenerateUrlResponsePayloadSchema extends SpruceSchema.Schema {
			id: 'generateUrlResponsePayload',
			version: 'v2021_02_11',
			namespace: 'Heartwood',
			name: '',
			    fields: {
			            /** Url. */
			            'url': {
			                label: 'Url',
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			    }
		}

		type GenerateUrlResponsePayloadEntity = SchemaEntity<SpruceSchemas.Heartwood.v2021_02_11.GenerateUrlResponsePayloadSchema>

	}


	namespace SpruceSchemas.Heartwood.v2021_02_11 {

		
		interface GetViewControllersEmitTarget {
			
				
				'namespace': string
		}

		interface GetViewControllersEmitTargetSchema extends SpruceSchema.Schema {
			id: 'getViewControllersEmitTarget',
			version: 'v2021_02_11',
			namespace: 'Heartwood',
			name: '',
			    fields: {
			            /** . */
			            'namespace': {
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			    }
		}

		type GetViewControllersEmitTargetEntity = SchemaEntity<SpruceSchemas.Heartwood.v2021_02_11.GetViewControllersEmitTargetSchema>

	}


	namespace SpruceSchemas.Heartwood.v2021_02_11 {

		
		interface GetSkillViewsEmitTargetAndPayload {
			
				
				'target': SpruceSchemas.Heartwood.v2021_02_11.GetViewControllersEmitTarget
		}

		interface GetSkillViewsEmitTargetAndPayloadSchema extends SpruceSchema.Schema {
			id: 'getSkillViewsEmitTargetAndPayload',
			version: 'v2021_02_11',
			namespace: 'Heartwood',
			name: '',
			    fields: {
			            /** . */
			            'target': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.Heartwood.v2021_02_11.GetViewControllersEmitTargetSchema,}
			            },
			    }
		}

		type GetSkillViewsEmitTargetAndPayloadEntity = SchemaEntity<SpruceSchemas.Heartwood.v2021_02_11.GetSkillViewsEmitTargetAndPayloadSchema>

	}


	namespace SpruceSchemas.Heartwood.v2021_02_11 {

		
		interface GetSkillViewsResponsePayload {
			
				
				'id': string
				
				'ids': string[]
				
				'source': string
				
				'theme'?: SpruceSchemas.Heartwood.v2021_02_11.RegisterationTheme| undefined | null
		}

		interface GetSkillViewsResponsePayloadSchema extends SpruceSchema.Schema {
			id: 'getSkillViewsResponsePayload',
			version: 'v2021_02_11',
			namespace: 'Heartwood',
			name: '',
			    fields: {
			            /** . */
			            'id': {
			                type: 'id',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'ids': {
			                type: 'text',
			                isRequired: true,
			                isArray: true,
			                options: undefined
			            },
			            /** . */
			            'source': {
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'theme': {
			                type: 'schema',
			                options: {schema: SpruceSchemas.Heartwood.v2021_02_11.RegisterationThemeSchema,}
			            },
			    }
		}

		type GetSkillViewsResponsePayloadEntity = SchemaEntity<SpruceSchemas.Heartwood.v2021_02_11.GetSkillViewsResponsePayloadSchema>

	}


	namespace SpruceSchemas.Heartwood.v2021_02_11 {

		
		interface RegisterSkillViewsEmitTarget {
			
				
				'personId'?: string| undefined | null
		}

		interface RegisterSkillViewsEmitTargetSchema extends SpruceSchema.Schema {
			id: 'registerSkillViewsEmitTarget',
			version: 'v2021_02_11',
			namespace: 'Heartwood',
			name: '',
			    fields: {
			            /** . */
			            'personId': {
			                type: 'id',
			                options: undefined
			            },
			    }
		}

		type RegisterSkillViewsEmitTargetEntity = SchemaEntity<SpruceSchemas.Heartwood.v2021_02_11.RegisterSkillViewsEmitTargetSchema>

	}


	namespace SpruceSchemas.Heartwood.v2021_02_11 {

		
		interface RegisterSkillViewsEmitTargetAndPayload {
			
				
				'target'?: SpruceSchemas.Heartwood.v2021_02_11.RegisterSkillViewsEmitTarget| undefined | null
				
				'payload': SpruceSchemas.Heartwood.v2021_02_11.RegisterSkillViewsEmitPayload
		}

		interface RegisterSkillViewsEmitTargetAndPayloadSchema extends SpruceSchema.Schema {
			id: 'registerSkillViewsEmitTargetAndPayload',
			version: 'v2021_02_11',
			namespace: 'Heartwood',
			name: '',
			    fields: {
			            /** . */
			            'target': {
			                type: 'schema',
			                options: {schema: SpruceSchemas.Heartwood.v2021_02_11.RegisterSkillViewsEmitTargetSchema,}
			            },
			            /** . */
			            'payload': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.Heartwood.v2021_02_11.RegisterSkillViewsEmitPayloadSchema,}
			            },
			    }
		}

		type RegisterSkillViewsEmitTargetAndPayloadEntity = SchemaEntity<SpruceSchemas.Heartwood.v2021_02_11.RegisterSkillViewsEmitTargetAndPayloadSchema>

	}


	namespace SpruceSchemas.Heartwood.v2021_02_11 {

		
		interface RegisterationTheme {
			
				
				'props': SpruceSchemas.HeartwoodViewControllers.v2021_02_11.ThemeProps
		}

		interface RegisterationThemeSchema extends SpruceSchema.Schema {
			id: 'registerationTheme',
			version: 'v2021_02_11',
			namespace: 'Heartwood',
			name: '',
			    fields: {
			            /** . */
			            'props': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.HeartwoodViewControllers.v2021_02_11.ThemePropsSchema,}
			            },
			    }
		}

		type RegisterationThemeEntity = SchemaEntity<SpruceSchemas.Heartwood.v2021_02_11.RegisterationThemeSchema>

	}


	namespace SpruceSchemas.Heartwood.v2021_02_11 {

		
		interface RegisterSkillViewsEmitPayload {
			
				
				'ids': string[]
				
				'source': string
				
				'theme'?: SpruceSchemas.Heartwood.v2021_02_11.RegisterationTheme| undefined | null
		}

		interface RegisterSkillViewsEmitPayloadSchema extends SpruceSchema.Schema {
			id: 'registerSkillViewsEmitPayload',
			version: 'v2021_02_11',
			namespace: 'Heartwood',
			name: '',
			    fields: {
			            /** . */
			            'ids': {
			                type: 'text',
			                isRequired: true,
			                isArray: true,
			                options: undefined
			            },
			            /** . */
			            'source': {
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'theme': {
			                type: 'schema',
			                options: {schema: SpruceSchemas.Heartwood.v2021_02_11.RegisterationThemeSchema,}
			            },
			    }
		}

		type RegisterSkillViewsEmitPayloadEntity = SchemaEntity<SpruceSchemas.Heartwood.v2021_02_11.RegisterSkillViewsEmitPayloadSchema>

	}


	namespace SpruceSchemas.Heartwood.v2021_02_11 {

		
		interface RegisterSkillViewsResponsePayload {
			
				/** . Views that were registered. Will match the number of ids you sent. */
				'totalRegistered': number
		}

		interface RegisterSkillViewsResponsePayloadSchema extends SpruceSchema.Schema {
			id: 'registerSkillViewsResponsePayload',
			version: 'v2021_02_11',
			namespace: 'Heartwood',
			name: '',
			    fields: {
			            /** . Views that were registered. Will match the number of ids you sent. */
			            'totalRegistered': {
			                type: 'number',
			                isRequired: true,
			                hint: 'Views that were registered. Will match the number of ids you sent.',
			                options: undefined
			            },
			    }
		}

		type RegisterSkillViewsResponsePayloadEntity = SchemaEntity<SpruceSchemas.Heartwood.v2021_02_11.RegisterSkillViewsResponsePayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface ConvertPdfToFormEmitPayload {
			
				/** Contents of PDF to convert to form. */
				'pdfContents': string
		}

		interface ConvertPdfToFormEmitPayloadSchema extends SpruceSchema.Schema {
			id: 'convertPdfToFormEmitPayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** Contents of PDF to convert to form. */
			            'pdfContents': {
			                label: 'Contents of PDF to convert to form',
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			    }
		}

		type ConvertPdfToFormEmitPayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.ConvertPdfToFormEmitPayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface ConvertPdfToFormEmitTargetAndPayload {
			
				
				'payload': SpruceSchemas.Forms.v2021_07_02.ConvertPdfToFormEmitPayload
		}

		interface ConvertPdfToFormEmitTargetAndPayloadSchema extends SpruceSchema.Schema {
			id: 'convertPdfToFormEmitTargetAndPayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'payload': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.Forms.v2021_07_02.ConvertPdfToFormEmitPayloadSchema,}
			            },
			    }
		}

		type ConvertPdfToFormEmitTargetAndPayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.ConvertPdfToFormEmitTargetAndPayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface ConvertPdfToFormResponsePayload {
			
				
				'form'?: SpruceSchemas.HeartwoodViewControllers.v2021_02_11.FormBuilderImportExportObject| undefined | null
		}

		interface ConvertPdfToFormResponsePayloadSchema extends SpruceSchema.Schema {
			id: 'convertPdfToFormResponsePayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'form': {
			                type: 'schema',
			                options: {schema: SpruceSchemas.HeartwoodViewControllers.v2021_02_11.FormBuilderImportExportObjectSchema,}
			            },
			    }
		}

		type ConvertPdfToFormResponsePayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.ConvertPdfToFormResponsePayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface ConvertPdfToSchemasEmitPayload {
			
				/** Contents of PDF to convert to schemas. */
				'pdfContents': string
		}

		interface ConvertPdfToSchemasEmitPayloadSchema extends SpruceSchema.Schema {
			id: 'convertPdfToSchemasEmitPayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** Contents of PDF to convert to schemas. */
			            'pdfContents': {
			                label: 'Contents of PDF to convert to schemas',
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			    }
		}

		type ConvertPdfToSchemasEmitPayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.ConvertPdfToSchemasEmitPayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface ConvertPdfToSchemasEmitTargetAndPayload {
			
				
				'payload': SpruceSchemas.Forms.v2021_07_02.ConvertPdfToSchemasEmitPayload
		}

		interface ConvertPdfToSchemasEmitTargetAndPayloadSchema extends SpruceSchema.Schema {
			id: 'convertPdfToSchemasEmitTargetAndPayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'payload': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.Forms.v2021_07_02.ConvertPdfToSchemasEmitPayloadSchema,}
			            },
			    }
		}

		type ConvertPdfToSchemasEmitTargetAndPayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.ConvertPdfToSchemasEmitTargetAndPayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface ConvertPdfToSchemasResponsePayload {
			
				/** Schemas genenerated for PDF. */
				'schemas': (SpruceSchema.Schema)[]
		}

		interface ConvertPdfToSchemasResponsePayloadSchema extends SpruceSchema.Schema {
			id: 'convertPdfToSchemasResponsePayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** Schemas genenerated for PDF. */
			            'schemas': {
			                label: 'Schemas genenerated for PDF',
			                type: 'raw',
			                isRequired: true,
			                isArray: true,
			                options: {valueType: `SpruceSchema.Schema`,}
			            },
			    }
		}

		type ConvertPdfToSchemasResponsePayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.ConvertPdfToSchemasResponsePayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface CreateBuiltForm {
			
				/** Title. */
				'title': string
				/** Subtitle. */
				'subtitle'?: string| undefined | null
				/** Pages. */
				'pages': SpruceSchemas.HeartwoodViewControllers.v2021_02_11.BuilderImportExportPage[]
		}

		interface CreateBuiltFormSchema extends SpruceSchema.Schema {
			id: 'createBuiltForm',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** Title. */
			            'title': {
			                label: 'Title',
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			            /** Subtitle. */
			            'subtitle': {
			                label: 'Subtitle',
			                type: 'text',
			                options: undefined
			            },
			            /** Pages. */
			            'pages': {
			                label: 'Pages',
			                type: 'schema',
			                isRequired: true,
			                isArray: true,
			                options: {schema: SpruceSchemas.HeartwoodViewControllers.v2021_02_11.BuilderImportExportPageSchema,}
			            },
			    }
		}

		type CreateBuiltFormEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.CreateBuiltFormSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface CreateFormEmitTargetAndPayload {
			
				
				'payload': SpruceSchemas.Forms.v2021_07_02.CreateBuiltForm
		}

		interface CreateFormEmitTargetAndPayloadSchema extends SpruceSchema.Schema {
			id: 'createFormEmitTargetAndPayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'payload': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.Forms.v2021_07_02.CreateBuiltFormSchema,}
			            },
			    }
		}

		type CreateFormEmitTargetAndPayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.CreateFormEmitTargetAndPayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface BuiltForm {
			
				
				'id': string
				
				'dateDeleted'?: number| undefined | null
				/** Title. */
				'title': string
				/** Subtitle. */
				'subtitle'?: string| undefined | null
				/** Pages. */
				'pages': SpruceSchemas.HeartwoodViewControllers.v2021_02_11.BuilderImportExportPage[]
		}

		interface BuiltFormSchema extends SpruceSchema.Schema {
			id: 'builtForm',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'id': {
			                type: 'id',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'dateDeleted': {
			                type: 'number',
			                isPrivate: true,
			                options: undefined
			            },
			            /** Title. */
			            'title': {
			                label: 'Title',
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			            /** Subtitle. */
			            'subtitle': {
			                label: 'Subtitle',
			                type: 'text',
			                options: undefined
			            },
			            /** Pages. */
			            'pages': {
			                label: 'Pages',
			                type: 'schema',
			                isRequired: true,
			                isArray: true,
			                options: {schema: SpruceSchemas.HeartwoodViewControllers.v2021_02_11.BuilderImportExportPageSchema,}
			            },
			    }
		}

		type BuiltFormEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.BuiltFormSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface CreateFormResponsePayload {
			
				
				'form': SpruceSchemas.Forms.v2021_07_02.BuiltForm
				
				'values'?: (Record<string, any>)[]| undefined | null
		}

		interface CreateFormResponsePayloadSchema extends SpruceSchema.Schema {
			id: 'createFormResponsePayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'form': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.Forms.v2021_07_02.BuiltFormSchema,}
			            },
			            /** . */
			            'values': {
			                type: 'raw',
			                isArray: true,
			                options: {valueType: `Record<string, any>`,}
			            },
			    }
		}

		type CreateFormResponsePayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.CreateFormResponsePayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface DeleteCompletedFormEmitTarget {
			
				
				'completedFormId': string
		}

		interface DeleteCompletedFormEmitTargetSchema extends SpruceSchema.Schema {
			id: 'deleteCompletedFormEmitTarget',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'completedFormId': {
			                type: 'id',
			                isRequired: true,
			                options: undefined
			            },
			    }
		}

		type DeleteCompletedFormEmitTargetEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.DeleteCompletedFormEmitTargetSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface DeleteCompletedFormEmitTargetAndPayload {
			
				
				'target': SpruceSchemas.Forms.v2021_07_02.DeleteCompletedFormEmitTarget
		}

		interface DeleteCompletedFormEmitTargetAndPayloadSchema extends SpruceSchema.Schema {
			id: 'deleteCompletedFormEmitTargetAndPayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'target': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.Forms.v2021_07_02.DeleteCompletedFormEmitTargetSchema,}
			            },
			    }
		}

		type DeleteCompletedFormEmitTargetAndPayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.DeleteCompletedFormEmitTargetAndPayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface DeleteCompletedFormResponsePayload {
			
				
				'totalDeleted': number
		}

		interface DeleteCompletedFormResponsePayloadSchema extends SpruceSchema.Schema {
			id: 'deleteCompletedFormResponsePayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'totalDeleted': {
			                type: 'number',
			                isRequired: true,
			                options: undefined
			            },
			    }
		}

		type DeleteCompletedFormResponsePayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.DeleteCompletedFormResponsePayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface DidSaveFormEmitPayload {
			
				
				'completedFormId': string
		}

		interface DidSaveFormEmitPayloadSchema extends SpruceSchema.Schema {
			id: 'didSaveFormEmitPayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'completedFormId': {
			                type: 'id',
			                isRequired: true,
			                options: undefined
			            },
			    }
		}

		type DidSaveFormEmitPayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.DidSaveFormEmitPayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface DidUpdateCompletedFormEmitTargetAndPayload {
			
				
				'payload': SpruceSchemas.Forms.v2021_07_02.DidSaveFormEmitPayload
		}

		interface DidUpdateCompletedFormEmitTargetAndPayloadSchema extends SpruceSchema.Schema {
			id: 'didUpdateCompletedFormEmitTargetAndPayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'payload': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.Forms.v2021_07_02.DidSaveFormEmitPayloadSchema,}
			            },
			    }
		}

		type DidUpdateCompletedFormEmitTargetAndPayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.DidUpdateCompletedFormEmitTargetAndPayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface GetCompletedFormEmitTarget {
			
				
				'completedFormId': string
		}

		interface GetCompletedFormEmitTargetSchema extends SpruceSchema.Schema {
			id: 'getCompletedFormEmitTarget',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'completedFormId': {
			                type: 'id',
			                isRequired: true,
			                options: undefined
			            },
			    }
		}

		type GetCompletedFormEmitTargetEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.GetCompletedFormEmitTargetSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface GetCompletedFormEmitTargetAndPayload {
			
				
				'target': SpruceSchemas.Forms.v2021_07_02.GetCompletedFormEmitTarget
		}

		interface GetCompletedFormEmitTargetAndPayloadSchema extends SpruceSchema.Schema {
			id: 'getCompletedFormEmitTargetAndPayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'target': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.Forms.v2021_07_02.GetCompletedFormEmitTargetSchema,}
			            },
			    }
		}

		type GetCompletedFormEmitTargetAndPayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.GetCompletedFormEmitTargetAndPayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface CompletedFormSourceForm {
			
				
				'id': string
				/** Title. */
				'title': string
				/** Subtitle. */
				'subtitle'?: string| undefined | null
				/** Pages. */
				'pages': SpruceSchemas.HeartwoodViewControllers.v2021_02_11.BuilderImportExportPage[]
		}

		interface CompletedFormSourceFormSchema extends SpruceSchema.Schema {
			id: 'completedFormSourceForm',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'id': {
			                type: 'id',
			                isRequired: true,
			                options: undefined
			            },
			            /** Title. */
			            'title': {
			                label: 'Title',
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			            /** Subtitle. */
			            'subtitle': {
			                label: 'Subtitle',
			                type: 'text',
			                options: undefined
			            },
			            /** Pages. */
			            'pages': {
			                label: 'Pages',
			                type: 'schema',
			                isRequired: true,
			                isArray: true,
			                options: {schema: SpruceSchemas.HeartwoodViewControllers.v2021_02_11.BuilderImportExportPageSchema,}
			            },
			    }
		}

		type CompletedFormSourceFormEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.CompletedFormSourceFormSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface GetCompletedFormEventForm {
			
				
				'id': string
				
				'dateCreated': number
				
				'dateUpdated'?: number| undefined | null
				
				'sourceForm': SpruceSchemas.Forms.v2021_07_02.CompletedFormSourceForm
				
				'sourceFormId': string
				
				'personId': string
				
				'values'?: (Record<string, any>)[]| undefined | null
		}

		interface GetCompletedFormEventFormSchema extends SpruceSchema.Schema {
			id: 'getCompletedFormEventForm',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'id': {
			                type: 'id',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'dateCreated': {
			                type: 'number',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'dateUpdated': {
			                type: 'number',
			                options: undefined
			            },
			            /** . */
			            'sourceForm': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.Forms.v2021_07_02.CompletedFormSourceFormSchema,}
			            },
			            /** . */
			            'sourceFormId': {
			                type: 'id',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'personId': {
			                type: 'id',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'values': {
			                type: 'raw',
			                isArray: true,
			                options: {valueType: `Record<string, any>`,}
			            },
			    }
		}

		type GetCompletedFormEventFormEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.GetCompletedFormEventFormSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface GetCompletedFormResponsePayload {
			
				
				'completedForm': SpruceSchemas.Forms.v2021_07_02.GetCompletedFormEventForm
		}

		interface GetCompletedFormResponsePayloadSchema extends SpruceSchema.Schema {
			id: 'getCompletedFormResponsePayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'completedForm': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.Forms.v2021_07_02.GetCompletedFormEventFormSchema,}
			            },
			    }
		}

		type GetCompletedFormResponsePayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.GetCompletedFormResponsePayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface CompletedFormResponse {
			
				
				'personName': string
				
				'formTitle': string
				
				'completedFormBuilderId': string
				
				'percentComplete': number
		}

		interface CompletedFormResponseSchema extends SpruceSchema.Schema {
			id: 'completedFormResponse',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'personName': {
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'formTitle': {
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'completedFormBuilderId': {
			                type: 'id',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'percentComplete': {
			                type: 'number',
			                isRequired: true,
			                options: undefined
			            },
			    }
		}

		type CompletedFormResponseEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.CompletedFormResponseSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface ListCompletedFormsResponsePayload {
			
				
				'completedForms': SpruceSchemas.Forms.v2021_07_02.CompletedFormResponse[]
		}

		interface ListCompletedFormsResponsePayloadSchema extends SpruceSchema.Schema {
			id: 'listCompletedFormsResponsePayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'completedForms': {
			                type: 'schema',
			                isRequired: true,
			                isArray: true,
			                minArrayLength: 0,
			                options: {schema: SpruceSchemas.Forms.v2021_07_02.CompletedFormResponseSchema,}
			            },
			    }
		}

		type ListCompletedFormsResponsePayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.ListCompletedFormsResponsePayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface ListFormsForm {
			
				
				'id': string
				
				'dateDeleted'?: number| undefined | null
				/** Title. */
				'title': string
				/** Subtitle. */
				'subtitle'?: string| undefined | null
		}

		interface ListFormsFormSchema extends SpruceSchema.Schema {
			id: 'listFormsForm',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'id': {
			                type: 'id',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'dateDeleted': {
			                type: 'number',
			                isPrivate: true,
			                options: undefined
			            },
			            /** Title. */
			            'title': {
			                label: 'Title',
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			            /** Subtitle. */
			            'subtitle': {
			                label: 'Subtitle',
			                type: 'text',
			                options: undefined
			            },
			    }
		}

		type ListFormsFormEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.ListFormsFormSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface ListFormsResponsePayload {
			
				
				'forms': SpruceSchemas.Forms.v2021_07_02.ListFormsForm[]
		}

		interface ListFormsResponsePayloadSchema extends SpruceSchema.Schema {
			id: 'listFormsResponsePayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'forms': {
			                type: 'schema',
			                isRequired: true,
			                isArray: true,
			                minArrayLength: 0,
			                options: {schema: SpruceSchemas.Forms.v2021_07_02.ListFormsFormSchema,}
			            },
			    }
		}

		type ListFormsResponsePayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.ListFormsResponsePayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface UpdateCompletedFormEmitPayload {
			
				
				'sourceFormId': string
				
				'values'?: (Record<string, any>)[]| undefined | null
		}

		interface UpdateCompletedFormEmitPayloadSchema extends SpruceSchema.Schema {
			id: 'updateCompletedFormEmitPayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'sourceFormId': {
			                type: 'id',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'values': {
			                type: 'raw',
			                isArray: true,
			                options: {valueType: `Record<string, any>`,}
			            },
			    }
		}

		type UpdateCompletedFormEmitPayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.UpdateCompletedFormEmitPayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface UpdateCompletedFormEmitTargetAndPayload {
			
				
				'payload': SpruceSchemas.Forms.v2021_07_02.UpdateCompletedFormEmitPayload
		}

		interface UpdateCompletedFormEmitTargetAndPayloadSchema extends SpruceSchema.Schema {
			id: 'updateCompletedFormEmitTargetAndPayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'payload': {
			                type: 'schema',
			                isRequired: true,
			                options: {schema: SpruceSchemas.Forms.v2021_07_02.UpdateCompletedFormEmitPayloadSchema,}
			            },
			    }
		}

		type UpdateCompletedFormEmitTargetAndPayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.UpdateCompletedFormEmitTargetAndPayloadSchema>

	}


	namespace SpruceSchemas.Forms.v2021_07_02 {

		
		interface UpdateCompletedFormResponsePayload {
			
				
				'completedFormId': string
		}

		interface UpdateCompletedFormResponsePayloadSchema extends SpruceSchema.Schema {
			id: 'updateCompletedFormResponsePayload',
			version: 'v2021_07_02',
			namespace: 'Forms',
			name: '',
			    fields: {
			            /** . */
			            'completedFormId': {
			                type: 'id',
			                isRequired: true,
			                options: undefined
			            },
			    }
		}

		type UpdateCompletedFormResponsePayloadEntity = SchemaEntity<SpruceSchemas.Forms.v2021_07_02.UpdateCompletedFormResponsePayloadSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		
		interface GeneratedDir {
			
				
				'name': string
				
				'path': string
				
				'description'?: string| undefined | null
				
				'action': ("skipped" | "generated" | "updated" | "deleted")
		}

		interface GeneratedDirSchema extends SpruceSchema.Schema {
			id: 'generatedDir',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: '',
			    fields: {
			            /** . */
			            'name': {
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'path': {
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'description': {
			                type: 'text',
			                options: undefined
			            },
			            /** . */
			            'action': {
			                type: 'select',
			                isRequired: true,
			                options: {choices: [{"label":"Skipped","value":"skipped"},{"label":"Generated","value":"generated"},{"label":"Updated","value":"updated"},{"label":"Deleted","value":"deleted"}],}
			            },
			    }
		}

		type GeneratedDirEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.GeneratedDirSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		
		interface GeneratedFile {
			
				
				'name': string
				
				'path': string
				
				'description'?: string| undefined | null
				
				'action': ("skipped" | "generated" | "updated" | "deleted")
		}

		interface GeneratedFileSchema extends SpruceSchema.Schema {
			id: 'generatedFile',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: '',
			    fields: {
			            /** . */
			            'name': {
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'path': {
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			            /** . */
			            'description': {
			                type: 'text',
			                options: undefined
			            },
			            /** . */
			            'action': {
			                type: 'select',
			                isRequired: true,
			                options: {choices: [{"label":"Skipped","value":"skipped"},{"label":"Generated","value":"generated"},{"label":"Updated","value":"updated"},{"label":"Deleted","value":"deleted"}],}
			            },
			    }
		}

		type GeneratedFileEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.GeneratedFileSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		
		interface WatcherDidDetectChangesEmitPayload {
			
				
				'changes': ({ schemaId: 'generatedFile', version: 'v2020_07_22', values: SpruceSchemas.SpruceCli.v2020_07_22.GeneratedFile } | { schemaId: 'generatedDir', version: 'v2020_07_22', values: SpruceSchemas.SpruceCli.v2020_07_22.GeneratedDir })[]
		}

		interface WatcherDidDetectChangesEmitPayloadSchema extends SpruceSchema.Schema {
			id: 'watcherDidDetectChangesEmitPayload',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Watcher did detect changes emit payload',
			    fields: {
			            /** . */
			            'changes': {
			                type: 'schema',
			                isRequired: true,
			                isArray: true,
			                options: {schemas: (SpruceSchemas.SpruceCli.v2020_07_22.GeneratedFileSchema | SpruceSchemas.SpruceCli.v2020_07_22.GeneratedDirSchema)[],}
			            },
			    }
		}

		type WatcherDidDetectChangesEmitPayloadEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.WatcherDidDetectChangesEmitPayloadSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Options skill.upgrade. */
		interface UpgradeSkillOptions {
			
				/** Upgrade mode. */
				'upgradeMode'?: ("askForChanged" | "forceEverything" | "forceRequiredSkipRest")| undefined | null
		}

		interface UpgradeSkillOptionsSchema extends SpruceSchema.Schema {
			id: 'upgradeSkillOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Upgrade skill action',
			description: 'Options skill.upgrade.',
			    fields: {
			            /** Upgrade mode. */
			            'upgradeMode': {
			                label: 'Upgrade mode',
			                type: 'select',
			                defaultValue: "askForChanged",
			                options: {choices: [{"value":"askForChanged","label":"Ask for changed files"},{"value":"forceEverything","label":"Force everything"},{"value":"forceRequiredSkipRest","label":"Force required (skipping all non-essential)"}],}
			            },
			    }
		}

		type UpgradeSkillOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.UpgradeSkillOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Test your might! 💪 */
		interface TestOptions {
			
				/** Report while running. Should I output the test results while they are running? */
				'shouldReportWhileRunning'?: boolean| undefined | null
				/** Pattern. I'll filter all tests that match this pattern */
				'pattern'?: string| undefined | null
				/** Inspect. Pass --inspect related args to test process. */
				'inspect'?: number| undefined | null
				/** Should wait for manual start?. */
				'shouldHoldAtStart'?: boolean| undefined | null
				/** Wait until tests are finished. For testing. Returns immediately after executing test so the running process can be managed programatically. */
				'shouldReturnImmediately'?: boolean| undefined | null
				/** Watch. */
				'watchMode'?: ("off" | "standard" | "smart")| undefined | null
		}

		interface TestOptionsSchema extends SpruceSchema.Schema {
			id: 'testOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Test skill',
			description: 'Test your might! 💪',
			    fields: {
			            /** Report while running. Should I output the test results while they are running? */
			            'shouldReportWhileRunning': {
			                label: 'Report while running',
			                type: 'boolean',
			                hint: 'Should I output the test results while they are running?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Pattern. I'll filter all tests that match this pattern */
			            'pattern': {
			                label: 'Pattern',
			                type: 'text',
			                hint: 'I\'ll filter all tests that match this pattern',
			                options: undefined
			            },
			            /** Inspect. Pass --inspect related args to test process. */
			            'inspect': {
			                label: 'Inspect',
			                type: 'number',
			                hint: 'Pass --inspect related args to test process.',
			                options: undefined
			            },
			            /** Should wait for manual start?. */
			            'shouldHoldAtStart': {
			                label: 'Should wait for manual start?',
			                type: 'boolean',
			                defaultValue: false,
			                options: undefined
			            },
			            /** Wait until tests are finished. For testing. Returns immediately after executing test so the running process can be managed programatically. */
			            'shouldReturnImmediately': {
			                label: 'Wait until tests are finished',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'For testing. Returns immediately after executing test so the running process can be managed programatically.',
			                defaultValue: false,
			                options: undefined
			            },
			            /** Watch. */
			            'watchMode': {
			                label: 'Watch',
			                type: 'select',
			                options: {choices: [{"value":"off","label":"Off"},{"value":"standard","label":"Standard"},{"value":"smart","label":"Smart"}],}
			            },
			    }
		}

		type TestOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.TestOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Options for schema.sync. */
		interface SyncSchemasOptions {
			
				/** Field types directory. Where field types and interfaces will be generated. */
				'fieldTypesDestinationDir'?: string| undefined | null
				/** Addons lookup directory. Where I'll look for new schema fields to be registered. */
				'addonsLookupDir'?: string| undefined | null
				/** Generate field types. Should I generate field types too? */
				'generateFieldTypes'?: boolean| undefined | null
				/** Schema types destination directory. Where I will generate schema types and interfaces. */
				'schemaTypesDestinationDirOrFile'?: string| undefined | null
				/** . Where I should look for your schema builders? */
				'schemaLookupDir'?: string| undefined | null
				/** Module import. When other skills use your schemas, will they import them from a module? */
				'moduleToImportFromWhenRemote'?: string| undefined | null
				/** Auto install missing dependencies. */
				'shouldInstallMissingDependencies'?: boolean| undefined | null
				/** Enable versioning. Should we use versioning? */
				'shouldEnableVersioning'?: boolean| undefined | null
				/** Global namespace. The name you'll use when accessing these schemas, e.g. SpruceSchemas */
				'globalSchemaNamespace'?: string| undefined | null
				/** Fetch remote schemas. I will pull in schemas from other features. */
				'shouldFetchRemoteSchemas'?: boolean| undefined | null
				/** Fetch local schemas. I will look in schemaLookupDir to load local schemas. */
				'shouldFetchLocalSchemas'?: boolean| undefined | null
				/** Fetch core schemas. Should I pull in core schemas too? */
				'shouldFetchCoreSchemas'?: boolean| undefined | null
				/** Generate core schemas. Used only for updating the @sprucelabs/spruce-core-schemas. Ensures core schemas are generated like local schemas. Also an alias for `--shouldFetchRemoteSchemas=false --shouldFetchCoreSchemas=false --generateStandaloneTypesFile. */
				'shouldGenerateCoreSchemaTypes'?: boolean| undefined | null
				/** Register built schemas. Should the schemas use the SchemaRegistry for tracking? */
				'registerBuiltSchemas'?: boolean| undefined | null
				/** Delete directory if no schemas. Should I delete the schema directory if no schemas are found? */
				'deleteDestinationDirIfNoSchemas'?: boolean| undefined | null
				/** Delete orphaned schemas. Should I delete schemas where the builders are missing? */
				'deleteOrphanedSchemas'?: boolean| undefined | null
				/** Generate standalone types file. By default, I'll generate a types file that augments core types from @sprucelabs/spruce-core-schemas. Setting this to true will generate a stand alone types file. */
				'generateStandaloneTypesFile'?: boolean| undefined | null
				/**  message. */
				'syncingMessage'?: string| undefined | null
		}

		interface SyncSchemasOptionsSchema extends SpruceSchema.Schema {
			id: 'syncSchemasOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Sync schemas action',
			description: 'Options for schema.sync.',
			    fields: {
			            /** Field types directory. Where field types and interfaces will be generated. */
			            'fieldTypesDestinationDir': {
			                label: 'Field types directory',
			                type: 'text',
			                isPrivate: true,
			                hint: 'Where field types and interfaces will be generated.',
			                defaultValue: "#spruce/schemas",
			                options: undefined
			            },
			            /** Addons lookup directory. Where I'll look for new schema fields to be registered. */
			            'addonsLookupDir': {
			                label: 'Addons lookup directory',
			                type: 'text',
			                hint: 'Where I\'ll look for new schema fields to be registered.',
			                defaultValue: "src/addons",
			                options: undefined
			            },
			            /** Generate field types. Should I generate field types too? */
			            'generateFieldTypes': {
			                label: 'Generate field types',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should I generate field types too?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Schema types destination directory. Where I will generate schema types and interfaces. */
			            'schemaTypesDestinationDirOrFile': {
			                label: 'Schema types destination directory',
			                type: 'text',
			                hint: 'Where I will generate schema types and interfaces.',
			                defaultValue: "#spruce/schemas",
			                options: undefined
			            },
			            /** . Where I should look for your schema builders? */
			            'schemaLookupDir': {
			                type: 'text',
			                hint: 'Where I should look for your schema builders?',
			                defaultValue: "src/schemas",
			                options: undefined
			            },
			            /** Module import. When other skills use your schemas, will they import them from a module? */
			            'moduleToImportFromWhenRemote': {
			                label: 'Module import',
			                type: 'text',
			                hint: 'When other skills use your schemas, will they import them from a module?',
			                options: undefined
			            },
			            /** Auto install missing dependencies. */
			            'shouldInstallMissingDependencies': {
			                label: 'Auto install missing dependencies',
			                type: 'boolean',
			                options: undefined
			            },
			            /** Enable versioning. Should we use versioning? */
			            'shouldEnableVersioning': {
			                label: 'Enable versioning',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should we use versioning?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Global namespace. The name you'll use when accessing these schemas, e.g. SpruceSchemas */
			            'globalSchemaNamespace': {
			                label: 'Global namespace',
			                type: 'text',
			                isPrivate: true,
			                hint: 'The name you\'ll use when accessing these schemas, e.g. SpruceSchemas',
			                defaultValue: "SpruceSchemas",
			                options: undefined
			            },
			            /** Fetch remote schemas. I will pull in schemas from other features. */
			            'shouldFetchRemoteSchemas': {
			                label: 'Fetch remote schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'I will pull in schemas from other features.',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Fetch local schemas. I will look in schemaLookupDir to load local schemas. */
			            'shouldFetchLocalSchemas': {
			                label: 'Fetch local schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'I will look in schemaLookupDir to load local schemas.',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Fetch core schemas. Should I pull in core schemas too? */
			            'shouldFetchCoreSchemas': {
			                label: 'Fetch core schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should I pull in core schemas too?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Generate core schemas. Used only for updating the @sprucelabs/spruce-core-schemas. Ensures core schemas are generated like local schemas. Also an alias for `--shouldFetchRemoteSchemas=false --shouldFetchCoreSchemas=false --generateStandaloneTypesFile. */
			            'shouldGenerateCoreSchemaTypes': {
			                label: 'Generate core schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Used only for updating the @sprucelabs/spruce-core-schemas. Ensures core schemas are generated like local schemas. Also an alias for `--shouldFetchRemoteSchemas=false --shouldFetchCoreSchemas=false --generateStandaloneTypesFile.',
			                options: undefined
			            },
			            /** Register built schemas. Should the schemas use the SchemaRegistry for tracking? */
			            'registerBuiltSchemas': {
			                label: 'Register built schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should the schemas use the SchemaRegistry for tracking?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Delete directory if no schemas. Should I delete the schema directory if no schemas are found? */
			            'deleteDestinationDirIfNoSchemas': {
			                label: 'Delete directory if no schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should I delete the schema directory if no schemas are found?',
			                defaultValue: false,
			                options: undefined
			            },
			            /** Delete orphaned schemas. Should I delete schemas where the builders are missing? */
			            'deleteOrphanedSchemas': {
			                label: 'Delete orphaned schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should I delete schemas where the builders are missing?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Generate standalone types file. By default, I'll generate a types file that augments core types from @sprucelabs/spruce-core-schemas. Setting this to true will generate a stand alone types file. */
			            'generateStandaloneTypesFile': {
			                label: 'Generate standalone types file',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'By default, I\'ll generate a types file that augments core types from @sprucelabs/spruce-core-schemas. Setting this to true will generate a stand alone types file.',
			                defaultValue: false,
			                options: undefined
			            },
			            /**  message. */
			            'syncingMessage': {
			                label: ' message',
			                type: 'text',
			                isPrivate: true,
			                defaultValue: "Syncing schemas...",
			                options: undefined
			            },
			    }
		}

		type SyncSchemasOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.SyncSchemasOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Sync schema fields so you can use schemas! */
		interface SyncSchemaFieldsOptions {
			
				/** Field types directory. Where field types and interfaces will be generated. */
				'fieldTypesDestinationDir'?: string| undefined | null
				/** Addons lookup directory. Where I'll look for new schema fields to be registered. */
				'addonsLookupDir'?: string| undefined | null
				/** Generate field types. Should I generate field types too? */
				'generateFieldTypes'?: boolean| undefined | null
		}

		interface SyncSchemaFieldsOptionsSchema extends SpruceSchema.Schema {
			id: 'syncSchemaFieldsOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'syncSchemaFieldsOptions',
			description: 'Sync schema fields so you can use schemas!',
			    fields: {
			            /** Field types directory. Where field types and interfaces will be generated. */
			            'fieldTypesDestinationDir': {
			                label: 'Field types directory',
			                type: 'text',
			                isPrivate: true,
			                hint: 'Where field types and interfaces will be generated.',
			                defaultValue: "#spruce/schemas",
			                options: undefined
			            },
			            /** Addons lookup directory. Where I'll look for new schema fields to be registered. */
			            'addonsLookupDir': {
			                label: 'Addons lookup directory',
			                type: 'text',
			                hint: 'Where I\'ll look for new schema fields to be registered.',
			                defaultValue: "src/addons",
			                options: undefined
			            },
			            /** Generate field types. Should I generate field types too? */
			            'generateFieldTypes': {
			                label: 'Generate field types',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should I generate field types too?',
			                defaultValue: true,
			                options: undefined
			            },
			    }
		}

		type SyncSchemaFieldsOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.SyncSchemaFieldsOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Pull down event contracts from Mercury to make them available in your skill. */
		interface SyncEventOptions {
			
				/** Contract destination. Where I will generate event contracts. */
				'contractDestinationDir'?: string| undefined | null
				/** Schema types lookup directory. Where I will lookup schema types and interfaces. */
				'schemaTypesLookupDir'?: string| undefined | null
				/** Sync only core events. For use in @sprucelabs/mercury-types */
				'shouldSyncOnlyCoreEvents'?: boolean| undefined | null
				/** Event signature types file. */
				'skillEventContractTypesFile'?: string| undefined | null
				/** Event builder file. */
				'eventBuilderFile'?: string| undefined | null
		}

		interface SyncEventOptionsSchema extends SpruceSchema.Schema {
			id: 'syncEventOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'sync event action',
			description: 'Pull down event contracts from Mercury to make them available in your skill.',
			    fields: {
			            /** Contract destination. Where I will generate event contracts. */
			            'contractDestinationDir': {
			                label: 'Contract destination',
			                type: 'text',
			                hint: 'Where I will generate event contracts.',
			                defaultValue: "#spruce/events",
			                options: undefined
			            },
			            /** Schema types lookup directory. Where I will lookup schema types and interfaces. */
			            'schemaTypesLookupDir': {
			                label: 'Schema types lookup directory',
			                type: 'text',
			                hint: 'Where I will lookup schema types and interfaces.',
			                defaultValue: "#spruce/schemas",
			                options: undefined
			            },
			            /** Sync only core events. For use in @sprucelabs/mercury-types */
			            'shouldSyncOnlyCoreEvents': {
			                label: 'Sync only core events',
			                type: 'boolean',
			                hint: 'For use in @sprucelabs/mercury-types',
			                options: undefined
			            },
			            /** Event signature types file. */
			            'skillEventContractTypesFile': {
			                label: 'Event signature types file',
			                type: 'text',
			                defaultValue: "@sprucelabs/mercury-types/build/types/mercury.types",
			                options: undefined
			            },
			            /** Event builder file. */
			            'eventBuilderFile': {
			                label: 'Event builder file',
			                type: 'text',
			                defaultValue: "@sprucelabs/mercury-types",
			                options: undefined
			            },
			    }
		}

		type SyncEventOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.SyncEventOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Keep your errors types in sync with your builders */
		interface SyncErrorOptions {
			
				/** Field types directory. Where field types and interfaces will be generated. */
				'fieldTypesDestinationDir'?: string| undefined | null
				/** Addons lookup directory. Where I'll look for new schema fields to be registered. */
				'addonsLookupDir'?: string| undefined | null
				/** Generate field types. Should I generate field types too? */
				'generateFieldTypes'?: boolean| undefined | null
				/** Schema types destination directory. Where I will generate schema types and interfaces. */
				'schemaTypesDestinationDirOrFile'?: string| undefined | null
				/** . Where I should look for your schema builders? */
				'schemaLookupDir'?: string| undefined | null
				/** Module import. When other skills use your schemas, will they import them from a module? */
				'moduleToImportFromWhenRemote'?: string| undefined | null
				/** Auto install missing dependencies. */
				'shouldInstallMissingDependencies'?: boolean| undefined | null
				/** Enable versioning. Should we use versioning? */
				'shouldEnableVersioning'?: boolean| undefined | null
				/** Global namespace. The name you'll use when accessing these schemas, e.g. SpruceSchemas */
				'globalSchemaNamespace'?: string| undefined | null
				/** Fetch remote schemas. I will pull in schemas from other features. */
				'shouldFetchRemoteSchemas'?: boolean| undefined | null
				/** Fetch local schemas. I will look in schemaLookupDir to load local schemas. */
				'shouldFetchLocalSchemas'?: boolean| undefined | null
				/** Fetch core schemas. Should I pull in core schemas too? */
				'shouldFetchCoreSchemas'?: boolean| undefined | null
				/** Generate core schemas. Used only for updating the @sprucelabs/spruce-core-schemas. Ensures core schemas are generated like local schemas. Also an alias for `--shouldFetchRemoteSchemas=false --shouldFetchCoreSchemas=false --generateStandaloneTypesFile. */
				'shouldGenerateCoreSchemaTypes'?: boolean| undefined | null
				/** Register built schemas. Should the schemas use the SchemaRegistry for tracking? */
				'registerBuiltSchemas'?: boolean| undefined | null
				/** Generate standalone types file. By default, I'll generate a types file that augments core types from @sprucelabs/spruce-core-schemas. Setting this to true will generate a stand alone types file. */
				'generateStandaloneTypesFile'?: boolean| undefined | null
				/**  message. */
				'syncingMessage'?: string| undefined | null
				/** Error class destination. Where I'll save your new Error class file? */
				'errorClassDestinationDir': string
				/** . Where I should look for your error builders? */
				'errorLookupDir'?: string| undefined | null
				/** Types destination dir. This is where error options and type information will be written */
				'errorTypesDestinationDir'?: string| undefined | null
		}

		interface SyncErrorOptionsSchema extends SpruceSchema.Schema {
			id: 'syncErrorOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Sync error action',
			description: 'Keep your errors types in sync with your builders',
			    fields: {
			            /** Field types directory. Where field types and interfaces will be generated. */
			            'fieldTypesDestinationDir': {
			                label: 'Field types directory',
			                type: 'text',
			                isPrivate: true,
			                hint: 'Where field types and interfaces will be generated.',
			                defaultValue: "#spruce/schemas",
			                options: undefined
			            },
			            /** Addons lookup directory. Where I'll look for new schema fields to be registered. */
			            'addonsLookupDir': {
			                label: 'Addons lookup directory',
			                type: 'text',
			                hint: 'Where I\'ll look for new schema fields to be registered.',
			                defaultValue: "src/addons",
			                options: undefined
			            },
			            /** Generate field types. Should I generate field types too? */
			            'generateFieldTypes': {
			                label: 'Generate field types',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should I generate field types too?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Schema types destination directory. Where I will generate schema types and interfaces. */
			            'schemaTypesDestinationDirOrFile': {
			                label: 'Schema types destination directory',
			                type: 'text',
			                hint: 'Where I will generate schema types and interfaces.',
			                defaultValue: "#spruce/schemas",
			                options: undefined
			            },
			            /** . Where I should look for your schema builders? */
			            'schemaLookupDir': {
			                type: 'text',
			                hint: 'Where I should look for your schema builders?',
			                defaultValue: "src/schemas",
			                options: undefined
			            },
			            /** Module import. When other skills use your schemas, will they import them from a module? */
			            'moduleToImportFromWhenRemote': {
			                label: 'Module import',
			                type: 'text',
			                hint: 'When other skills use your schemas, will they import them from a module?',
			                options: undefined
			            },
			            /** Auto install missing dependencies. */
			            'shouldInstallMissingDependencies': {
			                label: 'Auto install missing dependencies',
			                type: 'boolean',
			                options: undefined
			            },
			            /** Enable versioning. Should we use versioning? */
			            'shouldEnableVersioning': {
			                label: 'Enable versioning',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should we use versioning?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Global namespace. The name you'll use when accessing these schemas, e.g. SpruceSchemas */
			            'globalSchemaNamespace': {
			                label: 'Global namespace',
			                type: 'text',
			                isPrivate: true,
			                hint: 'The name you\'ll use when accessing these schemas, e.g. SpruceSchemas',
			                defaultValue: "SpruceSchemas",
			                options: undefined
			            },
			            /** Fetch remote schemas. I will pull in schemas from other features. */
			            'shouldFetchRemoteSchemas': {
			                label: 'Fetch remote schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'I will pull in schemas from other features.',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Fetch local schemas. I will look in schemaLookupDir to load local schemas. */
			            'shouldFetchLocalSchemas': {
			                label: 'Fetch local schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'I will look in schemaLookupDir to load local schemas.',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Fetch core schemas. Should I pull in core schemas too? */
			            'shouldFetchCoreSchemas': {
			                label: 'Fetch core schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should I pull in core schemas too?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Generate core schemas. Used only for updating the @sprucelabs/spruce-core-schemas. Ensures core schemas are generated like local schemas. Also an alias for `--shouldFetchRemoteSchemas=false --shouldFetchCoreSchemas=false --generateStandaloneTypesFile. */
			            'shouldGenerateCoreSchemaTypes': {
			                label: 'Generate core schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Used only for updating the @sprucelabs/spruce-core-schemas. Ensures core schemas are generated like local schemas. Also an alias for `--shouldFetchRemoteSchemas=false --shouldFetchCoreSchemas=false --generateStandaloneTypesFile.',
			                options: undefined
			            },
			            /** Register built schemas. Should the schemas use the SchemaRegistry for tracking? */
			            'registerBuiltSchemas': {
			                label: 'Register built schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should the schemas use the SchemaRegistry for tracking?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Generate standalone types file. By default, I'll generate a types file that augments core types from @sprucelabs/spruce-core-schemas. Setting this to true will generate a stand alone types file. */
			            'generateStandaloneTypesFile': {
			                label: 'Generate standalone types file',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'By default, I\'ll generate a types file that augments core types from @sprucelabs/spruce-core-schemas. Setting this to true will generate a stand alone types file.',
			                defaultValue: false,
			                options: undefined
			            },
			            /**  message. */
			            'syncingMessage': {
			                label: ' message',
			                type: 'text',
			                isPrivate: true,
			                defaultValue: "Syncing schemas...",
			                options: undefined
			            },
			            /** Error class destination. Where I'll save your new Error class file? */
			            'errorClassDestinationDir': {
			                label: 'Error class destination',
			                type: 'text',
			                isPrivate: true,
			                isRequired: true,
			                hint: 'Where I\'ll save your new Error class file?',
			                defaultValue: "src/errors",
			                options: undefined
			            },
			            /** . Where I should look for your error builders? */
			            'errorLookupDir': {
			                type: 'text',
			                hint: 'Where I should look for your error builders?',
			                defaultValue: "src/errors",
			                options: undefined
			            },
			            /** Types destination dir. This is where error options and type information will be written */
			            'errorTypesDestinationDir': {
			                label: 'Types destination dir',
			                type: 'text',
			                hint: 'This is where error options and type information will be written',
			                defaultValue: "#spruce/errors",
			                options: undefined
			            },
			    }
		}

		type SyncErrorOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.SyncErrorOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		
		interface SkillFeature {
			
				
				'destination'?: string| undefined | null
				/** What's the name of your skill?. */
				'name': string
				/** How would you describe your skill?. */
				'description': string
		}

		interface SkillFeatureSchema extends SpruceSchema.Schema {
			id: 'skillFeature',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Skill feature options',
			    fields: {
			            /** . */
			            'destination': {
			                type: 'text',
			                defaultValue: ".",
			                options: undefined
			            },
			            /** What's the name of your skill?. */
			            'name': {
			                label: 'What\'s the name of your skill?',
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			            /** How would you describe your skill?. */
			            'description': {
			                label: 'How would you describe your skill?',
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			    }
		}

		type SkillFeatureEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.SkillFeatureSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Install vscode extensions, launch configs, and settings the Spruce team uses in-house! */
		interface SetupVscodeOptions {
			
				/** Install everything. */
				'all'?: boolean| undefined | null
		}

		interface SetupVscodeOptionsSchema extends SpruceSchema.Schema {
			id: 'setupVscodeOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Setup vscode action',
			description: 'Install vscode extensions, launch configs, and settings the Spruce team uses in-house!',
			    fields: {
			            /** Install everything. */
			            'all': {
			                label: 'Install everything',
			                type: 'boolean',
			                options: undefined
			            },
			    }
		}

		type SetupVscodeOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.SetupVscodeOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Use this with in your CI/CD environment to get your skill ready to run tests. */
		interface SetupTestsOptions {
			
				/** Demo phone number. */
				'demoNumber': string
				/** Skill slug. */
				'skillSlug': string
		}

		interface SetupTestsOptionsSchema extends SpruceSchema.Schema {
			id: 'setupTestsOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Setup tests options',
			description: 'Use this with in your CI/CD environment to get your skill ready to run tests.',
			    fields: {
			            /** Demo phone number. */
			            'demoNumber': {
			                label: 'Demo phone number',
			                type: 'phone',
			                isRequired: true,
			                options: undefined
			            },
			            /** Skill slug. */
			            'skillSlug': {
			                label: 'Skill slug',
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			    }
		}

		type SetupTestsOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.SetupTestsOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		
		interface RegisterDashboardWidgetsEmitPayloadSchema {
			
				
				'widgets'?: (BaseWidget)| undefined | null
		}

		interface RegisterDashboardWidgetsEmitPayloadSchemaSchema extends SpruceSchema.Schema {
			id: 'registerDashboardWidgetsEmitPayloadSchema',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'register dashboard widgets emit payload schema',
			    fields: {
			            /** . */
			            'widgets': {
			                type: 'raw',
			                options: {valueType: `BaseWidget`,}
			            },
			    }
		}

		type RegisterDashboardWidgetsEmitPayloadSchemaEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.RegisterDashboardWidgetsEmitPayloadSchemaSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** A stripped down cli user with token details for login */
		interface PersonWithToken {
			
				/** Id. */
				'id': string
				/** Casual name. The name you can use when talking to this person. */
				'casualName': string
				
				'token': string
				/** Logged in. */
				'isLoggedIn'?: boolean| undefined | null
		}

		interface PersonWithTokenSchema extends SpruceSchema.Schema {
			id: 'personWithToken',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: '',
			description: 'A stripped down cli user with token details for login',
			    fields: {
			            /** Id. */
			            'id': {
			                label: 'Id',
			                type: 'id',
			                isRequired: true,
			                options: undefined
			            },
			            /** Casual name. The name you can use when talking to this person. */
			            'casualName': {
			                label: 'Casual name',
			                type: 'text',
			                isRequired: true,
			                hint: 'The name you can use when talking to this person.',
			                options: undefined
			            },
			            /** . */
			            'token': {
			                type: 'text',
			                isRequired: true,
			                options: undefined
			            },
			            /** Logged in. */
			            'isLoggedIn': {
			                label: 'Logged in',
			                type: 'boolean',
			                options: undefined
			            },
			    }
		}

		type PersonWithTokenEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.PersonWithTokenSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Track onboarding progress and tutorials &amp; quizzes completed. */
		interface Onboarding {
			
				/** mode. */
				'mode': ("short" | "immersive" | "off")
				/** Stage. */
				'stage'?: ("create.skill" | "test")| undefined | null
		}

		interface OnboardingSchema extends SpruceSchema.Schema {
			id: 'onboarding',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Onboarding',
			description: 'Track onboarding progress and tutorials & quizzes completed.',
			    fields: {
			            /** mode. */
			            'mode': {
			                label: 'mode',
			                type: 'select',
			                isRequired: true,
			                options: {choices: [{"label":"Short","value":"short"},{"label":"Immersive","value":"immersive"},{"label":"Off","value":"off"}],}
			            },
			            /** Stage. */
			            'stage': {
			                label: 'Stage',
			                type: 'select',
			                options: {choices: [{"label":"Create skill","value":"create.skill"},{"label":"Test","value":"test"}],}
			            },
			    }
		}

		type OnboardingEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.OnboardingSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** The question is; Are you read? ⚡️ */
		interface OnboardOptions {
			
		}

		interface OnboardOptionsSchema extends SpruceSchema.Schema {
			id: 'onboardOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Onboard action',
			description: 'The question is; Are you read? ⚡️',
			    fields: {
			    }
		}

		type OnboardOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.OnboardOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Used to collect input on the names of a class or interface */
		interface NamedTemplateItem {
			
				/** Readable name. The name people will read */
				'nameReadable': string
				/** Readable name (plural). The plural form of the name people will read */
				'nameReadablePlural': string
				/** Camel case name. camelCase version of the name */
				'nameCamel': string
				/** Plural camel case name. camelCase version of the name */
				'nameCamelPlural'?: string| undefined | null
				/** Pascal case name. PascalCase of the name */
				'namePascal'?: string| undefined | null
				/** Plural Pascal case name. PascalCase of the name */
				'namePascalPlural'?: string| undefined | null
				/** Constant case name. CONST_CASE of the name */
				'nameConst'?: string| undefined | null
				/** Kebab case name. kebab-case of the name */
				'nameKebab'?: string| undefined | null
				/** Snake case name. snake_case of the name */
				'nameSnake'?: string| undefined | null
				/** Snake case name (plural). snakes_case of the name */
				'nameSnakePlural'?: string| undefined | null
				/** Description. Describe a bit more here */
				'description'?: string| undefined | null
		}

		interface NamedTemplateItemSchema extends SpruceSchema.Schema {
			id: 'namedTemplateItem',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'NamedTemplateItem',
			description: 'Used to collect input on the names of a class or interface',
			    fields: {
			            /** Readable name. The name people will read */
			            'nameReadable': {
			                label: 'Readable name',
			                type: 'text',
			                isRequired: true,
			                hint: 'The name people will read',
			                options: undefined
			            },
			            /** Readable name (plural). The plural form of the name people will read */
			            'nameReadablePlural': {
			                label: 'Readable name (plural)',
			                type: 'text',
			                isRequired: true,
			                hint: 'The plural form of the name people will read',
			                options: undefined
			            },
			            /** Camel case name. camelCase version of the name */
			            'nameCamel': {
			                label: 'Camel case name',
			                type: 'text',
			                isRequired: true,
			                hint: 'camelCase version of the name',
			                options: undefined
			            },
			            /** Plural camel case name. camelCase version of the name */
			            'nameCamelPlural': {
			                label: 'Plural camel case name',
			                type: 'text',
			                hint: 'camelCase version of the name',
			                options: undefined
			            },
			            /** Pascal case name. PascalCase of the name */
			            'namePascal': {
			                label: 'Pascal case name',
			                type: 'text',
			                hint: 'PascalCase of the name',
			                options: undefined
			            },
			            /** Plural Pascal case name. PascalCase of the name */
			            'namePascalPlural': {
			                label: 'Plural Pascal case name',
			                type: 'text',
			                hint: 'PascalCase of the name',
			                options: undefined
			            },
			            /** Constant case name. CONST_CASE of the name */
			            'nameConst': {
			                label: 'Constant case name',
			                type: 'text',
			                hint: 'CONST_CASE of the name',
			                options: undefined
			            },
			            /** Kebab case name. kebab-case of the name */
			            'nameKebab': {
			                label: 'Kebab case name',
			                type: 'text',
			                hint: 'kebab-case of the name',
			                options: undefined
			            },
			            /** Snake case name. snake_case of the name */
			            'nameSnake': {
			                label: 'Snake case name',
			                type: 'text',
			                hint: 'snake_case of the name',
			                options: undefined
			            },
			            /** Snake case name (plural). snakes_case of the name */
			            'nameSnakePlural': {
			                label: 'Snake case name (plural)',
			                type: 'text',
			                hint: 'snakes_case of the name',
			                options: undefined
			            },
			            /** Description. Describe a bit more here */
			            'description': {
			                label: 'Description',
			                type: 'text',
			                hint: 'Describe a bit more here',
			                options: undefined
			            },
			    }
		}

		type NamedTemplateItemEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.NamedTemplateItemSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Options for event.listen. */
		interface ListenEventOptions {
			
				/** Contract destination. Where I will generate event contracts. */
				'contractDestinationDir'?: string| undefined | null
				/** Schema types lookup directory. Where I will lookup schema types and interfaces. */
				'schemaTypesLookupDir'?: string| undefined | null
				/** Sync only core events. For use in @sprucelabs/mercury-types */
				'shouldSyncOnlyCoreEvents'?: boolean| undefined | null
				/** Event signature types file. */
				'skillEventContractTypesFile'?: string| undefined | null
				/** Event builder file. */
				'eventBuilderFile'?: string| undefined | null
				/** Namespace. */
				'eventNamespace'?: string| undefined | null
				/** Event name. */
				'eventName'?: string| undefined | null
				/** Events destination directory. Where should I add your listeners? */
				'listenerDestinationDir'?: string| undefined | null
				/** Version. Set a version yourself instead of letting me generate one for you */
				'version'?: string| undefined | null
		}

		interface ListenEventOptionsSchema extends SpruceSchema.Schema {
			id: 'listenEventOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Listen to event action',
			description: 'Options for event.listen.',
			    fields: {
			            /** Contract destination. Where I will generate event contracts. */
			            'contractDestinationDir': {
			                label: 'Contract destination',
			                type: 'text',
			                hint: 'Where I will generate event contracts.',
			                defaultValue: "#spruce/events",
			                options: undefined
			            },
			            /** Schema types lookup directory. Where I will lookup schema types and interfaces. */
			            'schemaTypesLookupDir': {
			                label: 'Schema types lookup directory',
			                type: 'text',
			                hint: 'Where I will lookup schema types and interfaces.',
			                defaultValue: "#spruce/schemas",
			                options: undefined
			            },
			            /** Sync only core events. For use in @sprucelabs/mercury-types */
			            'shouldSyncOnlyCoreEvents': {
			                label: 'Sync only core events',
			                type: 'boolean',
			                hint: 'For use in @sprucelabs/mercury-types',
			                options: undefined
			            },
			            /** Event signature types file. */
			            'skillEventContractTypesFile': {
			                label: 'Event signature types file',
			                type: 'text',
			                defaultValue: "@sprucelabs/mercury-types/build/types/mercury.types",
			                options: undefined
			            },
			            /** Event builder file. */
			            'eventBuilderFile': {
			                label: 'Event builder file',
			                type: 'text',
			                defaultValue: "@sprucelabs/mercury-types",
			                options: undefined
			            },
			            /** Namespace. */
			            'eventNamespace': {
			                label: 'Namespace',
			                type: 'text',
			                options: undefined
			            },
			            /** Event name. */
			            'eventName': {
			                label: 'Event name',
			                type: 'text',
			                options: undefined
			            },
			            /** Events destination directory. Where should I add your listeners? */
			            'listenerDestinationDir': {
			                label: 'Events destination directory',
			                type: 'text',
			                hint: 'Where should I add your listeners?',
			                defaultValue: "src/listeners",
			                options: undefined
			            },
			            /** Version. Set a version yourself instead of letting me generate one for you */
			            'version': {
			                label: 'Version',
			                type: 'text',
			                isPrivate: true,
			                hint: 'Set a version yourself instead of letting me generate one for you',
			                options: undefined
			            },
			    }
		}

		type ListenEventOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.ListenEventOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Install your skill at any organization you are connected to. */
		interface InstallSkillAtOrganizationOptions {
			
				/** Organization id. */
				'organizationId'?: string| undefined | null
		}

		interface InstallSkillAtOrganizationOptionsSchema extends SpruceSchema.Schema {
			id: 'installSkillAtOrganizationOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'install skill at organization action',
			description: 'Install your skill at any organization you are connected to.',
			    fields: {
			            /** Organization id. */
			            'organizationId': {
			                label: 'Organization id',
			                type: 'id',
			                options: undefined
			            },
			    }
		}

		type InstallSkillAtOrganizationOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.InstallSkillAtOrganizationOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Options for creating a new test. */
		interface CreateTestOptions {
			
				/** Type of test. */
				'type': ("behavioral" | "implementation")
				/** What are you testing?. E.g. Booking an appointment or turning on a light */
				'nameReadable': string
				/** Test destination directory. Where I'll save your new test. */
				'testDestinationDir'?: string| undefined | null
				/** Camel case name. camelCase version of the name */
				'nameCamel': string
				/** Pascal case name. PascalCase of the name */
				'namePascal'?: string| undefined | null
		}

		interface CreateTestOptionsSchema extends SpruceSchema.Schema {
			id: 'createTestOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Create test action',
			description: 'Options for creating a new test.',
			    fields: {
			            /** Type of test. */
			            'type': {
			                label: 'Type of test',
			                type: 'select',
			                isRequired: true,
			                options: {choices: [{"value":"behavioral","label":"Behavioral"},{"value":"implementation","label":"Implementation"}],}
			            },
			            /** What are you testing?. E.g. Booking an appointment or turning on a light */
			            'nameReadable': {
			                label: 'What are you testing?',
			                type: 'text',
			                isRequired: true,
			                hint: 'E.g. Booking an appointment or turning on a light',
			                options: undefined
			            },
			            /** Test destination directory. Where I'll save your new test. */
			            'testDestinationDir': {
			                label: 'Test destination directory',
			                type: 'text',
			                hint: 'Where I\'ll save your new test.',
			                defaultValue: "src/__tests__",
			                options: undefined
			            },
			            /** Camel case name. camelCase version of the name */
			            'nameCamel': {
			                label: 'Camel case name',
			                type: 'text',
			                isRequired: true,
			                hint: 'camelCase version of the name',
			                options: undefined
			            },
			            /** Pascal case name. PascalCase of the name */
			            'namePascal': {
			                label: 'Pascal case name',
			                type: 'text',
			                hint: 'PascalCase of the name',
			                options: undefined
			            },
			    }
		}

		type CreateTestOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.CreateTestOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Create the builder to a fresh new schema! */
		interface CreateSchemaOptions {
			
				/** Field types directory. Where field types and interfaces will be generated. */
				'fieldTypesDestinationDir'?: string| undefined | null
				/** Addons lookup directory. Where I'll look for new schema fields to be registered. */
				'addonsLookupDir'?: string| undefined | null
				/** Generate field types. Should I generate field types too? */
				'generateFieldTypes'?: boolean| undefined | null
				/** Schema types destination directory. Where I will generate schema types and interfaces. */
				'schemaTypesDestinationDirOrFile'?: string| undefined | null
				/** . Where I should look for your schema builders? */
				'schemaLookupDir'?: string| undefined | null
				/** Source module. If this schema should be imported from a node module vs generated locally. */
				'moduleToImportFromWhenRemote'?: string| undefined | null
				/** Auto install missing dependencies. */
				'shouldInstallMissingDependencies'?: boolean| undefined | null
				/** Enable versioning. Should we use versioning? */
				'shouldEnableVersioning'?: boolean| undefined | null
				/** Global namespace. The name you'll use when accessing these schemas, e.g. SpruceSchemas */
				'globalSchemaNamespace'?: string| undefined | null
				/** Fetch remote schemas. I will pull in schemas from other features. */
				'shouldFetchRemoteSchemas'?: boolean| undefined | null
				/** Fetch local schemas. I will look in schemaLookupDir to load local schemas. */
				'shouldFetchLocalSchemas'?: boolean| undefined | null
				/** Fetch core schemas. Should I pull in core schemas too? */
				'shouldFetchCoreSchemas'?: boolean| undefined | null
				/** Generate core schemas. Used only for updating the @sprucelabs/spruce-core-schemas. Ensures core schemas are generated like local schemas. Also an alias for `--shouldFetchRemoteSchemas=false --shouldFetchCoreSchemas=false --generateStandaloneTypesFile. */
				'shouldGenerateCoreSchemaTypes'?: boolean| undefined | null
				/** Register built schemas. Should the schemas use the SchemaRegistry for tracking? */
				'registerBuiltSchemas'?: boolean| undefined | null
				/** Delete directory if no schemas. Should I delete the schema directory if no schemas are found? */
				'deleteDestinationDirIfNoSchemas'?: boolean| undefined | null
				/** Delete orphaned schemas. Should I delete schemas where the builders are missing? */
				'deleteOrphanedSchemas'?: boolean| undefined | null
				/** Generate standalone types file. By default, I'll generate a types file that augments core types from @sprucelabs/spruce-core-schemas. Setting this to true will generate a stand alone types file. */
				'generateStandaloneTypesFile'?: boolean| undefined | null
				/**  message. */
				'syncingMessage'?: string| undefined | null
				/** Schema builder destination directory. Where I'll save the new schema builder. */
				'schemaBuilderDestinationDir'?: string| undefined | null
				/** Builder function. The function that builds this schema */
				'builderFunction'?: string| undefined | null
				/** Sync after creation. This will ensure types and schemas are in sync after you create your builder. */
				'syncAfterCreate'?: boolean| undefined | null
				/** Version. Set a version yourself instead of letting me generate one for you */
				'version'?: string| undefined | null
				/** Readable name. The name people will read */
				'nameReadable': string
				/** Pascal case name. PascalCase of the name */
				'namePascal'?: string| undefined | null
				/** Camel case name. camelCase version of the name */
				'nameCamel': string
				/** Description. Describe a bit more here */
				'description'?: string| undefined | null
		}

		interface CreateSchemaOptionsSchema extends SpruceSchema.Schema {
			id: 'createSchemaOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Create schema',
			description: 'Create the builder to a fresh new schema!',
			    fields: {
			            /** Field types directory. Where field types and interfaces will be generated. */
			            'fieldTypesDestinationDir': {
			                label: 'Field types directory',
			                type: 'text',
			                isPrivate: true,
			                hint: 'Where field types and interfaces will be generated.',
			                defaultValue: "#spruce/schemas",
			                options: undefined
			            },
			            /** Addons lookup directory. Where I'll look for new schema fields to be registered. */
			            'addonsLookupDir': {
			                label: 'Addons lookup directory',
			                type: 'text',
			                hint: 'Where I\'ll look for new schema fields to be registered.',
			                defaultValue: "src/addons",
			                options: undefined
			            },
			            /** Generate field types. Should I generate field types too? */
			            'generateFieldTypes': {
			                label: 'Generate field types',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should I generate field types too?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Schema types destination directory. Where I will generate schema types and interfaces. */
			            'schemaTypesDestinationDirOrFile': {
			                label: 'Schema types destination directory',
			                type: 'text',
			                hint: 'Where I will generate schema types and interfaces.',
			                defaultValue: "#spruce/schemas",
			                options: undefined
			            },
			            /** . Where I should look for your schema builders? */
			            'schemaLookupDir': {
			                type: 'text',
			                hint: 'Where I should look for your schema builders?',
			                defaultValue: "src/schemas",
			                options: undefined
			            },
			            /** Source module. If this schema should be imported from a node module vs generated locally. */
			            'moduleToImportFromWhenRemote': {
			                label: 'Source module',
			                type: 'text',
			                hint: 'If this schema should be imported from a node module vs generated locally.',
			                options: undefined
			            },
			            /** Auto install missing dependencies. */
			            'shouldInstallMissingDependencies': {
			                label: 'Auto install missing dependencies',
			                type: 'boolean',
			                options: undefined
			            },
			            /** Enable versioning. Should we use versioning? */
			            'shouldEnableVersioning': {
			                label: 'Enable versioning',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should we use versioning?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Global namespace. The name you'll use when accessing these schemas, e.g. SpruceSchemas */
			            'globalSchemaNamespace': {
			                label: 'Global namespace',
			                type: 'text',
			                isPrivate: true,
			                hint: 'The name you\'ll use when accessing these schemas, e.g. SpruceSchemas',
			                defaultValue: "SpruceSchemas",
			                options: undefined
			            },
			            /** Fetch remote schemas. I will pull in schemas from other features. */
			            'shouldFetchRemoteSchemas': {
			                label: 'Fetch remote schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'I will pull in schemas from other features.',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Fetch local schemas. I will look in schemaLookupDir to load local schemas. */
			            'shouldFetchLocalSchemas': {
			                label: 'Fetch local schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'I will look in schemaLookupDir to load local schemas.',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Fetch core schemas. Should I pull in core schemas too? */
			            'shouldFetchCoreSchemas': {
			                label: 'Fetch core schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should I pull in core schemas too?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Generate core schemas. Used only for updating the @sprucelabs/spruce-core-schemas. Ensures core schemas are generated like local schemas. Also an alias for `--shouldFetchRemoteSchemas=false --shouldFetchCoreSchemas=false --generateStandaloneTypesFile. */
			            'shouldGenerateCoreSchemaTypes': {
			                label: 'Generate core schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Used only for updating the @sprucelabs/spruce-core-schemas. Ensures core schemas are generated like local schemas. Also an alias for `--shouldFetchRemoteSchemas=false --shouldFetchCoreSchemas=false --generateStandaloneTypesFile.',
			                options: undefined
			            },
			            /** Register built schemas. Should the schemas use the SchemaRegistry for tracking? */
			            'registerBuiltSchemas': {
			                label: 'Register built schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should the schemas use the SchemaRegistry for tracking?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Delete directory if no schemas. Should I delete the schema directory if no schemas are found? */
			            'deleteDestinationDirIfNoSchemas': {
			                label: 'Delete directory if no schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should I delete the schema directory if no schemas are found?',
			                defaultValue: false,
			                options: undefined
			            },
			            /** Delete orphaned schemas. Should I delete schemas where the builders are missing? */
			            'deleteOrphanedSchemas': {
			                label: 'Delete orphaned schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should I delete schemas where the builders are missing?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Generate standalone types file. By default, I'll generate a types file that augments core types from @sprucelabs/spruce-core-schemas. Setting this to true will generate a stand alone types file. */
			            'generateStandaloneTypesFile': {
			                label: 'Generate standalone types file',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'By default, I\'ll generate a types file that augments core types from @sprucelabs/spruce-core-schemas. Setting this to true will generate a stand alone types file.',
			                defaultValue: false,
			                options: undefined
			            },
			            /**  message. */
			            'syncingMessage': {
			                label: ' message',
			                type: 'text',
			                isPrivate: true,
			                defaultValue: "Syncing schemas...",
			                options: undefined
			            },
			            /** Schema builder destination directory. Where I'll save the new schema builder. */
			            'schemaBuilderDestinationDir': {
			                label: 'Schema builder destination directory',
			                type: 'text',
			                hint: 'Where I\'ll save the new schema builder.',
			                defaultValue: "src/schemas",
			                options: undefined
			            },
			            /** Builder function. The function that builds this schema */
			            'builderFunction': {
			                label: 'Builder function',
			                type: 'text',
			                isPrivate: true,
			                hint: 'The function that builds this schema',
			                defaultValue: "buildSchema",
			                options: undefined
			            },
			            /** Sync after creation. This will ensure types and schemas are in sync after you create your builder. */
			            'syncAfterCreate': {
			                label: 'Sync after creation',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'This will ensure types and schemas are in sync after you create your builder.',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Version. Set a version yourself instead of letting me generate one for you */
			            'version': {
			                label: 'Version',
			                type: 'text',
			                isPrivate: true,
			                hint: 'Set a version yourself instead of letting me generate one for you',
			                options: undefined
			            },
			            /** Readable name. The name people will read */
			            'nameReadable': {
			                label: 'Readable name',
			                type: 'text',
			                isRequired: true,
			                hint: 'The name people will read',
			                options: undefined
			            },
			            /** Pascal case name. PascalCase of the name */
			            'namePascal': {
			                label: 'Pascal case name',
			                type: 'text',
			                hint: 'PascalCase of the name',
			                options: undefined
			            },
			            /** Camel case name. camelCase version of the name */
			            'nameCamel': {
			                label: 'Camel case name',
			                type: 'text',
			                isRequired: true,
			                hint: 'camelCase version of the name',
			                options: undefined
			            },
			            /** Description. Describe a bit more here */
			            'description': {
			                label: 'Description',
			                type: 'text',
			                hint: 'Describe a bit more here',
			                options: undefined
			            },
			    }
		}

		type CreateSchemaOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.CreateSchemaOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Skills can only communicate with people and skills associated with the same organization. This ensures people can get differentiated experiences across multiple businesses. */
		interface CreateOrganizationOptions {
			
				/** Name. The name people will read */
				'nameReadable': string
				/** Slug. kebab-case of the name */
				'nameKebab'?: string| undefined | null
		}

		interface CreateOrganizationOptionsSchema extends SpruceSchema.Schema {
			id: 'createOrganizationOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'create organization action',
			description: 'Skills can only communicate with people and skills associated with the same organization. This ensures people can get differentiated experiences across multiple businesses.',
			    fields: {
			            /** Name. The name people will read */
			            'nameReadable': {
			                label: 'Name',
			                type: 'text',
			                isRequired: true,
			                hint: 'The name people will read',
			                options: undefined
			            },
			            /** Slug. kebab-case of the name */
			            'nameKebab': {
			                label: 'Slug',
			                type: 'text',
			                hint: 'kebab-case of the name',
			                options: undefined
			            },
			    }
		}

		type CreateOrganizationOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.CreateOrganizationOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Create a builder for your brand new error!  */
		interface CreateErrorOptions {
			
				/** Field types directory. Where field types and interfaces will be generated. */
				'fieldTypesDestinationDir'?: string| undefined | null
				/** Addons lookup directory. Where I'll look for new schema fields to be registered. */
				'addonsLookupDir'?: string| undefined | null
				/** Generate field types. Should I generate field types too? */
				'generateFieldTypes'?: boolean| undefined | null
				/** Schema types destination directory. Where I will generate schema types and interfaces. */
				'schemaTypesDestinationDirOrFile'?: string| undefined | null
				/** . Where I should look for your schema builders? */
				'schemaLookupDir'?: string| undefined | null
				/** Module import. When other skills use your schemas, will they import them from a module? */
				'moduleToImportFromWhenRemote'?: string| undefined | null
				/** Auto install missing dependencies. */
				'shouldInstallMissingDependencies'?: boolean| undefined | null
				/** Enable versioning. Should we use versioning? */
				'shouldEnableVersioning'?: boolean| undefined | null
				/** Global namespace. The name you'll use when accessing these schemas, e.g. SpruceSchemas */
				'globalSchemaNamespace'?: string| undefined | null
				/** Fetch remote schemas. I will pull in schemas from other features. */
				'shouldFetchRemoteSchemas'?: boolean| undefined | null
				/** Fetch local schemas. I will look in schemaLookupDir to load local schemas. */
				'shouldFetchLocalSchemas'?: boolean| undefined | null
				/** Fetch core schemas. Should I pull in core schemas too? */
				'shouldFetchCoreSchemas'?: boolean| undefined | null
				/** Generate core schemas. Used only for updating the @sprucelabs/spruce-core-schemas. Ensures core schemas are generated like local schemas. Also an alias for `--shouldFetchRemoteSchemas=false --shouldFetchCoreSchemas=false --generateStandaloneTypesFile. */
				'shouldGenerateCoreSchemaTypes'?: boolean| undefined | null
				/** Register built schemas. Should the schemas use the SchemaRegistry for tracking? */
				'registerBuiltSchemas'?: boolean| undefined | null
				/** Generate standalone types file. By default, I'll generate a types file that augments core types from @sprucelabs/spruce-core-schemas. Setting this to true will generate a stand alone types file. */
				'generateStandaloneTypesFile'?: boolean| undefined | null
				/**  message. */
				'syncingMessage'?: string| undefined | null
				/** Error class destination. Where I'll save your new Error class file? */
				'errorClassDestinationDir': string
				/** . Where I should look for your error builders? */
				'errorLookupDir'?: string| undefined | null
				/** Types destination dir. This is where error options and type information will be written */
				'errorTypesDestinationDir'?: string| undefined | null
				/** Error builder destination directory. Where I'll save your new builder file? */
				'errorBuilderDestinationDir': string
				/** Readable name. The name people will read */
				'nameReadable': string
				/** Pascal case name. PascalCase of the name */
				'namePascal'?: string| undefined | null
				/** Camel case name. camelCase version of the name */
				'nameCamel': string
				/** Description. Describe a bit more here */
				'description'?: string| undefined | null
		}

		interface CreateErrorOptionsSchema extends SpruceSchema.Schema {
			id: 'createErrorOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Create error action',
			description: 'Create a builder for your brand new error! ',
			    fields: {
			            /** Field types directory. Where field types and interfaces will be generated. */
			            'fieldTypesDestinationDir': {
			                label: 'Field types directory',
			                type: 'text',
			                isPrivate: true,
			                hint: 'Where field types and interfaces will be generated.',
			                defaultValue: "#spruce/schemas",
			                options: undefined
			            },
			            /** Addons lookup directory. Where I'll look for new schema fields to be registered. */
			            'addonsLookupDir': {
			                label: 'Addons lookup directory',
			                type: 'text',
			                hint: 'Where I\'ll look for new schema fields to be registered.',
			                defaultValue: "src/addons",
			                options: undefined
			            },
			            /** Generate field types. Should I generate field types too? */
			            'generateFieldTypes': {
			                label: 'Generate field types',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should I generate field types too?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Schema types destination directory. Where I will generate schema types and interfaces. */
			            'schemaTypesDestinationDirOrFile': {
			                label: 'Schema types destination directory',
			                type: 'text',
			                hint: 'Where I will generate schema types and interfaces.',
			                defaultValue: "#spruce/schemas",
			                options: undefined
			            },
			            /** . Where I should look for your schema builders? */
			            'schemaLookupDir': {
			                type: 'text',
			                hint: 'Where I should look for your schema builders?',
			                defaultValue: "src/schemas",
			                options: undefined
			            },
			            /** Module import. When other skills use your schemas, will they import them from a module? */
			            'moduleToImportFromWhenRemote': {
			                label: 'Module import',
			                type: 'text',
			                hint: 'When other skills use your schemas, will they import them from a module?',
			                options: undefined
			            },
			            /** Auto install missing dependencies. */
			            'shouldInstallMissingDependencies': {
			                label: 'Auto install missing dependencies',
			                type: 'boolean',
			                options: undefined
			            },
			            /** Enable versioning. Should we use versioning? */
			            'shouldEnableVersioning': {
			                label: 'Enable versioning',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should we use versioning?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Global namespace. The name you'll use when accessing these schemas, e.g. SpruceSchemas */
			            'globalSchemaNamespace': {
			                label: 'Global namespace',
			                type: 'text',
			                isPrivate: true,
			                hint: 'The name you\'ll use when accessing these schemas, e.g. SpruceSchemas',
			                defaultValue: "SpruceSchemas",
			                options: undefined
			            },
			            /** Fetch remote schemas. I will pull in schemas from other features. */
			            'shouldFetchRemoteSchemas': {
			                label: 'Fetch remote schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'I will pull in schemas from other features.',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Fetch local schemas. I will look in schemaLookupDir to load local schemas. */
			            'shouldFetchLocalSchemas': {
			                label: 'Fetch local schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'I will look in schemaLookupDir to load local schemas.',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Fetch core schemas. Should I pull in core schemas too? */
			            'shouldFetchCoreSchemas': {
			                label: 'Fetch core schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should I pull in core schemas too?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Generate core schemas. Used only for updating the @sprucelabs/spruce-core-schemas. Ensures core schemas are generated like local schemas. Also an alias for `--shouldFetchRemoteSchemas=false --shouldFetchCoreSchemas=false --generateStandaloneTypesFile. */
			            'shouldGenerateCoreSchemaTypes': {
			                label: 'Generate core schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Used only for updating the @sprucelabs/spruce-core-schemas. Ensures core schemas are generated like local schemas. Also an alias for `--shouldFetchRemoteSchemas=false --shouldFetchCoreSchemas=false --generateStandaloneTypesFile.',
			                options: undefined
			            },
			            /** Register built schemas. Should the schemas use the SchemaRegistry for tracking? */
			            'registerBuiltSchemas': {
			                label: 'Register built schemas',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'Should the schemas use the SchemaRegistry for tracking?',
			                defaultValue: true,
			                options: undefined
			            },
			            /** Generate standalone types file. By default, I'll generate a types file that augments core types from @sprucelabs/spruce-core-schemas. Setting this to true will generate a stand alone types file. */
			            'generateStandaloneTypesFile': {
			                label: 'Generate standalone types file',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'By default, I\'ll generate a types file that augments core types from @sprucelabs/spruce-core-schemas. Setting this to true will generate a stand alone types file.',
			                defaultValue: false,
			                options: undefined
			            },
			            /**  message. */
			            'syncingMessage': {
			                label: ' message',
			                type: 'text',
			                isPrivate: true,
			                defaultValue: "Syncing schemas...",
			                options: undefined
			            },
			            /** Error class destination. Where I'll save your new Error class file? */
			            'errorClassDestinationDir': {
			                label: 'Error class destination',
			                type: 'text',
			                isPrivate: true,
			                isRequired: true,
			                hint: 'Where I\'ll save your new Error class file?',
			                defaultValue: "src/errors",
			                options: undefined
			            },
			            /** . Where I should look for your error builders? */
			            'errorLookupDir': {
			                type: 'text',
			                hint: 'Where I should look for your error builders?',
			                defaultValue: "src/errors",
			                options: undefined
			            },
			            /** Types destination dir. This is where error options and type information will be written */
			            'errorTypesDestinationDir': {
			                label: 'Types destination dir',
			                type: 'text',
			                hint: 'This is where error options and type information will be written',
			                defaultValue: "#spruce/errors",
			                options: undefined
			            },
			            /** Error builder destination directory. Where I'll save your new builder file? */
			            'errorBuilderDestinationDir': {
			                label: 'Error builder destination directory',
			                type: 'text',
			                isPrivate: true,
			                isRequired: true,
			                hint: 'Where I\'ll save your new builder file?',
			                defaultValue: "./src/errors",
			                options: undefined
			            },
			            /** Readable name. The name people will read */
			            'nameReadable': {
			                label: 'Readable name',
			                type: 'text',
			                isRequired: true,
			                hint: 'The name people will read',
			                options: undefined
			            },
			            /** Pascal case name. PascalCase of the name */
			            'namePascal': {
			                label: 'Pascal case name',
			                type: 'text',
			                hint: 'PascalCase of the name',
			                options: undefined
			            },
			            /** Camel case name. camelCase version of the name */
			            'nameCamel': {
			                label: 'Camel case name',
			                type: 'text',
			                isRequired: true,
			                hint: 'camelCase version of the name',
			                options: undefined
			            },
			            /** Description. Describe a bit more here */
			            'description': {
			                label: 'Description',
			                type: 'text',
			                hint: 'Describe a bit more here',
			                options: undefined
			            },
			    }
		}

		type CreateErrorOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.CreateErrorOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** Define a topic you want to discuss. */
		interface CreateConversationTopicOptions {
			
				/** Topic. What should we talk about or try and get done, e.g. Book an appointment or tell a knock knock joke. */
				'nameReadable': string
				/** Camel case name. camelCase version of the name */
				'nameCamel': string
		}

		interface CreateConversationTopicOptionsSchema extends SpruceSchema.Schema {
			id: 'createConversationTopicOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Create conversation options',
			description: 'Define a topic you want to discuss.',
			    fields: {
			            /** Topic. What should we talk about or try and get done, e.g. Book an appointment or tell a knock knock joke. */
			            'nameReadable': {
			                label: 'Topic',
			                type: 'text',
			                isRequired: true,
			                hint: 'What should we talk about or try and get done, e.g. Book an appointment or tell a knock knock joke.',
			                options: undefined
			            },
			            /** Camel case name. camelCase version of the name */
			            'nameCamel': {
			                label: 'Camel case name',
			                type: 'text',
			                isRequired: true,
			                hint: 'camelCase version of the name',
			                options: undefined
			            },
			    }
		}

		type CreateConversationTopicOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.CreateConversationTopicOptionsSchema>

	}


	namespace SpruceSchemas.SpruceCli.v2020_07_22 {

		/** The options for skill.boot. */
		interface BootSkillOptions {
			
				/** Run local. Will run using ts-node and typescript directly. Longer boot times */
				'local'?: boolean| undefined | null
				
				'onData'?: ((msg: string) => void)| undefined | null
				
				'onError'?: ((msg: string) => void)| undefined | null
				/** Wait until skill is booted. For testing. Returns immediately after executing test so the running tests can be managed programatically. */
				'shouldReturnImmediately'?: boolean| undefined | null
		}

		interface BootSkillOptionsSchema extends SpruceSchema.Schema {
			id: 'bootSkillOptions',
			version: 'v2020_07_22',
			namespace: 'SpruceCli',
			name: 'Boot skill action',
			description: 'The options for skill.boot.',
			    fields: {
			            /** Run local. Will run using ts-node and typescript directly. Longer boot times */
			            'local': {
			                label: 'Run local',
			                type: 'boolean',
			                hint: 'Will run using ts-node and typescript directly. Longer boot times',
			                options: undefined
			            },
			            /** . */
			            'onData': {
			                type: 'raw',
			                options: {valueType: `(msg: string) => void`,}
			            },
			            /** . */
			            'onError': {
			                type: 'raw',
			                options: {valueType: `(msg: string) => void`,}
			            },
			            /** Wait until skill is booted. For testing. Returns immediately after executing test so the running tests can be managed programatically. */
			            'shouldReturnImmediately': {
			                label: 'Wait until skill is booted',
			                type: 'boolean',
			                isPrivate: true,
			                hint: 'For testing. Returns immediately after executing test so the running tests can be managed programatically.',
			                defaultValue: false,
			                options: undefined
			            },
			    }
		}

		type BootSkillOptionsEntity = SchemaEntity<SpruceSchemas.SpruceCli.v2020_07_22.BootSkillOptionsSchema>

	}

}
