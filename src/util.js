export function byType(patterns) {
	const patternsByLength = patterns.reduce(
		(prev, val, index) => {
			if (index % 2 === 0) {
				const len = val.length;
				if (!prev[len]) {
					prev[len] = [];
				}
				prev[len].push({
					types: val,
					handler: patterns[index + 1]
				});
			}
			return prev;
		},
		{}
	);
	return function () {
		const argsLength = arguments.length;
		const args = new Array(argsLength);
		for (let i = 0; i < argsLength; i++) {
			args[i] = arguments[i];
		}
		const argsTypes = args.map(o => {
			const type = ({}).toString.call(o);
			if (type === '[object Object]') {
				const tryType = o.toString();
				return tryType ? tryType : type;
			} else {
				return type;
			}
		});
		const types = patternsByLength[argsLength];
		const typesLength = types.length;
		if (!types) {
			throw new Error('Unknown arguments');
		}

		for (let i = 0; i < typesLength; i++) {
			const t = types[i].types;
			let match = true;
			for (let i = 0; i < argsLength; i++) {
				if (t[i] !== '*' && t[i] !== argsTypes[i]) {
					match = false;
				}
			}
			if (match) {
				return types[i].handler.apply(null, args);
			}
		}
		throw new Error('Unknown arguments');
	}
}

export function genKey() {
	return Math.floor(Math.random() * 1000);
}

export function findWith(arr, pred) {
	const length = arr.length;
	for (let i = 0; i < length; i++) {
		if (pred(arr[i])) {
			return true;
		}
	}
	return false;
}