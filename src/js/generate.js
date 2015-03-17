define(['jquery', 'joint', 'canvasi', 'toggles/type', 'underscore'], function ($, joint, canvasi, type, _) {
	var $generate = $('#generate');

	function minWeight() {
		return prompt('Min vertex weight:', 1);
	}

	function maxWeight() {
		return prompt('Max vertex weight:', 2);
	}

	function numVertices() {
		return prompt('Number of vertices:', 10);
	}

	function correlation() {
		return prompt('Correlation (0-1):', 0.5);
	}

	function minLinkWeight() {
		return prompt('Min link weight:', 1);
	}

	function maxLinkWeight() {
		return prompt('Max link weight:', 9999);
	}

	function generateGraph(minWeight, maxWeight, numVertices, correlation, minLinkWeight, maxLinkWeight) {
		var i, array = [];

		for (i = 0; i < numVertices; i++) {
			array.push(Math.random() * (maxWeight - minWeight) + minWeight);
		}
	}

	$generate.on('click', function () {
		var _minWeight = minWeight(),
			_maxWeight = maxWeight(),
			_numVertices = numVertices(),
			_correlation = correlation(),
			_minLinkWeight = minLinkWeight(),
			_maxLinkWeight = maxLinkWeight();

		generateGraph(1, 2, 10, 0.5, 1, 9999);
		//generateGraph(_minWeight, _maxWeight, _numVertices, _correlation, _minLinkWeight, _maxLinkWeight);
	});
});