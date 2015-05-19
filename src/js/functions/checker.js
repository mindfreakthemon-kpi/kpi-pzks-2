define(['jquery', 'canvasi', 'api/checker'], function ($, canvasi, checker) {
	var $check = $('#check');

	function check() {
		var result = true;

		result &= checker.checkTask(canvasi.taskGraph.getElements());
		result &= checker.checkSystem(canvasi.systemGraph.getElements());

		if (result) {
			alert('Everything seems good');
		}
	}

	$check.on('click', check);
});