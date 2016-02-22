'use strict';

import { byType } from './util'
import {
	EventStream,
	esPush,
	esSubscribe,
	esMap,
	esFilter,
	esFold,
	esMerge,
	esZip
} from './eventStream';

export function eventStream(obs) {
	return new EventStream(obs);
}

export const push = byType([
	['[EventStream]', '*'], esPush,
	['[object Array]', '*'], (arr, val) => arr.push(val) && arr
]);

export const subscribe = byType([
	['[EventStream]', '[object Function]'], esSubscribe
]);

export const map = byType([
	['[EventStream]', '[object Function]'], esMap,
	['[object Array]', '[object Function]'], (arr, f) => arr.map(f)
]);

export const filter = byType([
	['[EventStream]', '[object Function]'], esFilter,
	['[object Array]', '[object Function]'], (arr, pred) => arr.filter(pred)
]);

export const fold = byType([
	['[EventStream]', '[object Function]'], esFold,
	['[EventStream]', '[object Function]', '*'], esFold,
	['[object Array]', '[object Function]'], (arr, f) => {
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
	},
	['[object Array]', '[object Function]', '*'], (arr, f, i) => {
		return arr.reduce(
			(prev, val) => {
				prev.acc = f(prev.acc, val);
				prev.result.push(prev.acc);
				return prev;
			},
			{
				result: [],
				acc: i
			}).result;
	}
]);

export const merge = byType([
	['[EventStream]', '[EventStream]'], esMerge,
	['[object Array]', '[object Array]'], (arr1, arr2) => {
		const arr = [];
		arr1.forEach(v => arr.push(v));
		arr2.forEach(v => arr.push(v));
		return arr;
	}
]);

export const zip = byType([
	['[EventStream]', '[EventStream]'], esZip,
	['[object Array]', '[object Array]'], (arr1, arr2) => {
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
]);