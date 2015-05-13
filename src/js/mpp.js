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
			var duplex = confirm('Allow duplex?');
			var chan_count = Math.max(1, prompt('Physical links count?', '1') | 0);
			
			$mppInner.html(templates.mpp(mpp({
				queue: algo.queue()
			}, duplex, chan_count)));
		}
	}

	$mppBox.on('click', '#mpp-generate', generate);
	$mppBox.on('change', '#mpp-duplex', generate);
	$mppBox.on('change', '#mpp-proc-multi', generate);
	$mppBox.on('change', '#mpp-phys-links', generate);

	proc.change.add(generate);
});