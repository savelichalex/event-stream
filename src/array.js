'use strict';

/**
 * Wrappers around native methods
 * that provide true functional style
 * to work with native arrays
 */


/**
 * Push value to array
 * @param {Array} arr
 * @param {*} val
 * @returns {Array}
 */
export function arrayPush(arr, val) {
	return arr.push(val) && arr;
}

/**
 * Map array by function
 * @param {Array} arr
 * @param {Function} f
 * @returns {Array}
 */
export function arrayMap(arr, f) {
	return arr.map(f);
}

/**
 * Filter array by predicate
 * @param {Array} arr
 * @param {Function} f
 * @returns {Array}
 */
export function arrayFilter(arr, f) {
	return arr.filter(f);
}

/**
 * Accumulate values in array by function
 * @param {Array} arr
 * @param {Function} f
 * @param {*} i - initial value
 * @returns {*}
 */
export function arrayReduce(arr, f, i) {
	return arr.reduce(f, i);
}

/**
 * Accumulate previous and current value in new array
 * @param {Array} arr
 * @param {Function} f
 * @returns {Array}
 */
export function arrayFold(arr, f) {
	return arr.reduce(
		(prev, val, index) => {
			if (index === 0) {
				prev.result.push(val);
				prev.acc = val;
				return prev;
			} else {
				prev.acc = f(prev.acc, val);
				prev.result.push(prev.acc);
				return prev;
			}
		},
		{
			result: [],
			acc: void 0
		}).result;
}

/**
 * Merge two arrays into ino (concatenate)
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {Array}
 */
export function arrayMerge(arr1, arr2) {
	const arr = [];
	arr1.forEach(v => arr.push(v));
	arr2.forEach(v => arr.push(v));
	return arr;
}

/**
 * Convert two arrays into one,
 * In new array each value is array with two values
 * from first and second array
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {*}
 */
export function arrayZip(arr1, arr2) {
	const firstLen = arr1.length;
	const secondLen = arr2.length;
	const maxLen = firstLen > secondLen ? firstLen : secondLen;
	return arr1.reduce((prev, val, index) => {
		if (index < maxLen) {
			prev.push([val, arr2[index]]);
			return prev;
		} else {
			return prev;
		}
	}, []);
}