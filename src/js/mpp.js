define(['jquery', 'canvasi', 'templates', 'functions/mpp'], function ($, canvasi, templates, mpp) {
	var $mpp = $('#mpp'),
		$mppBox = $('#mpp-box'),
		$mppInner = $('#mpp-inner');

	$mpp
		.on('click', function () {
			$mppBox.toggleClass('visible');
		});

	$mppBox
		.on('click', '#mpp-generate', function () {
			$mppInner.html(templates.mpp(mpp()));
		});
});