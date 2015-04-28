define(['jquery', 'canvasi', 'toggles/mode', 'underscore'], function ($, canvasi, mode, _) {
	var ns = joint.shapes.ns,
		_link;

	function createLink(source, x, y) {
		_link = new ns.Link({
			source: {
				id: source.id
			},
			target: {
				x: x,
				y: y
			},
			attrs: {
				'.marker-target': {
					d: 'M 10 0 L 0 5 L 10 10 z'
				}
			}
		});

		return _link;
	}

	function handlerMove(cellView, e, x, y) {
		if (!_link) {
			return;
		}

		_link.set('target', {
			x: x,
			y: y
		});
	}

	function handlerUp(paper, graph, cellView, e, x, y) {
		if (!_link || !(cellView.model instanceof ns.Entity)) {
			return;
		}

		var targetView = paper.findViewsFromPoint({
			x: x,
			y: y
		}).pop();

		if (targetView && targetView !== cellView) {
			// check if there is at least one link
			var links = graph.getConnectedLinks(cellView.model),
				connectedIn = _.filter(links, function (link) {
					return link.prop('target').id === targetView.model.id;
				}).length,
				connectedOut = _.filter(links, function (link) {
					return link.prop('source').id === targetView.model.id;
				}).length,
				connected = connectedIn + connectedOut;

			if (connected > 0) {
				return;
			}

			_link.set('target', {
				id: targetView.model.id
			});

			_link.label(0, {
				position: .5,
				attrs: {
					rect: { fill: 'white' },
					text: { fill: 'blue', text: '1' }
				}
			});

			_link = null;
		}
	}

	function handlerUpSystem() {
		return handlerUp.apply(this, [canvasi.systemPaper, canvasi.systemGraph].concat(Array.prototype.slice.apply(arguments)));
	}

	function handlerUpTask() {
		return handlerUp.apply(this, [canvasi.taskPaper, canvasi.taskGraph].concat(Array.prototype.slice.apply(arguments)));
	}


	function handlerDown(paper, graph, cellView, e, x, y) {
		if (!(cellView.model instanceof ns.Entity)) {
			return;
		}

		var link = createLink(cellView.model, x, y);

		graph.addCell(link);
	}


	function handlerDownSystem() {
		return handlerDown.apply(this, [canvasi.systemPaper, canvasi.systemGraph].concat(Array.prototype.slice.apply(arguments)));
	}

	function handlerDownTask() {
		return handlerDown.apply(this, [canvasi.taskPaper, canvasi.taskGraph].concat(Array.prototype.slice.apply(arguments)));
	}

	function stop(graph) {
		var links = graph.getLinks();

		_.each(links, function (link) {
			var source = link.get('source'),
				target = link.get('target');

			if (!source.id || !target.id || target.id === source.id) {
				link.remove();
			}
		});
	}

	canvasi.taskGraph.on('batch:stop', stop.bind(this, canvasi.taskGraph));
	canvasi.systemGraph.on('batch:stop', stop.bind(this, canvasi.systemGraph));

	mode.change.add(function () {
		var editMode = mode.mode === 'link';

		canvasi.taskPaper.off('cell:pointerdown', handlerDownTask);
		canvasi.taskPaper.off('cell:pointermove', handlerMove);
		canvasi.taskPaper.off('cell:pointerup', handlerUpTask);

		canvasi.systemPaper.off('cell:pointerdown', handlerDownSystem);
		canvasi.systemPaper.off('cell:pointermove', handlerMove);
		canvasi.systemPaper.off('cell:pointerup', handlerUpSystem);

		if (editMode) {
			canvasi.taskPaper.on('cell:pointerdown', handlerDownTask);
			canvasi.taskPaper.on('cell:pointermove', handlerMove);
			canvasi.taskPaper.on('cell:pointerup', handlerUpTask);

			canvasi.systemPaper.on('cell:pointerdown', handlerDownSystem);
			canvasi.systemPaper.on('cell:pointermove', handlerMove);
			canvasi.systemPaper.on('cell:pointerup', handlerUpSystem);
		}
	});
});