define(['jquery', 'canvasi', 'api/checker'], function ($, canvasi, checker) {
	var $check = $('#check');

	function check() {
		var result = true;

		result &= checker.checkTask(canvasi.taskGraph.getElements());
		result &= checker.checkSystem(canvasi.systemGraph.getElements());

		if (result) {
			alert('ALL IS OK');
		}
	}

	$check.on('click', check);
});