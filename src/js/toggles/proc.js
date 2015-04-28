define(['joint', 'jquery', 'shapes'], function (joint, $) {
	var tools = {
			mode: '1',
			change: $.Callbacks('memory')
		};

	$(document)
		.on('change', '#proc', function (e) {
			var oldMode = tools.mode;

			tools.mode = e.target.value;
			tools.change.fire(tools.mode, oldMode);
		});

	tools.change.fire(tools.mode, null);

	return tools;
});