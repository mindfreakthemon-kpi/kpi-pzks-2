define(['jquery', 'canvasi', 'templates', 'functions/mpp', 'toggles/proc', 'api/algo'], function ($, canvasi, templates, mpp, proc, algo) {
	var $mpp = $('#mpp'),
		$mppBox = $('#mpp-box'),
		$mppInner = $('#mpp-inner');

	$mpp
		.on('click', function () {
			$mppBox.toggleClass('visible');
		});

	function generate() {
		if ($mppBox.hasClass('visible')) {
			$mppInner.html(templates.mpp(mpp({
				queue: algo.queue()
			})));
		}
	}

	$mppBox.on('click', '#mpp-generate', generate);
	$mppBox.on('change', '#mpp-duplex', generate);
	$mppBox.on('change', '#mpp-proc-multi', generate);
	$mppBox.on('change', '#mpp-phys-links', generate);

	proc.change.add(generate);
});