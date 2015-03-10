define(['jquery', 'joint', 'canvasi', 'type', 'underscore', 'scc'], function ($, joint, canvasi, type, _, scc) {
	var $check = $('#check');

	function checkTask(elements) {


		function _curses(element) {
			var links = canvasi.graph.getConnectedLinks(element, {
				outbound: true
			});

			_.each(links, function (link) {
				var _target = link.prop('target').id,
					_element = canvasi.graph.getCell(_target);

				console.log('%s => %s', element.getTitle(), _element.getTitle());

				if (element.id === _element.id) {
					return;
				}

				if (element.prop('traversed/' + _element.id)) {

					throw new Error();
				}

				element.prop('traversed/' + _element.id, true);

				_curses(_element);
			});

			// clean only this element
			element.prop('traversed', {});
		}

		try {
			_.each(elements, function (element) {
				element.prop('traversed', {});
			});

			_.each(canvasi.graph.getElements(), function (element) {
				_curses(element);
			});


		} catch (e) {
			alert('ERROR: Got cycle.');
			return false;
		}

		return true;
	}

	function checkSystem(elements) {
		(function _curses(element) {
			var indexOf = elements.indexOf(element);

			if (indexOf > -1) {
				elements.splice(indexOf, 1);
				_.each(canvasi.graph.getNeighbors(element), _curses);
			}
		})(elements[0]);

		if (elements.length) {
			alert('ERROR: There is an element without a link.');
			return false;
		}

		return true;
	}

	function check() {
		var elements = canvasi.graph.getElements(),
			result = false;

		if (!elements.length) {
			alert('ERROR: No elements');
			return;
		}

		switch (type.mode) {
			case 'task':
				result = checkTask(elements);
				break;

			case 'system':
				result = checkSystem(elements);
				break;
		}

		if (result) {
			alert('ALL IS OK');
		}
	}

	$check.on('click', check);
});