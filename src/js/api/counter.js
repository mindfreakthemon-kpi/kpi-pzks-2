define(['canvasi', 'underscore'], function (canvasi, _) {
	return function () {
		var elements = canvasi.taskGraph.getElements(),
			data = [];

		var LINKS_INBOUND_CACHE = new Map();
		var LINKS_OUTBOUND_CACHE = new Map();
		var LINKS_CACHE = new Map();

		function getLinks(element, options) {
			var result;

			options = options || {};

			if (options.inbound) {
				if (LINKS_INBOUND_CACHE.has(element)) {
					return LINKS_INBOUND_CACHE.get(element);
				}

				result = canvasi.taskGraph.getConnectedLinks(element, options);
			} else if (options.outbound) {
				if (LINKS_OUTBOUND_CACHE.has(element)) {
					return LINKS_OUTBOUND_CACHE.get(element);
				}

				result = canvasi.taskGraph.getConnectedLinks(element, options);
			} else {
				if (LINKS_CACHE.has(element)) {
					return LINKS_CACHE.get(element);
				}

				result = canvasi.taskGraph.getConnectedLinks(element, options);

			}

			if (options.inbound) {
				LINKS_INBOUND_CACHE.set(element, result);
			} else if (options.outbound) {
				LINKS_OUTBOUND_CACHE.set(element, result);
			} else {
				LINKS_CACHE.set(element, result);
			}

			return result;
		}

		function _curses(element, options, paths, path) {
			var links = getLinks(element, options);//canvasi.taskGraph.getConnectedLinks(element, options);

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
					_element = canvasi.taskGraph.getCell(_target);

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

		var Tmin = _.reduce(_.map(data, function (rec) {
			return parseInt(rec.element.getDescr(), 10);
		}), function (memo, num) {
			return memo + num;
		});

		var Nmin = Math.round(Tmin / Tkrgrk);

		_.each(data, function (rec) {
			var inboundLinks = getLinks(rec.element, { inbound: true });//canvasi.taskGraph.getConnectedLinks(rec.element, { inbound: true });

			rec.id = rec.element.id;

			rec.Psr = rec.Tkrn;
			rec.Rsr = Tkrgrk - rec.Tkrk;
			rec.Luft = rec.Rsr - rec.Psr;

			rec.Pr = rec.Nkrk / Nkrgrk + rec.Tkrk / Tkrgrk;
			rec.S = getLinks(rec.element).length;//canvasi.taskGraph.getConnectedLinks(rec.element).length;
			rec.E = getLinks(rec.element, { outbound: true }).length;//canvasi.taskGraph.getConnectedLinks(rec.element, { outbound: true }).length;
			rec.I = inboundLinks.length;
			rec.W = +rec.element.getDescr();

			rec.PAR = [];

			inboundLinks.forEach(function (link) {
				var target = link.get('source').id,
					targetElement = canvasi.taskGraph.getCell(target);

				rec.PAR.push(targetElement);
			});
		});

		var Sgr = Math.max.apply(Math, _.pluck(data, 'S'));

		return {
			list: data,
			Nkrgrk: Nkrgrk,
			Tkrgrk: Tkrgrk,
			Nkrgrn: Nkrgrn,
			Tkrgrn: Tkrgrn,
			Tmin: Tmin,
			Sgr: Sgr
		};
	};
});