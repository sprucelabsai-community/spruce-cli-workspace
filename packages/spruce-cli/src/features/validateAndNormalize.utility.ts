import {
	defaultSchemaValues,
	normalizeSchemaValues,
	Schema,
	SchemaPartialValues,
	SchemaValuesWithDefaults,
	validateSchemaValues,
} from '@sprucelabs/schema'

type StripNulls<T extends Record<string, any>> = {
	[K in keyof T]: Exclude<T[K], null>
}

const validateAndNormalizer = {
	validateAndNormalize<S extends Schema = Schema>(
		schema: S,
		options: SchemaPartialValues<S, false>
	) {
		const values = {
			...defaultSchemaValues(schema),
			...this.stripUndefined(options),
		} as SchemaPartialValues<S, false>

		validateSchemaValues(schema, values, {})

		const normalized = normalizeSchemaValues(schema, values)

		return this.stripUndefined(normalized) as StripNulls<
			SchemaValuesWithDefaults<S>
		>
	},

	stripUndefined(normalized: Record<string, any>) {
		const noUndefined = {}

		Object.keys(normalized).forEach((key: string) => {
			// @ts-ignore
			if (normalized[key] !== undefined) {
				//@ts-ignore
				noUndefined[key] = normalized[key]
			}
		})
		return noUndefined
	},
}

export default validateAndNormalizer
