'use strict';

class Observer {
	constructor() {
		this._subscribers = [];
	}

	push(val) {
		if (val instanceof Error) {
			return this.throwError(val);
		} else {
			this._subscribers.forEach((obj) => {
				if (obj.next) {
					setTimeout(obj.next.call(null, val), 0);
				}
			});
			return true;
		}
	}

	throwError(err) {
		this._subscribers.forEach((obj) => {
			if (obj.error) {
				obj.error.call(null, err);
			}
		});
	}
}

export class EventStream {
	constructor(observer) {
		observer = observer || new Observer();
		this._observer = observer;
		this._prev = void 0;
	}

	push(val) {
		this._observer.push(val);
	}

	throwError(err) {
		this._observer.throwError(err);
	}

	toString() {
		return '[EventStream]';
	}
}

function esPush(es, val) {
	return es.push(val);
}

function esThrow(es, err) {
	return es.throwError(err);
}

function genKey() {
	return Math.floor(Math.random() * 1000);
}

function findWith(arr, pred) {
	const length = arr.length;
	for (let i = 0; i < length; i++) {
		if (pred(arr[i])) {
			return true;
		}
	}
	return false;
}

function obsSubscribe(obs, onNext, onError) {
	const key = genKey();
	if (findWith(obs._subscribers, o => o.key === key)) {
		return obsSubscribe(obs, onNext, onError);
	} else {
		obs._subscribers.push({
			key: key,
			next: onNext,
			error: onError
		});
		return key;
	}
}

function esSubscribe(es, onNext, onError) {
	return obsSubscribe(es._observer, onNext, onError);
}

function esMap(es, f) {
	const newStream = new EventStream();

	esSubscribe(
		es,
		val => esPush(newStream, f(val)),
		err => esThrow(newStream, err)
	);

	return newStream;
}

function esFilter(es, pred) {
	const newStream = new EventStream();

	esSubscribe(
		es,
		val => pred(val) ? esPush(newStream, val) : void 0,
		err => esThrow(newStream, err)
	);

	return newStream;
}

function esFold(es, f, initial) {
	const newStream = new EventStream();

	es._prev = initial;

	esSubscribe(
		es,
		val => {
			if (!es._prev) {
				es._prev = val;
			} else {
				es._prev = f(es._prev, val);
			}
			esPush(newStream, es._prev);
		},
		err => esThrow(newStream, err)
	);

	return newStream;
}

function esMerge(es1, es2) {
	const newStream = new EventStream();

	esSubscribe(
		es1,
		val => esPush(newStream, val),
		err => esThrow(newStream, err)
	);
	esSubscribe(
		es2,
		val => esPush(newStream, val),
		err => esThrow(newStream, err)
	);

	return newStream;
}

function esZip(es1, es2) {
	const newStream = new EventStream();

	const leftBuffer = [];
	const rightBuffer = [];

	esSubscribe(
		es1,
		val => {
			if (rightBuffer.length) {
				esPush(newStream, [val, rightBuffer.shift()]);
			} else {
				leftBuffer.push(val);
			}
		},
		err => newStream.throwError(err)
	);
	esSubscribe(
		es2,
		val => {
			if (leftBuffer.length) {
				esPush(newStream, [leftBuffer.shift(), val]);
			} else {
				rightBuffer.push(val);
			}
		},
		err => newStream.throwError(err)
	);

	return newStream;
}

function byType(patterns) {
	const patternsByLength = patterns.reduce(
		(prev, val, index) => {
			if (index % 2 === 0) {
				const len = val.length;
				if (!prev[len]) {
					prev[len] = [];
				}
				prev[len].push({
					types: val,
					handler: patterns[index + 1]
				});
			}
			return prev;
		},
		{}
	);
	return function () {
		const argsLength = arguments.length;
		const args = new Array(argsLength);
		for (let i = 0; i < argsLength; i++) {
			args[i] = arguments[i];
		}
		const argsTypes = args.map(o => {
			const type = ({}).toString.call(o);
			if (type === '[object Object]') {
				const tryType = o.toString();
				return tryType ? tryType : type;
			} else {
				return type;
			}
		});
		const types = patternsByLength[argsLength];
		const typesLength = types.length;
		if (!types) {
			throw new Error('Unknown arguments');
		}

		for (let i = 0; i < typesLength; i++) {
			const t = types[i].types;
			let match = true;
			for (let i = 0; i < argsLength; i++) {
				if (t[i] !== '*' && t[i] !== argsTypes[i]) {
					match = false;
				}
			}
			if (match) {
				return types[i].handler.apply(null, args);
			}
		}
	}
}

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