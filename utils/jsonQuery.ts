export const query = (object: any, path: string) => {
	const components = path.split('.')
	let result = object
	let currentPath = ''
	for (let part of components) {
		currentPath += `.${part}`
		if (result[part] === void 0) {
			throw new Error(`INVALID_PATH ${currentPath}`)
			break
		}
		result = result[part]
	}

	return result
}
