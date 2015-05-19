define(['jquery', 'canvasi', 'templates', 'api/generate', 'api/counter', 'api/algo', 'api/proc', 'functions/mpp', 'async'], function ($, canvasi, templates, generate, counter, apiAlgo, apiProc, mpp, async) {
	var $stat = $('#stat'),
		$statBox = $('#stat-box'),
		$statGen = $('#stat-generate'),
		$statProgress = $('#stat-progress'),
		$statInner = $('#stat-inner');

	var CSV = null;

	var $procInputs = $("#proc :input"),
		procValues = _.map($procInputs, function (el) {
			return el.value;
		});
	var $algoInputs = $("#algo :input"),
		algoValues = _.map($algoInputs, function (el) {
			return el.value;
		});

	function generateCSV(data) {
		return '\uFEFF' + $.map(data, function (line) {
				return $.map(line, function (v) {
					v = ('' + v).replace(/"/g, '""');

					if (v.search(/("|,|\n)/g) >= 0) {
						v = '"' + v + '"';
					}

					//v = '"=""' + v + '"""';

					return v;
				}).join(',');
			}).join('\r\n');
	}

	function setInputChecked($inputs, value) {
		$inputs
			.removeAttr('checked')
			.filter('[value=' + value + ']')
			.attr('checked', 'true')
			.trigger('change');
	}

	$stat
		.on('click', function () {
			$statBox.toggleClass('visible');
		});

	function iterate() {
		if (!$statBox.hasClass('visible')) {
			return;
		}

		var duplex = confirm('Allow duplex?');
		var chan_count = Math.max(1, prompt('Physical links count?', '1') | 0);

		var PROC_COUNT = canvasi.systemGraph.getElements().length;

		$statGen.attr('disabled', 'true');

		var TASKS_MIN = parseInt($("#stat-tasks-min").val(), 10),
			TASKS_MAX = parseInt($("#stat-tasks-max").val(), 10),
			TASKS_STEP = parseInt($("#stat-tasks-step").val(), 10);

		var TASKS_RANGE = _.range(TASKS_MIN, TASKS_MAX, TASKS_STEP);
		TASKS_RANGE.push(TASKS_MAX);

		var CONN_MIN = parseFloat($("#stat-conn-min").val()),
			CONN_MAX = parseFloat($("#stat-conn-max").val()),
			CONN_STEP = parseFloat($("#stat-conn-step").val());

		var CONN_RANGE = _.range(CONN_MIN, CONN_MAX, CONN_STEP);
		CONN_RANGE.push(CONN_MAX);

		var WEIGHT_MIN = parseInt($("#stat-weight-min").val(), 10),
			WEIGHT_MAX = parseInt($("#stat-weight-max").val(), 10);

		var TIMES = parseInt($('#stat-n').val(), 10);

		var TABLE = [];

		var I = 0,
			TOTAL = TASKS_RANGE.length * CONN_RANGE.length * TIMES;

		var DATA_MAP = {};

		$statProgress.attr('max', TOTAL);

		var _tasks = [];

		TASKS_RANGE.forEach(function (TASK_N) {
			CONN_RANGE.forEach(function (CONN_N) {
				_.range(TIMES)
					.forEach(function () {
						_tasks.push(function (callback) {
							$statProgress.attr('value', ++I);

							generate.generateGraph(
								WEIGHT_MIN,
								WEIGHT_MAX,
								TASK_N,
								CONN_N,
								1);

							algoValues.forEach(function (algo) {
								setInputChecked($algoInputs, algo);

								var counts = counter(),
									queue = apiAlgo.algos[algo](counts);

								procValues.forEach(function (proc) {
									setInputChecked($procInputs, proc);

									var results = mpp({
										queue: queue
									}, duplex, chan_count);

									var Ky = counts.Tmin / results.states.length,
										Ke = Ky / PROC_COUNT,
										Kae = counts.Tkrgrk / results.states.length;

									var key = algo + '_' + proc + '_' + TASK_N + '_' + CONN_N;

									if (!DATA_MAP[key]) {
										DATA_MAP[key] = {
											Ky: 0,
											Ke: 0,
											Kae: 0
										};
									}

									DATA_MAP[key].Ky += Ky;
									DATA_MAP[key].Ke += Ke;
									DATA_MAP[key].Kae += Kae;
								});
							});

							setTimeout(callback.bind(this, null), 0);
						});
					});
			});
		});


		async.series(_tasks, function () {
			$statProgress.attr('max', TOTAL);
			$statGen.removeAttr('disabled');

			Object.keys(DATA_MAP)
				.forEach(function (key) {
					var split = key.split('_'),
						algo = split[0],
						proc = split[1],
						TASK_N = split[2],
						CONN_N = split[3],
						val = DATA_MAP[key];

					TABLE.push([algo, proc, TASK_N, CONN_N, val.Ky / TIMES, val.Ke / TIMES, val.Kae / TIMES]);
				});


			CSV = generateCSV(TABLE);

			$statInner.html(templates.stat({
				table: TABLE
			}));
		});
	}

	$statGen.on('click', iterate);
	$statBox.on('click', '#stat-download', function () {
		var blob = new Blob([CSV]),
			a = document.createElement('a');

		var wrapperURL = (window.URL || window.webkitURL),
			url = wrapperURL.createObjectURL(blob),
			event = new MouseEvent('click');

		a.download = 'data.csv';
		a.href = url;
		a.dispatchEvent(event);
	});
});