'use strict';

import { genKey, findWith } from './util';

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

export function esPush(es, val) {
	return es.push(val);
}

export function esThrow(es, err) {
	return es.throwError(err);
}

export function obsSubscribe(obs, onNext, onError) {
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

export function esSubscribe(es, onNext, onError) {
	return obsSubscribe(es._observer, onNext, onError);
}

export function esMap(es, f) {
	const newStream = new EventStream();

	esSubscribe(
		es,
		val => esPush(newStream, f(val)),
		err => esThrow(newStream, err)
	);

	return newStream;
}

export function esFilter(es, pred) {
	const newStream = new EventStream();

	esSubscribe(
		es,
		val => pred(val) ? esPush(newStream, val) : void 0,
		err => esThrow(newStream, err)
	);

	return newStream;
}

export function esFold(es, f, initial) {
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

export function esMerge(es1, es2) {
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

export function esZip(es1, es2) {
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