define(['underscore', 'joint', 'canvasi', 'functions/adder'], function (_, joint, canvasi, adder) {
	var ns = joint.shapes.ns;

	function generateGraph(minWeight, maxWeight, numVertices, correlation, minLinkWeight) {
		var i, j,
			q = 1000,
			EW,
			EL = 0,
			target,
			source,
			array = [],
			links = [],
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
				//if (map[target][source] === maxLinkWeight) {
				//	continue;
				//}

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

		var EJ = (EW - correlation * EW) / correlation,
			O = EJ - EL;

		canvasi.taskGraph.clear();

		var P = 4;

		array.forEach(function (weight, index) {
			var x = index % P + 1,
				y = Math.floor(index / P);

			cellMap[index] = adder.add(canvasi.taskGraph, ns.Entity, x * 200, 100 + y * 150);

			cellMap[index].setDescr(Math.round(weight));
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

						links.push(link);

						canvasi.taskGraph.addCell(link);
					}
				}
			});

		if (links.length && O < 0) {
			links[links.length - 1].setLabel(
				Math.min(links[links.length - 1].getLabel() | 0, Math.round(EJ)));
		}
	}

	return {
		generateGraph: generateGraph
	}
});