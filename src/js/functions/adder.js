define(['jquery', 'canvasi', 'toggles/mode', 'underscore'], function ($, canvasi, mode, _) {
	var ns = joint.shapes.ns;

	function element(graph, elm, x, y) {
		var index = 1,
			cell = new elm({
			position: {
				x: x,
				y: y
			}
		});

		_.each(graph.getElements(), function (element) {
			var _index = element.getTitle() | 0;

			index = Math.max(_index + 1, index);
		});

		cell.setTitle(index);

		graph.addCell(cell);

		return cell;
	}

	function handler(graph, e, x, y) {
		element(graph, ns.Entity, x, y);
	}

	function handlerTask() {
		return handler.apply(this, [canvasi.taskGraph].concat(Array.prototype.slice.apply(arguments)));
	}

	function handlerSystem() {
		return handler.apply(this, [canvasi.systemGraph].concat(Array.prototype.slice.apply(arguments)));

	}

	mode.change.add(function () {
		var editMode = mode.mode === 'element';

		canvasi.taskPaper.off('blank:pointerclick', handlerTask);
		canvasi.systemPaper.off('blank:pointerclick', handlerSystem);

		if (editMode) {
			canvasi.taskPaper.on('blank:pointerclick', handlerTask);
			canvasi.systemPaper.on('blank:pointerclick', handlerSystem);
		}
	});

	return {
		add: element
	};
});