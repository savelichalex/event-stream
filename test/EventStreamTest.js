'use strict';

import { expect } from 'chai';
import es from '../src/index';

describe('EventStream', () => {
    it('should map', done => {
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

	it('should filter', done => {
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

	it('should fold', done => {
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

	it('should merge', done => {
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

	it('should zip', done => {
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
});