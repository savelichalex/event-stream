import { expect } from 'chai';
import { EventStream } from '../src/core';

describe('EventStream', () => {
    it('should map', done => {
        const es = new EventStream();

        es.map(val => val * 2)
            .subscribe(val => {
	            expect(val).to.equal(4);
	            done();
            });

	    es.push(2);
    });

	it('should filter', done => {
		const es = new EventStream();

		es.filter(val => val % 2 === 0)
			.filter(val => val === 2)
			.subscribe(val => {
				expect(val).to.equal(2);
				done();
			});

		es.push(1);
		es.push(2);
	});

	it('should fold', done => {
		const es = new EventStream();

		es.fold((prev, val) => prev + val)
			.filter(val => val === 6)
			.subscribe(val => {
				expect(val).to.equal(6);
				done();
			});

		es.push(1);
		es.push(2);
		es.push(3);
	});

	it('should merge', done => {
		const es1 = new EventStream();
		const es2 = new EventStream();

		let count = 0;
		es1.merge(es2)
			.subscribe(() => {
				count++;
				if(count === 2) {
					done();
				}
			});

		es1.push(1);
		es2.push(1);
	});

	it('should zip', done => {
		const es1 = new EventStream();
		const es2 = new EventStream();

		let count = 0;

		es1.zip(es2)
			.subscribe(val => {
				count++;
				if(count === 2) {
					expect(val).to.have.length(2);
					expect(val[0]).to.equal(2);
					expect(val[1]).to.equal(2);
					done();
				}
			});

		function addTo(es, time) {
			let count = 0;
			return function recur() {
				if(count < 5) {
					es.push(++count);
					setTimeout(recur, time);
				}
			}
		}

		setTimeout(addTo(es1, 50), 50);
		setTimeout(addTo(es2, 100), 100);
	});
});