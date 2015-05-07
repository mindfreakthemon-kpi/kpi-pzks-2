define(['underscore', 'canvasi', 'toggles/proc', 'functions/cpath'], function (_, canvasi, proc, cpath) {
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
		},
		4: function () {
			return this['5'].apply(this, arguments);
		},
		5: function (data, taskId) {
			var map = new Map(),
				parentTaskIds = [];

			_.chain(data.LINK_QUEUE)
				.filter(function (link) {
					return link.target === taskId;
				})
				.each(function (link) {
					parentTaskIds.push(link.source);
				})
				.value();

			var queue = _.chain(data.PROCESSOR_QUEUE)
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
				.sortBy(function (procId) {
					var sum = 0;

					parentTaskIds.forEach(function (parentTaskId) {
						var sourceProcId = data.TASK_ASSIGNED_PROC_MAP.get(parentTaskId);

						if (typeof sourceProcId === 'undefined') {
							// task parent task wasn't assigned
							return;
						}

						if (sourceProcId === procId) {
							return;
						}

						var path = cpath(data.SYSTEM_MATRIX, sourceProcId, procId);

						sum += (path.length - 1) * data.TASK_QUEUE[parentTaskId].weight;
					});

					map.set(procId, sum);

					return sum;
				})
				.value();

			data.INVARIANTING_ARRAY.push({
				taskId: taskId,
				map: map
			});

			return queue.shift();
		}
	};

	return {
		procs: procs,
		find: function (data, taskId) {
			var n = proc.mode;

			return procs[n](data, taskId);
		}
	};
});