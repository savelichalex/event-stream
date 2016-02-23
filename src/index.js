'use strict';

import {
	eventStream,
	esPush,
	esSubscribe,
	esMap,
	esFilter,
	esFold,
	esMerge,
	esZip
} from './eventStream';

import {
	range,
	seqMap,
	seqFilter,
	seqTake
} from './lazySequence';

import {
	arrayPush,
	arrayMap,
	arrayFilter,
	arrayReduce,
	arrayFold,
	arrayMerge,
	arrayZip
} from './array';

export const EventStream = {
	EventStream: eventStream,
	push: esPush,
	subscribe: esSubscribe,
	map: esMap,
	filter: esFilter,
	fold: esFold,
	merge: esMerge,
	zip: esZip
};

export const Sequence = {
	range,
	map: seqMap,
	filter: seqFilter,
	take: seqTake
};

export const Array = {
	push: arrayPush,
	map: arrayMap,
	filter: arrayFilter,
	reduce: arrayReduce,
	fold: arrayFold,
	merge: arrayMerge,
	zip: arrayZip
};