'use strict';

import { expect } from 'chai';
import {
	EventStream as es,
	Sequence as s,
	Array as a
} from '../src/index';

import { seqCar } from '../src/lazySequence';

describe('EventStream', () => {
    it('should map event stream', done => {
        const es$ = es.EventStream();

	    es.subscribe(
		    es.map(
			    es$,
			    val => val * 2
		    ),
		    val => {
			    expect(val).to.equal(4);
			    done();
		    }
	    );

	    es.push(es$, 2);
    });

	it('should map plain array', () => {
		const arr = a.map([1,2,3], val => val * 2);
		expect(arr).to.deep.equal([2,4,6]);
	});

	it('should map sequence', () => {
		const seq = s.map(s.range(1, 5), val => val * 2);
		expect(seqCar(s.take(seq, 1))).to.equal(2);
	});

	it('should filter event stream', done => {
		const es$ = es.EventStream();

		es.subscribe(
			es.filter(
				es.filter(
					es$,
					val => val % 2 === 0
				),
				val => val === 2
			),
			val => {
				expect(val).to.equal(2);
				done();
			}
		);

		es.push(es$, 1);
		es.push(es$, 2);
	});

	it('should filter plain array', () => {
		const arr = a.filter([1,2,3], val => val % 2 === 0);
		expect(arr).to.deep.equal([2]);
	});

	it('should filter lazy sequence', () => {
		const seq = s.filter(s.range(1, 5), val => val % 2 === 0);
		expect(seqCar(s.take(seq, 1))).to.equal(2);
	});

	it('should fold event stream', done => {
		const es$ = es.EventStream();

		es.subscribe(
			es.filter(
				es.fold(
					es$,
					(prev, val) => prev + val
				),
				val => val === 6
			),
			val => {
				expect(val).to.equal(6);
				done();
			}
		);

		es.push(es$, 1);
		es.push(es$, 2);
		es.push(es$, 3);
	});

	it('should fold plain array', () => {
		const arr = a.fold([1,2,3], (prev, val) => prev + val);
		expect(arr).to.deep.equal([1,3,6]);
	});

	it('should merge event streams', done => {
		const es1 = es.EventStream();
		const es2 = es.EventStream();

		let count = 0;

		es.subscribe(
			es.merge(es1, es2),
			() => {
				count++;
				if(count === 2) {
					done();
				}
			}
		);

		es.push(es1, 1);
		es.push(es2, 1);
	});

	it('should merge plain arrays', () => {
		const arr = a.merge([1,2,3], [4,5,6]);
		expect(arr).to.deep.equal([1,2,3,4,5,6]);
	});

	it('should zip event streams', done => {
		const es1 = es.EventStream();
		const es2 = es.EventStream();

		let count = 0;


		es.subscribe(
			es.zip(es1, es2),
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

		function addTo(eventStream, time) {
			let count = 0;
			return function recur() {
				if(count < 5) {
					es.push(eventStream, ++count);
					setTimeout(recur, time);
				}
			}
		}

		setTimeout(addTo(es1, 50), 50);
		setTimeout(addTo(es2, 100), 100);
	});

	it('should zip plain arrays', () => {
		const arr = a.zip([1,2,3], [4,5,6]);
		expect(arr).to.deep.equal([[1,4], [2,5], [3,6]]);
	});
});