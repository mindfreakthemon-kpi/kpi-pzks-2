define(['underscore', 'canvasi', 'toggles/proc'], function (_, canvasi, proc) {
	function isFree(data, processorId) {
		return !data.PROC_ASSIGNED_TASK_MAP.has(processorId) && !data.PROC_ASSIGNED_TASK_TEMP_MAP.has(processorId);
	}

	var procs = {
		1: function (data) {
			return _.chain(data.PROCESSOR_QUEUE)
				// only free
				.filter(function (processor) {
					return isFree(data, processor.id);
				})
				.map(_.iteratee('id'))
				// random
				.sample()
				.value();
		},
		2: function (data) {
			return _.chain(data.PROCESSOR_QUEUE)
				// sort by passive counter in asc
				.sortBy(function (processor) {
					return data.PROC_PASSIVE_COUNTERS_MAP[processor.id];
				})
				// in desc
				.reverse()
				// only free
				.filter(function (processor) {
					return isFree(data, processor.id);
				})
				.map(_.iteratee('id'))
				.first()
				.value();
		},
		3: function (data) {
			return _.chain(data.PROCESSOR_QUEUE)
				// sort by links count in asc
				.sortBy(function (processor) {
					return canvasi.systemGraph.getConnectedLinks(processor.element).length;
				})
				// in desc
				.reverse()
				// only free
				.filter(function (processor) {
					return isFree(data, processor.id);
				})
				.map(_.iteratee('id'))
				.first()
				.value();
		}
	};

	return {
		procs: procs,
		find: function (data, alNum) {
			var n = alNum || proc.mode;

			return procs[n](data);
		}
	};
});