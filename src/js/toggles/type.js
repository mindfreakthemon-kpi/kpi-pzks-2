define(['joint', 'jquery', 'shapes'], function (joint, $) {
	var button = $('#type'),
		tools = {
			mode: 'task',
			change: $.Callbacks('memory')
		};

	button.on('change', function (e) {
		var oldMode = tools.mode;

		tools.mode = e.target.value;
		tools.change.fire(tools.mode, oldMode);
	});

	tools.change.fire(tools.mode, null);

	return tools;
});