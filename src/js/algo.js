define(['counter', 'underscore'], function (counter, _) {
	var $algo = $('#algo');

	var algos = {
		2: function (data) {
			return _.map(_.sortBy(data, 'Luft'), function (rec) {
				return rec.element.getTitle() + ' (' + rec.Luft + ')';
			}).join(', ');
		},
		9: function (data) {
			return _.map(_.sortBy(data, 'Nkrn'), function (rec) {
				return rec.element.getTitle() + ' (' + rec.Nkrn + ')';
			}).join(', ');
		},
		11: function (data) {
			return _.map(_.sortBy(data, function (rec) {
				return rec.S + '_' + rec.Nkrn;
			}), function (rec) {
				return rec.element.getTitle() + ' (' + rec.S + '; ' + rec.Nkrn + ')';
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