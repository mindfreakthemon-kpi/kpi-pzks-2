define(['jquery', 'joint', 'toggles/mode', 'api/storage', 'shapes'], function ($, joint, mode, storage) {
	function interactive(cellView, eventName) {
		if (cellView.model.isLink()) {
			return mode.mode === 'link';
		}

		return mode.mode === 'edit';
	}

	var taskGraph = new joint.dia.Graph(),
		systemGraph = new joint.dia.Graph(),
		$taskEl = $('#taskPaper'),
		$systemEl = $('#systemPaper'),


		taskPaper = new joint.dia.Paper({
			el: $taskEl,
			model: taskGraph,
			gridSize: 1,

			interactive: interactive
		}),

		systemPaper = new joint.dia.Paper({
			el: $systemEl,
			model: systemGraph,
			gridSize: 1,

			interactive: interactive
		});

	function activeSave(graph, type) {
		clearTimeout(graph.saveTimeout);

		graph.saveTimeout = setTimeout(function () {
			var json = graph.toJSON();

			storage.save(json, type)
		}, 100);
	}

	function bringToFront(cellView) {
		cellView.model.toFront();
	}

	// saving after 0.1 sec of inactivity
	taskGraph.on('change add remove', activeSave.bind(null, taskGraph, 'task'));
	systemGraph.on('change add remove', activeSave.bind(null, systemGraph, 'system'));

	taskPaper.on('cell:pointerdown', bringToFront);
	systemPaper.on('cell:pointerdown', bringToFront);

	var taskSaved = storage.load('task'),
		systemSaved = storage.load('system');

	if (taskSaved) {
		taskGraph.fromJSON(taskSaved);
	}

	if (systemSaved) {
		systemGraph.fromJSON(systemSaved);
	}

	return {
		taskGraph: taskGraph,
		taskPaper: taskPaper,
		systemGraph: systemGraph,
		systemPaper: systemPaper
	};
});