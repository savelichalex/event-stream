'use strict';

import {
	eventStream,
	esPush,
	esSubscribe,
	esMap,
	esFilter,
	esFold,
	esMerge,
	esZip,
	esFlatMap,
	esThrow
} from './eventStream';

export default {
	EventStream: eventStream,
	push: esPush,
	throwError: esThrow,
	subscribe: esSubscribe,
	map: esMap,
	filter: esFilter,
	fold: esFold,
	merge: esMerge,
	zip: esZip,
	flatMap: esFlatMap
};