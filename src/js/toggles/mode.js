define(['joint', 'jquery', 'shapes'], function (joint, $) {
	var button = $('#mode'),
		tools = {
			mode: 'edit',
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