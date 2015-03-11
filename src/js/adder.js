define(['jquery', 'canvasi', 'toggles/mode', 'underscore'], function ($, canvasi, mode, _) {
	var ns = joint.shapes.ns;

	function element(elm, x, y) {
		var index = 1,
			cell = new elm({
			position: {
				x: x,
				y: y
			}
		});

		_.each(canvasi.graph.getElements(), function (element) {
			var _index = element.getTitle() | 0;

			index = Math.max(_index + 1, index);
		});

		cell.setTitle(index);

		canvasi.graph.addCell(cell);

		return cell;
	}

	function handler(e, x, y) {
		var el;

		switch (mode.mode) {
			case 'element':
				el = element(ns.Entity, x, y);
				break;
		}
	}

	mode.change.add(function () {
		var editMode = mode.mode === 'element';

		canvasi.paper.off('blank:pointerclick', handler);

		if (editMode) {
			canvasi.paper.on('blank:pointerclick', handler);
		}
	});
});