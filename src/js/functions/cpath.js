define(['cpath'], function (cpath) {
	return function (matrix, source, target) {
		if (source === target) {
			return [source];
		}

		return isFinite(matrix[source][target]) ? [source, target] : cpath(matrix, source)[target].path;
	};
});