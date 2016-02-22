'use strict';

/**
 * Dalay expressions evaluation
 * @param {Function} expressionAsFunc
 * @returns {Function} thunk
 */
function delay(expressionAsFunc) {
	let result;
	let isEvaluated = false;

	return () => {
		if (!isEvaluated) {
			result = expressionAsFunc();
		}
		return result;
	}
}

/**
 * Force thunk to evaluate
 * @param thunk {Function}
 * @returns {*} evaluated expression
 */
function force(thunk) {
	return thunk();
}

/**
 * Create cons
 * @param car {*}
 * @param cdr {Function}
 * @returns {*[]}
 */
function cons(car, cdr) {
	return {
		car,
		cdr,
		toString() {
			return '[Sequence]';
		}
	};
}

/**
 * Create a sequence cons pair
 * @param x {*} cons car
 * @param y {*} cons cdr
 */
function seqCons(x, y) {
	return cons(x, delay(y));
}

/**
 * Return car of sequence
 * @param seq {Sequence}
 */
export function seqCar(seq) {
	return seq.car;
}

/**
 * Return cdr of sequence
 * @param seq {Sequence}
 */
function seqCdr(seq) {
	return force(seq.cdr);
}

/**
 * Empty seq
 */
const theEmptySeq = [];

/**
 * Function to check that seq is empty
 * @param seq {Sequence}
 * @return {boolean}
 */
function seqNull(seq) {
	return seq.length === 0;
}

/**
 * Ref function
 * @param seq {Sequence}
 * @param n {number}
 */
function seqRef(seq, n) {
	if (n === 0) {
		return seqCar(seq);
	} else {
		return seqRef(seqCdr(seq), n - 1);
	}
}

/**
 * Return result of apply proc to each item in sequence s
 * @param s {Sequence}
 * @param proc {Function}
 */
export function seqMap(s, proc) {
	if (seqNull(s)) {
		return theEmptySeq;
	} else {
		return seqCons(proc(seqCar(s)), () => seqMap(proc, seqCdr(s)));
	}
}

/**
 * Apply procedure to each item in sequence s
 * @param procedure {Function}
 * @param s {Sequence}
 */
export function seqForEach(procedure, s) {
	if (seqNull(s)) {
		return;
	} else {
		procedure(seqCar(s));
		return seqForEach(procedure, seqCdr(s));
	}
}

/**
 * Folter sequence by predicate
 * @param predicate {Function}
 * @param seq {Sequence}
 * @returns {*}
 */
export function seqFilter(seq, predicate) {
	if (seqNull(seq)) {
		return theEmptySeq;
	} else {
		const car = seqCar(seq);
		if (predicate(car)) {
			return seqCons(car, () => seqFilter(seqCdr(seq)), predicate);
		} else {
			return seqFilter(seqCdr(seq), predicate);
		}
	}
}

export function seqReduce(seq, proc, initial) {
	if(seqNull(seq)) {
		return initial;
	} else {
		return seqReduce(seqCdr(seq), proc, proc(initial));
	}
}

/**
 * Take n values from sequence
 * @param {Sequence} seq
 * @param {number} n
 */
export function seqTake(seq, n) {
	if (n === 1) {
		return seqCons(seqCar(seq), () => theEmptySeq);
	} else {
		return seqCons(seqCar(seq), () => seqTake(seqCdr(seq), n - 1));
	}
}

/**
 * Create sequence in range between low and high
 * @param {number} low
 * @param {number} high
 * @returns {*}
 */
export function range(low, high) {
	if (low > high) {
		return theEmptySeq;
	} else {
		return seqCons(low, () => range(low + 1, high));
	}
}