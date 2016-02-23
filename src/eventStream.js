'use strict';

import { genKey, findWith } from './util';

/**
 * Observer is notify all subscribers when something is push to it
 */
class Observer {
	constructor() {
		this._subscribers = [];
	}

	/**
	 * Get value and push it to subscribers
	 * @param {*} val
	 * @returns {true}
	 * @throw {Error}
	 */
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

	/**
	 * Call error handler for all subscribers
	 * @param {Error} err
	 */
	throwError(err) {
		this._subscribers.forEach((obj) => {
			if (obj.error) {
				obj.error.call(null, err);
			}
		});
	}
}

/**
 * Present events stream by observer
 */
class EventStream {
	constructor(observer) {
		observer = observer || new Observer();
		this._observer = observer;
		this._prev = void 0;
	}

	/**
	 * Push value to observer
	 * @param {*} val
	 */
	push(val) {
		return this._observer.push(val);
	}

	/**
	 * Push error to observer
	 * @param {Error} err
	 */
	throwError(err) {
		this._observer.throwError(err);
	}

	/**
	 * @override
	 * @returns {string}
	 */
	toString() {
		return '[EventStream]';
	}
}

/**
 * Create new event stream from or existing observer or create new
 * @param {Observer} obs
 * @returns {EventStream}
 */
export function eventStream(obs) {
	return new EventStream(obs);
}

/**
 * Push value to event stream
 * @param {EventStream} es
 * @param {*} val
 * @returns {true}
 */
export function esPush(es, val) {
	return es.push(val);
}

/**
 * Throw error in event stream
 * @param {EventStream} es
 * @param {Error} err
 * @returns {*|void}
 */
export function esThrow(es, err) {
	return es.throwError(err);
}

/**
 * Subscribe to observer pushed values
 * @param {Observer} obs
 * @param {Function} onNext - success handler
 * @param {Function} onError - error handler
 * @returns {number} unique key of subscriber for this stream
 */
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

/**
 * Subscribe to event stream pushed values
 * You can get values from event stream only when you subscribe to it
 * @param {EventStream} es
 * @param {Function} onNext - success handler
 * @param {Function} onError - error handler
 * @returns {number}
 */
export function esSubscribe(es, onNext, onError) {
	return obsSubscribe(es._observer, onNext, onError);
}

/**
 * Change pushed values in event stream
 * For example see marble diagram:
 *
 * -----1-------2------3---------
 *      |       |      |
 *      |  x => x * 2  |
 *      v       v      v
 * -----2-------4------6---------
 *
 * @param {EventStream} es
 * @param {Function} f
 * @returns {EventStream}
 */
export function esMap(es, f) {
	const newStream = new EventStream();

	esSubscribe(
		es,
		val => esPush(newStream, f(val)),
		err => esThrow(newStream, err)
	);

	return newStream;
}

/**
 * Filter pushed values to event stream by predicate
 *
 * -----1-------2-------3---------
 *      |       |       |
 *       x => x % 2 === 0
 *      v       v       v
 * -------------2-----------------
 *
 * @param {EventStream} es
 * @param {Function} pred
 * @returns {EventStream}
 */
export function esFilter(es, pred) {
	const newStream = new EventStream();

	esSubscribe(
		es,
		val => pred(val) ? esPush(newStream, val) : void 0,
		err => esThrow(newStream, err)
	);

	return newStream;
}

/**
 * Accumulate previous values in stream and push it
 * to new stream
 *
 * -----1-------2-------3---------
 *      |       |       |
 *     (prev, x) => prev + x
 *      v       v       v
 * -----1-------3-------6---------
 *
 * @param {EventStream} es
 * @param {Function} f
 * @param {*} initial - first value to accumulate result
 * @returns {EventStream}
 */
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

/**
 * Merge value from to stream into one
 *
 * ---1-----2------3------4----5--
 *    |     |      |      |    |
 * -----A-------B-------C---------
 *    | |   |   |  |    | |    |
 *    | |   |   |  |    | |    |
 *    v v   v   v  v    v v    v
 * ---1-A---2---2--3----C-4----5--
 *
 * @param {EventStream} es1
 * @param {EventStream} es2
 * @returns {EventStream}
 */
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

/**
 * Collect values from two streams
 * and push it by array with two values
 *
 * ------1--------2--------3-------
 *
 * ----------A---------B-----------
 *           |         |
 *           |         |
 *           v         v
 * ---------1A--------2B-----------
 *
 * @param es1
 * @param es2
 * @returns {EventStream}
 */
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