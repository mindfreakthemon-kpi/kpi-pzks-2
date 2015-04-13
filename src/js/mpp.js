define(['jquery', 'canvasi', 'toggles/mode'], function ($, canvasi, mode) {
	var ns = joint.shapes.ns,
		$mpp = $('#mpp'),
		$mppBox = $('#mpp-box');

	$mpp.on('click', function () {
		$mppBox.toggleClass('visible');
	});
});