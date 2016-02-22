'use strict';

class Observer {
    constructor() {
        this._subscribers = [];
    }

    subscribe(onNext, onError) {
        this._subscribers.push({
            next: onNext,
            error: onError
        });
    }

    push(val) {
        if(val instanceof Error) {
            return this.throwError(val);
        } else {
            this._subscribers.forEach((obj) => {
                if(obj.next) {
                    setTimeout(obj.next.call(null, val), 0);
                }
            });
        }
    }

    throwError(err) {
        this._subscribers.forEach((obj) => {
            if(obj.error) {
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

    map(f) {
        const newStream = new EventStream();

        this._observer.subscribe(
            val => newStream.push(f(val)),
            err => newStream.throwError(err)
        );

        return newStream;
    }

    filter(pred) {
        const newStream = new EventStream();

        this._observer.subscribe(
            val => pred(val) ? newStream.push(val) : void 0,
            err => newStream.throwError(err)
        );

        return newStream;
    }

    fold(f, initial) {
        this._prev = initial;

        const newStream = new EventStream();

        this._observer.subscribe(
            val => {
                if(!this._prev) {
	                this._prev = val;
                } else {
	                this._prev = f(this._prev, val);
                }
                newStream.push(this._prev);
            },
            err => newStream.throwError(err)
        );

        return newStream;
    }

    flatmap(f) {
        //TODO
    }

    merge(es) {
        const newStream = new EventStream();

        this.subscribe(
            val => newStream.push(val),
            err => newStream.throwError(err)
        );
        es.subscribe(
            val => newStream.push(val),
            err => newStream.throwError(err)
        );

        return newStream;
    }

    zip(es) {
        const newStream = new EventStream();
        const leftBuffer = [];
        const rightBuffer = [];



        this.subscribe(
            val => {
                if(rightBuffer.length) {
                    newStream.push([val, rightBuffer.shift()]);
                } else {
                    leftBuffer.push(val);
                }
            },
            err => newStream.throwError(err)
        );
        es.subscribe(
            val => {
                if(leftBuffer.length) {
                    newStream.push([leftBuffer.shift(), val]);
                } else {
                    rightBuffer.push(val);
                }
            },
            err => newStream.throwError(err)
        );

        return newStream;
    }

    subscribe(onNext, onError) {
        this._observer.subscribe(onNext, onError);
    }
}