define(['jquery', 'joint', 'mode', 'type', 'storage', 'shapes'], function ($, joint, mode, type, storage) {
	var exports,
		saveTimeout,
		graph = new joint.dia.Graph(),
		$el = $('#paper'),
		paper = new joint.dia.Paper({
			el: $el,
			width: '100%',
			height: 600,
			gridSize: 1,
			model: graph,

			interactive: function (cellView, eventName) {
				if (cellView.model.isLink()) {
					return mode.mode === 'link';
				}

				return mode.mode === 'edit';
			}
		});

	exports = {
		$el: $el,
		graph: graph,
		paper: paper
	};

	mode.change.add(function (newVal, oldVal) {
		exports.$el
			.removeClass('mode-' + oldVal)
			.addClass('mode-' + newVal);
	});

	type.change.add(function (newVal, oldVal) {
		exports.$el
			.removeClass('type-' + oldVal)
			.addClass('type-' + newVal);

		graph.clear();

		var data = storage.load(newVal);

		if (data) {
			graph.fromJSON(data);
		}
	});

	// saving after 0.1 sec of inactivity
	graph.on('change add remove', function () {
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(function () {
			var json = graph.toJSON();

			storage.save(json, type.mode)
		}, 100);
	});

	paper.on('cell:pointerdown', function (cellView) {
		cellView.model.toFront();
	});

	var saved = storage.load(type.mode);

	if (saved) {
		graph.fromJSON(saved);
	}

	return exports;
});