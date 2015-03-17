define(['jquery', 'joint', 'canvasi', 'toggles/type', 'underscore', 'adder'], function ($, joint, canvasi, type, _, adder) {
	var ns = joint.shapes.ns;

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
		var i, j,
			q = 1000,
			EW,
			EL = 0,
			target,
			source,
			array = [],
			map = {},
			cellMap = {};

		for (i = 0; i < numVertices; i++) {
			array.push(Math.random() * (maxWeight - minWeight) + minWeight);
			map[i] = {};
		}

		EW = array.reduce(function (a, b) {
			return a + b;
		});

		while ((EW / (EW + EL)) > correlation && q--) {
			target = Math.ceil(Math.random() * numVertices) - 1;
			source = Math.ceil(Math.random() * numVertices) - 1;

			if (target >= source) {
				continue;
			}

			if (map[target][source]) {
				if (map[target][source] === maxLinkWeight) {
					continue;
				}

				map[target][source]++;
			} else {
				if (map[source][target]) {
					continue;
				}

				map[target][source] = minLinkWeight;
			}

			EL = 0;

			for (i = 0; i < numVertices; i++) {
				for (j = 0; j < numVertices; j++) {
					EL += map[i][j] || 0;
				}
			}
		}

		canvasi.graph.clear();

		var P = 5;

		array.forEach(function (weight, index) {
			var x = index % P + 1,
				y = Math.floor(index / P);

			cellMap[index] = adder.add(ns.Entity, x * 200, 100 + y * 150);
		});


		Object.keys(cellMap)
			.forEach(function (index) {
				var i, link;

				for (i = 0; i < numVertices; i++) {
					if (i === index) {
						continue;
					}

					if (map[index][i]) {
						link = new ns.Link({
							source: {
								id: cellMap[index].id
							},
							target: {
								id: cellMap[i].id
							},
							attrs: {
								'.marker-target': {
									d: 'M 10 0 L 0 5 L 10 10 z'
								}
							}
						});

						link.label(0, {
							position: .5,
							attrs: {
								rect: { fill: 'white' },
								text: { fill: 'blue', text: map[index][i] }
							}
						});

						canvasi.graph.addCell(link);
					}
				}
			});

	}

	$generate.on('click', function () {
		//var _minWeight = minWeight(),
		//	_maxWeight = maxWeight(),
		//	_numVertices = numVertices(),
		//	_correlation = correlation(),
		//	_minLinkWeight = minLinkWeight(),
		//	_maxLinkWeight = maxLinkWeight();

		generateGraph(1, 2, 25, 0.5, 5, 9999);
		//generateGraph(_minWeight, _maxWeight, _numVertices, _correlation, _minLinkWeight, _maxLinkWeight);
	});
});