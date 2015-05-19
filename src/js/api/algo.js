define(['api/counter', 'underscore', 'toggles/algo'], function (counter, _, algo) {
	var algos = {
		1: function (data) {
			return _.sortBy(data.list, 'Pr').reverse();
		},
		2: function (data) {
			return _.sortBy(data.list, 'Luft');
		},
		3: function (data) {
			return _.sortBy(data.list, 'Tkrk').reverse();
		},
		7: function (data) {
			return _.sortBy(data.list, function (rec) {
				return rec.Nkrn + '_' + (data.Sgr - rec.S);
			});
		},
		9: function (data) {
			return _.sortBy(data.list, 'Nkrn');
		},
		10: function (data) {
			return _.sortBy(data.list, function (rec) {
				return rec.S + '_' + rec.Nkrk;
			}).reverse();
		},
		11: function (data) {
			return _.sortBy(data.list, function (rec) {
				return rec.S + '_' + (data.Nkrgrn - rec.Nkrn);
			}).reverse();
		},
		16: function (data) {
			return _.sortBy(data.list, 'Tkrn');
		},
		17: function (data) {
			var list = data.list.slice(0),
				result = [];

			while (list.length) {
				list = _.filter(list, function (rec) {
					var ok = rec.I === 0;

					if (ok) {
						result.push(rec);
						return false;
					}

					if (rec.PAR.every(function (parElem) {
							return _.findWhere(result, {
								id: parElem.id
							})
						})) {
						rec.I--;
					}

					return true;
				});
			}

			return result;
		}
	};

	return {
		algos: algos,
		queue:  function (alNum) {
			var data = counter(),
				n = alNum || algo.mode;

			return algos[n](data);
		},
		mode: function () {
			return algo.mode;
		}
	};
});