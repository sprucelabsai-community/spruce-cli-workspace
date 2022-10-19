import { MercuryAggregateResponse } from '@sprucelabs/mercury-types'
import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import isEqual from 'lodash/isEqual'
import uniqWith from 'lodash/uniqWith'

const actionUtil = {
	mergeActionResults(...objects: any[]) {
		const isObject = (obj: any) => obj && typeof obj === 'object'
		return objects.reduce((prev, obj) => {
			Object.keys(obj || {}).forEach((key) => {
				const pVal = prev[key]
				const oVal = obj[key]

				if (Array.isArray(pVal) && Array.isArray(oVal)) {
					prev[key] = pVal.concat(...oVal)
					prev[key] = this.makeUnique(prev[key])
				} else if (isObject(pVal) && isObject(oVal)) {
					prev[key] = this.mergeActionResults(pVal, oVal)
				} else if (typeof oVal !== 'undefined') {
					prev[key] = oVal
				}
			})
			return prev
		}, {})
	},

	makeUnique(val: any[]): any[] {
		return uniqWith(val, (a: any, b: any) => {
			return isEqual(a, b) || (a.path && b.path && a.path === b.path)
		})
	},

	assertNoErrorsInResponse(response: MercuryAggregateResponse<any>) {
		if (response.totalContracts > 0) {
			eventResponseUtil.getFirstResponseOrThrow(response)
		}
	},
}

export default actionUtil
