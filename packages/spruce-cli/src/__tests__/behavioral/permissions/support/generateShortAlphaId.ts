import { generateId } from '@sprucelabs/test-utils'

export default function generateShortAlphaId() {
    return generateId().replace(/[0-9]/g, '').substring(0, 5)
}
