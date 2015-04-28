define(['canvasi', 'underscore'], function (canvasi, _) {
	function checkTask(elements) {
		if (elements.length) {

		}
		function _curses(element) {
			var links = canvasi.taskGraph.getConnectedLinks(element, {
				outbound: true
			});

			_.each(links, function (link) {
				var _target = link.prop('target').id,
					_element = canvasi.taskGraph.getCell(_target);

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

			_.each(canvasi.taskGraph.getElements(), function (element) {
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
				_.each(canvasi.systemGraph.getNeighbors(element), _curses);
			}
		})(elements[0]);

		if (elements.length) {
			alert('ERROR: There is an element without a link.');
			return false;
		}

		return true;
	}

	return {
		checkTask: checkTask,
		checkSystem: checkSystem
	}
});