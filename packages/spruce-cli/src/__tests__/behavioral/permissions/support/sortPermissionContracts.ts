export function sortPermissionContracts(a: { id: string }, b: { id: string }) {
	return a.id > b.id ? 1 : -1
}
