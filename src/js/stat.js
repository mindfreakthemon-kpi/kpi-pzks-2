define(['jquery', 'canvasi', 'templates', 'api/generate', 'api/counter', 'functions/mpp', 'async'], function ($, canvasi, templates, generate, counter, mpp, async) {
	var $stat = $('#stat'),
		$statBox = $('#stat-box'),
		$statGen = $('#stat-generate'),
		$statProgress = $('#stat-progress'),
		$statInner = $('#stat-inner');

	var CSV = null;

	var $procInputs = $("#proc :input"),
		procValues = _.map($procInputs, function (el) { return el.value; });
	var $algoInputs = $("#algo :input"),
		algoValues = _.map($algoInputs, function (el) { return el.value; });

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
			.attr('checked', 'true');
	}

	$stat
		.on('click', function () {
			$statBox.toggleClass('visible');
		});

	function iterate() {
		if (!$statBox.hasClass('visible')) {
			return;
		}

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

		var TABLE = [],
			ROWS = [];

		var I = 0,
			TOTAL = algoValues.length * procValues.length * TASKS_RANGE.length * CONN_RANGE.length * TIMES;

		$statProgress.attr('max', TOTAL);

		function step(algo, proc, TASK_N, CONN_N, graphs) {
			setInputChecked($procInputs, proc);
			setInputChecked($algoInputs, algo);

			var E_Ky = 0,
				E_Ke = 0,
				E_Kae = 0;

			graphs
				.forEach(function (graph) {
					canvasi.taskGraph.fromJSON(graph);

					var counts = counter();
					var results = mpp();

					var Ky = counts.Tmin / results.states.length,
						Ke = Ky / PROC_COUNT,
						Kae = counts.Tkrgrk / results.states.length;

					E_Ky += Ky;
					E_Ke += Ke;
					E_Kae += Kae;
				});

			TABLE.push([algo, proc, TASK_N, CONN_N, E_Ky / TIMES, E_Ke / TIMES, E_Kae / TIMES]);
		}

		var _tasks = [];

		algoValues.forEach(function (algo) {
			procValues.forEach(function (proc) {
				TASKS_RANGE.forEach(function (TASK_N) {
					CONN_RANGE.forEach(function (CONN_N) {

						_tasks.push(function (callback) {
							var graphs = [];

							_.range(TIMES)
								.forEach(function () {
									$statProgress.attr('value', ++I);

									generate.generateGraph(
										WEIGHT_MIN,
										WEIGHT_MAX,
										TASK_N,
										CONN_N,
										1);

									graphs.push(canvasi.taskGraph.toJSON());
								});

							ROWS.push([algo, proc, TASK_N, CONN_N, graphs]);

							setTimeout(callback.bind(this, null));
						});
					});
				});
			});
		});

		function curses(i) {
			$statProgress.attr('value', i + 1);

			step.apply(this, ROWS[i]);

			if (++i >= ROWS.length) {
				CSV = generateCSV(TABLE);

				$statInner.html(templates.stat({
					table: TABLE
				}));

				$statGen.removeAttr('disabled');

				return;
			}

			setTimeout(curses.bind(this, i), 0);
		}

		async.series(_tasks, function () {
			$statProgress.attr('max', ROWS.length);

			curses(0);
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