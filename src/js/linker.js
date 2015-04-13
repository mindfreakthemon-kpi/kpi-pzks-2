define(['jquery', 'canvasi', 'toggles/mode', 'toggles/type', 'underscore'], function ($, canvasi, mode, type, _) {
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

		canvasi.graph.addCell(_link);
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

	function handlerUp(cellView, e, x, y) {
		if (!_link || !(cellView.model instanceof ns.Entity)) {
			return;
		}

		var targetView = canvasi.paper.findViewsFromPoint({
			x: x,
			y: y
		}).pop();

		if (targetView && targetView !== cellView) {
			// check if there is at least one link
			var links = canvasi.graph.getConnectedLinks(cellView.model),
				connectedIn = _.filter(links, function (link) {
					return link.prop('target').id === targetView.model.id;
				}).length,
				connectedOut = _.filter(links, function (link) {
					return link.prop('source').id === targetView.model.id;
				}).length,
				connected = connectedIn + connectedOut;

			if (type.mode === 'system' && connectedIn > 0 ||
				type.mode === 'task' && connected > 0) {
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
		}
	}

	function handlerDown(cellView, e, x, y) {
		if (!(cellView.model instanceof ns.Entity)) {
			return;
		}

		createLink(cellView.model, x, y);
	}

	canvasi.graph.on('batch:stop', function () {
		var links = canvasi.graph.getLinks();

		_.each(links, function (link) {
			var source = link.get('source'),
				target = link.get('target');

			if (!source.id || !target.id || target.id === source.id) {
				link.remove();
			}
		});
	});

	mode.change.add(function () {
		var editMode = mode.mode === 'link';

		canvasi.paper.off('cell:pointerdown', handlerDown);
		canvasi.paper.off('cell:pointermove', handlerMove);
		canvasi.paper.off('cell:pointerup', handlerUp);

		if (editMode) {
			canvasi.paper.on('cell:pointerdown', handlerDown);
			canvasi.paper.on('cell:pointermove', handlerMove);
			canvasi.paper.on('cell:pointerup', handlerUp);
		}
	});
});