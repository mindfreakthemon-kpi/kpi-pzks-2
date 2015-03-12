define(['counter', 'underscore'], function (counter, _) {
	var $algo = $('#algo');

	var algos = {
		2: function (data) {
			return _.map(_.sortBy(data.list, 'Luft'), function (rec) {
				return rec.element.getTitle() + ' (' + rec.Luft + ')';
			}).join(', ');
		},
		7: function (data) {
			return _.map(_.sortBy(data.list, function (rec) {
				return rec.Nkrn + '_' + (data.Sgr - rec.S);
			}), function (rec) {
				return rec.element.getTitle() + ' (' + rec.Nkrn + '; ' + rec.S + ')';
			}).join(', ');
		},
		9: function (data) {
			return _.map(_.sortBy(data.list, 'Nkrn'), function (rec) {
				return rec.element.getTitle() + ' (' + rec.Nkrn + ')';
			}).join(', ');
		},
		11: function (data) {
			return _.map(_.sortBy(data.list, function (rec) {
				return rec.S + '_' + (data.Nkrgrn - rec.Nkrn);
			}).reverse(), function (rec) {
				return rec.element.getTitle() + ' (' + rec.S + '; ' + rec.Nkrn + ')';
			}).join(', ');
		},
		17: function (data) {
			return _.map(_.filter(data.list, function (rec) {
				console.log(rec.I);
				return rec.I === 0;
			}), function (rec) {
				return rec.element.getTitle();
			}).join(', ');
		}
	};

	$algo.on('click', 'button', function (e) {
		var data = counter();

		var algo = e.target.dataset.algo,
			output = algos[algo](data);

		alert(output);
	});
});