define(['joint', 'jquery', 'shapes'], function (joint, $) {
	var tools = {
			mode: $('#algo :checked').val(),
			change: $.Callbacks('memory')
		};

	$(document)
		.on('change', '#algo', function (e) {
			var oldMode = tools.mode;

			tools.mode = e.target.value;
			tools.change.fire(tools.mode, oldMode);
		});

	tools.change.fire(tools.mode, null);

	return tools;
});