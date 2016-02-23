/**
 * Generate key
 * @returns {number}
 */
export function genKey() {
	return Math.floor(Math.random() * 1000);
}

/**
 * Find element in array by predicate
 * @param {Array} arr
 * @param {Function} pred
 * @returns {boolean}
 */
export function findWith(arr, pred) {
	const length = arr.length;
	for (let i = 0; i < length; i++) {
		if (pred(arr[i])) {
			return true;
		}
	}
	return false;
}