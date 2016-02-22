'use strict';

import { expect } from 'chai';
import {
	eventStream,
	push,
	subscribe,
	map,
	filter,
	fold,
	merge,
	zip } from '../src/core';

describe('EventStream', () => {
    it('should map event stream', done => {
        const es = eventStream();

	    subscribe(
		    map(
			    es,
			    val => val * 2
		    ),
		    val => {
			    expect(val).to.equal(4);
			    done();
		    }
	    );

	    push(es, 2);
    });

	it('should map plain array', () => {
		const arr = map([1,2,3], val => val * 2);
		expect(arr).to.deep.equal([2,4,6]);
	});

	it('should filter event stream', done => {
		const es = eventStream();

		subscribe(
			filter(
				filter(
					es,
					val => val % 2 === 0
				),
				val => val === 2
			),
			val => {
				expect(val).to.equal(2);
				done();
			}
		);

		push(es, 1);
		push(es, 2);
	});

	it('should filter plain array', () => {
		const arr = filter([1,2,3], val => val % 2 === 0);
		expect(arr).to.deep.equal([2]);
	});

	it('should fold event stream', done => {
		const es = eventStream();

		subscribe(
			filter(
				fold(
					es,
					(prev, val) => prev + val
				),
				val => val === 6
			),
			val => {
				expect(val).to.equal(6);
				done();
			}
		);

		push(es, 1);
		push(es, 2);
		push(es, 3);
	});

	it('should fold plain array', () => {
		const arr = fold([1,2,3], (prev, val) => prev + val);
		expect(arr).to.deep.equal([1,3,6]);
	});

	it('should merge event streams', done => {
		const es1 = eventStream();
		const es2 = eventStream();

		let count = 0;

		subscribe(
			merge(es1, es2),
			() => {
				count++;
				if(count === 2) {
					done();
				}
			}
		);

		push(es1, 1);
		push(es2, 1);
	});

	it('should merge plain arrays', () => {
		const arr = merge([1,2,3], [4,5,6]);
		expect(arr).to.deep.equal([1,2,3,4,5,6]);
	});

	it('should zip event streams', done => {
		const es1 = eventStream();
		const es2 = eventStream();

		let count = 0;


		subscribe(
			zip(es1, es2),
			val => {
				count++;
				if(count === 2) {
					expect(val).to.have.length(2);
					expect(val[0]).to.equal(2);
					expect(val[1]).to.equal(2);
					done();
				}
			}
		);

		function addTo(es, time) {
			let count = 0;
			return function recur() {
				if(count < 5) {
					push(es, ++count);
					setTimeout(recur, time);
				}
			}
		}

		setTimeout(addTo(es1, 50), 50);
		setTimeout(addTo(es2, 100), 100);
	});

	it('should zip plain arrays', () => {
		const arr = zip([1,2,3], [4,5,6]);
		expect(arr).to.deep.equal([[1,4], [2,5], [3,6]]);
	});
});