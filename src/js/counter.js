define(['canvasi', 'underscore'], function (canvasi, _) {
	return function () {
		var elements = canvasi.graph.getElements(),
			data = [];

		function _curses(element, options, paths, path) {
			var links = canvasi.graph.getConnectedLinks(element, options);

			if (options.inbound && path) {
				path.push(element);
			}

			path = path || [];
			paths = paths || [];

			if (options.outbound) {
				path.push(element);
			}

			_.each(links, function (link) {
				var _target = link.prop(options.inbound ? 'source' : 'target').id,
					_element = canvasi.graph.getCell(_target);

				if (element.id === _element.id) {
					return;
				}

				_curses(_element, options, paths, path.slice(0));
			});

			paths.push(path);

			return paths;
		}

		_.each(elements, function (element) {
			var pathsO = _curses(element, {
				outbound: true
			}, []);

			var pathsI =  _curses(element, {
				inbound: true, deep: true
			}, []);

			var Nkrk = pathsO
				.map(function (a) {
					return a.length;
				})
				.reduce(function (prev, curr) {
					return Math.max(prev, curr);
				}, 0);

			var Tkrk = pathsO
				.map(function (a) {
					return a
						.map(function (e) {
							return e.getDescr();
						})
						.reduce(function (prev, curr) {
							return +prev + +curr;
						}, 0);
				})
				.reduce(function (prev, curr) {
					return Math.max(prev, curr);
				}, 0);

			var Nkrn = pathsI
				.map(function (a) {
					return a.length;
				})
				.reduce(function (prev, curr) {
					return Math.max(prev, curr);
				}, 0);

			var Tkrn = pathsI
				.map(function (a) {
					return a
						.map(function (e) {
							return e.getDescr();
						})
						.reduce(function (prev, curr) {
							return +prev + +curr;
						}, 0);
				})
				.reduce(function (prev, curr) {
					return Math.max(prev, curr);
				}, 0);

			data.push({
				element: element,
				Nkrk: Nkrk,
				Tkrk: Tkrk,
				Nkrn: Nkrn,
				Tkrn: Tkrn
			});
		});

		var Nkrgrk = Math.max.apply(Math, _.pluck(data, 'Nkrk'));
		var Tkrgrk = Math.max.apply(Math, _.pluck(data, 'Tkrk'));
		var Nkrgrn = Math.max.apply(Math, _.pluck(data, 'Nkrn'));
		var Tkrgrn = Math.max.apply(Math, _.pluck(data, 'Tkrn'));

		var Nmin = Math.round(_.reduce(_.map(data, function (rec) {
			return rec.element.getDescr();
		}), function (memo, num) {
			return memo + num;
		}) / Tkrgrk);

		_.each(data, function (rec) {
			rec.Psr = rec.Tkrn;
			rec.Rsr = Tkrgrk - rec.Tkrk;
			rec.Luft = rec.Rsr - rec.Psr;

			rec.Pr = rec.Nkrk / Nkrgrk + rec.Tkrk / Tkrgrk;
			rec.S = canvasi.graph.getConnectedLinks(rec.element).length;
			rec.E = canvasi.graph.getConnectedLinks(rec.element, { outbound: true }).length;
			rec.W = +rec.element.getDescr();
		});

		return data;
	};
});