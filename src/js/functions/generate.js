define(['jquery', 'api/generate', 'templates'], function ($, generate, templates) {
	var $generate = $('#generate'),
		$generateBox = $('#generate-box').html(templates.generate()),
		$generateForm = $('#generate-form');

	$generate.on('click', function () {
		$generateBox.toggleClass('visible');
	});

	$generateForm.on('submit', function (e) {
		var form = e.target,
			elements = form.elements;

		e.preventDefault();

		generate.generateGraph(
			elements.minWeight.valueAsNumber,
			elements.maxWeight.valueAsNumber,
			elements.numVertices.valueAsNumber,
			elements.correlation.valueAsNumber,
			elements.minLinkWeight.valueAsNumber);
	});
});