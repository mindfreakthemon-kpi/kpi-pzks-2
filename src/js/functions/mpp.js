define(['jquery', 'underscore', 'canvasi', 'functions/cpath', 'api/proc'], function ($, _, canvasi, cpath, proc) {
	'use strict';

	return function (data, DUPLEX_ALLOWED, CHAN_PHYSICAL_LINKS) {
		data = data || {};
		//////////////////////////////////////////////////////
		var INVARIANTING_ARRAY = [];

		var TASK_READY_SET = new Set();
		var TASK_FINISHED_SET = new Set();
		var TASK_ASSIGNED_PROC_MAP = new Map();
		var PROC_ASSIGNED_TASK_TEMP_MAP = new Map();

		var LINK_READY_SET = new Set();
		var LINK_FINISHED_SET = new Set();

		var CHAN_LINK_QUEUE_MAP = {};
		var CHAN_ASSIGNED_LINK_MAP = new Map();
		var CHAN_ASSIGNED_LINK_TEMP_MAP = new Map();
		var CHAN_COUNTERS_MAP = {};
		//var CHAN_PHYSICAL_LINKS = $('#mpp-phys-links').val() | 0;

		var PROC_ASSIGNED_TASK_MAP = new Map();
		var PROC_COUNTERS_MAP = {};
		var PROC_PASSIVE_COUNTERS_MAP = {};
		var PROC_MULTIPLIER = 1;//parseFloat($('#mpp-proc-multi').val());
		//var DUPLEX_ALLOWED = $('#mpp-duplex').is(':checked');
		//////////////////////////////////////////////////////


		//////////////////////////////////////////////////////
		var LINK_QUEUE = [];

		var CHAN_QUEUE = [];

		var TASK_QUEUE = _.chain(data.queue)
			.pluck('element')
			.map(function (task) {
				return {
					number: task.getTitle(),
					weight: task.getDescr() | 0,
					element: task
				};
			})
			.value();

		TASK_QUEUE.forEach(function (task, taskId) {
			var links = canvasi.taskGraph.getConnectedLinks(task.element, {
				outbound: true
			});

			links.forEach(function (link) {
				var target = link.get('target').id,
					targetElement = canvasi.taskGraph.getCell(target);

				LINK_QUEUE.push({
					source: taskId,
					target: findTaskIndexByNumber(targetElement.getTitle()),
					weight: link.getLabel() | 0
				});
			});
		});

		var PROCESSOR_QUEUE = _.chain(canvasi.systemGraph.getElements())
			.sortBy(function (processor) {
				console.log(canvasi.systemGraph.getConnectedLinks(processor).length);
				return '' + canvasi.systemGraph.getConnectedLinks(processor).length + '_' + processor.getTitle();
			})
			.reverse()
			.map(function (processor, processorId) {
				// reset counters
				PROC_COUNTERS_MAP[processorId] = 0;
				PROC_PASSIVE_COUNTERS_MAP[processorId] = 0;

				return {
					id: processorId,
					number: processor.getTitle(),
					weight: processor.getDescr() | 0,
					element: processor
				};
			})
			.value();

		PROCESSOR_QUEUE.forEach(function (processor, processorId) {
			canvasi.systemGraph
				.getConnectedLinks(processor.element, {
					outbound: true
				})
				.forEach(function (channel) {
					var target = channel.get('target').id,
						processorElement = canvasi.systemGraph.getCell(target),
						targetId = findProcessorIndexByNumber(processorElement.getTitle());

					if (findChannelBySourceTarget(targetId, processorId) === -1) {
						CHAN_QUEUE.push({
							source: targetId,
							target: processorId
						});
					}
				});

			canvasi.systemGraph
				.getConnectedLinks(processor.element, {
					inbound: true
				})
				.forEach(function (channel) {
					var source = channel.get('source').id,
						processorElement = canvasi.systemGraph.getCell(source),
						sourceId = findProcessorIndexByNumber(processorElement.getTitle());

					if (findChannelBySourceTarget(sourceId, processorId) === -1) {
						CHAN_QUEUE.push({
							source: sourceId,
							target: processorId
						});
					}
				});
		});

		CHAN_QUEUE.forEach(function (channel, channelId) {
			// assign for back reference
			channel.id = channelId;

			// reset queue for channel
			CHAN_LINK_QUEUE_MAP[channelId] = [];

			// reset counter
			CHAN_COUNTERS_MAP[channelId] = 0;
		});

		var SYSTEM_MATRIX = _.map(PROCESSOR_QUEUE, function (processor, processorId) {
			var row = Array.apply(null, { length: PROCESSOR_QUEUE.length }).map(function () {
				return Infinity;
			});

			row[processorId] = 0;

			CHAN_QUEUE.forEach(function (channel) {
				if (channel.source === processorId) {
					row[channel.target] = 1;
				}
			});

			return row;
		});
		//////////////////////////////////////////////////////

		//console.log(JSON.stringify(LINK_QUEUE, null, ' '));
		//console.log(JSON.stringify(TASK_QUEUE, null, ' '));
		//console.log(JSON.stringify(PROCESSOR_QUEUE, null, ' '));
		//console.log(JSON.stringify(CHAN_QUEUE, null, ' '));
		//console.log(JSON.stringify(SYSTEM_MATRIX, null, ' '));

		//////////////////////////////////////////////////////
		function findProcessorIndexByNumber(number) {
			return _.findIndex(PROCESSOR_QUEUE, function (v) {
				return v.number === number;
			});
		}

		function findTaskIndexByNumber(number) {
			return _.findIndex(TASK_QUEUE, function (v) {
				return v.number === number;
			});
		}

		function findChannelBySourceTarget(source, target) {
			return _.findIndex(CHAN_QUEUE, function (v) {
				return v.source === source && v.target === target;
			});
		}

		function findInverseChannelByChannelId(channelId) {
			let channel = CHAN_QUEUE[channelId];

			return findChannelBySourceTarget(channel.target, channel.source);
		}

		function findNeighborChannelIdsByChannelId(channelId) {
			var _channel = CHAN_QUEUE[channelId];

			return _.chain(CHAN_QUEUE)
				.filter(function (channel) {
					return channel.id !== channelId && (
							channel.source === _channel.source ||
							channel.target === _channel.source ||
							channel.source === _channel.target ||
							channel.target === _channel.target
						);
				})
				.map(function (channel) {
					return channel.id;
				})
				.value();
		}

		function findChannelsBySourceTarget(source, target) {
			if (source === target) {
				return [];
			}

			var path = cpath(SYSTEM_MATRIX, source, target);
			var result = [];
			var current = path.shift();

			path.forEach(function (processorId) {
				result.push(findChannelBySourceTarget(current, processorId));

				current = processorId;
			});

			return result;
		}

		function assignTaskToProcessor(taskId) {
			var processorId = proc.find({
				PROCESSOR_QUEUE: PROCESSOR_QUEUE,
				PROC_ASSIGNED_TASK_MAP: PROC_ASSIGNED_TASK_MAP,
				TASK_ASSIGNED_PROC_MAP: TASK_ASSIGNED_PROC_MAP,
				PROC_PASSIVE_COUNTERS_MAP: PROC_PASSIVE_COUNTERS_MAP,
				PROC_ASSIGNED_TASK_TEMP_MAP: PROC_ASSIGNED_TASK_TEMP_MAP,
				SYSTEM_MATRIX: SYSTEM_MATRIX,
				INVARIANTING_ARRAY: INVARIANTING_ARRAY,
				TASK_QUEUE: TASK_QUEUE,
				LINK_QUEUE: LINK_QUEUE
			}, taskId);

			if (processorId !== undefined) {
				TASK_ASSIGNED_PROC_MAP.set(taskId, processorId);
				PROC_ASSIGNED_TASK_TEMP_MAP.set(processorId, taskId);
			}
		}

		function assignLinkToChannelOrPush(channelId, linkId) {
			if (isChannelLockedByDuplexDisallowed(channelId) || isChannelLockedByChannelProcessor(channelId)) {
				CHAN_LINK_QUEUE_MAP[channelId].push(linkId);
				return;
			}

			if (!CHAN_ASSIGNED_LINK_MAP.has(channelId) && !CHAN_LINK_QUEUE_MAP[channelId].length) {
				CHAN_COUNTERS_MAP[channelId] = 0;
				CHAN_ASSIGNED_LINK_MAP.set(channelId, linkId);
			} else {
				CHAN_LINK_QUEUE_MAP[channelId].push(linkId);
			}
		}

		function assignLinkToChannelFromQueue(channelId) {
			if (!CHAN_LINK_QUEUE_MAP[channelId].length) {
				return;
			}

			var linkId = CHAN_LINK_QUEUE_MAP[channelId].shift();

			if (isChannelLockedByDuplexDisallowed(channelId) || isChannelLockedByChannelProcessor(channelId)) {
				CHAN_LINK_QUEUE_MAP[channelId].unshift(linkId);
				return;
			}

			if (!CHAN_ASSIGNED_LINK_MAP.has(channelId)) {
				CHAN_COUNTERS_MAP[channelId] = 0;
				CHAN_ASSIGNED_LINK_MAP.set(channelId, linkId);
			} else {
				CHAN_LINK_QUEUE_MAP[channelId].unshift(linkId);
			}
		}

		function markAllLinksReady(taskId) {
			LINK_QUEUE.forEach(function (link, linkId) {
				if (link.source === taskId) {
					LINK_READY_SET.add(linkId);
				}
			});
		}

		function areAllTasksFinished() {
			return TASK_QUEUE.every(function (task, taskId) {
				return TASK_FINISHED_SET.has(taskId);
			});
		}

		function allParentTasksAreFinished(taskId) {
			return _.chain(LINK_QUEUE)
				.filter(function (link) {
					return link.target === taskId;
				})
				.map(function (link) {
					return link.source;
				})
				.every(function (taskId) {
					return TASK_FINISHED_SET.has(taskId);
				})
				.value();
		}

		function isChannelLockedByDuplexDisallowed(channelId) {
			if (DUPLEX_ALLOWED) {
				return false;
			}

			return CHAN_ASSIGNED_LINK_MAP.has(findInverseChannelByChannelId(channelId));
		}

		function isChannelLockedByChannelProcessor(channelId) {
			var neighbors = findNeighborChannelIdsByChannelId(channelId);

			neighbors = neighbors.filter(function (channelId) {
				return CHAN_ASSIGNED_LINK_MAP.has(channelId);
			});

			if (DUPLEX_ALLOWED) {
				let inverseChannelId = findInverseChannelByChannelId(channelId);

				if (neighbors.indexOf(inverseChannelId) > -1) {
					// channel is using duplex slot, so it's ok
					return false;
				}

				// filter out duplexes
				let _neighbors = [];

				neighbors.forEach(function (channelId) {
					var inverseChannelId = findInverseChannelByChannelId(channelId);

					if (_neighbors.indexOf(channelId) === -1 &&
						_neighbors.indexOf(inverseChannelId) === -1) {
						_neighbors.push(channelId);
					}
				})

				neighbors = _neighbors;
			}

			return neighbors.length >= CHAN_PHYSICAL_LINKS;
		}

		function isTaskFinishedOnProcessor(processorId) {
			var taskId = PROC_ASSIGNED_TASK_MAP.get(processorId);

			return (PROC_MULTIPLIER * PROC_COUNTERS_MAP[processorId]) >= TASK_QUEUE[taskId].weight;
		}

		function isLinkFinishedOnChannel(channelId) {
			var linkId = CHAN_ASSIGNED_LINK_MAP.get(channelId);

			return CHAN_COUNTERS_MAP[channelId] >= LINK_QUEUE[linkId].weight;

		}

		function hasTaskAllData(taskId) {
			return LINK_QUEUE.every(function (link, linkId) {
				return link.target === taskId ? LINK_FINISHED_SET.has(linkId) : true;
			});
		}
		//////////////////////////////////////////////////////

		var T = 0;

		var STATES = [];

		// 4. find tasks that are ready to go (only once)
		TASK_QUEUE.forEach(function (task, taskId) {
			var linksIn = canvasi.taskGraph.getConnectedLinks(task.element, {
				inbound: true
			});

			if (!linksIn.length) {
				TASK_READY_SET.add(taskId);
			}
		});

		// 5
		while (!areAllTasksFinished()) {
			// 5.1
			TASK_QUEUE.forEach(function (task, taskId) {
				if (TASK_FINISHED_SET.has(taskId)) {
					return;
				}

				// 5.1.1
				if (TASK_READY_SET.has(taskId)) {
					// 5.1.1.1
					if (!TASK_ASSIGNED_PROC_MAP.has(taskId)) {
						// 5.1.1.1.1
						assignTaskToProcessor(taskId);
					}

					// 5.1.1.2
					if (TASK_ASSIGNED_PROC_MAP.has(taskId)) {
						let processorId = TASK_ASSIGNED_PROC_MAP.get(taskId);

						if (!PROC_ASSIGNED_TASK_MAP.has(processorId)) {
							PROC_ASSIGNED_TASK_MAP.set(processorId, taskId);

							TASK_READY_SET.delete(taskId);
						}
					}
				}
			});

			// 5.2
			LINK_QUEUE.forEach(function (link, linkId) {
				// !!! additional step
				if (LINK_FINISHED_SET.has(linkId)) {
					return;
				}

				// 5.2.1
				if (LINK_READY_SET.has(linkId)) {
					let taskId = link.target;

					// proc
					if (proc.mode() === '4') {
						// check if all parent tasks were finished
						// and proceed only after that

						if (!allParentTasksAreFinished(taskId)) {
							console.log(taskId);
							return;
						}
					}

					// 5.2.1.1
					if (!TASK_ASSIGNED_PROC_MAP.has(taskId)) {
						// 5.2.1.1.1
						assignTaskToProcessor(taskId);
					}

					// 5.2.1.2
					if (TASK_ASSIGNED_PROC_MAP.has(taskId)) {
						// 5.2.1.2.1
						link.path = link.path || findChannelsBySourceTarget(
								TASK_ASSIGNED_PROC_MAP.get(link.source),
								TASK_ASSIGNED_PROC_MAP.get(taskId)
							);

						// 5.2.1.3
						if (TASK_ASSIGNED_PROC_MAP.get(taskId) === TASK_ASSIGNED_PROC_MAP.get(link.source)) {
							// 5.2.1.3.1
							LINK_FINISHED_SET.add(linkId);

							// 5.2.1.3.2
							if (hasTaskAllData(taskId)) {
								let processorId = TASK_ASSIGNED_PROC_MAP.get(taskId);

								// !!! additional step
								// needed so that depended task will run right after this one
								if (!PROC_ASSIGNED_TASK_MAP.has(processorId)) {
									PROC_ASSIGNED_TASK_MAP.set(processorId, taskId);
								} else {
									// 5.2.1.3.2.1
									TASK_READY_SET.add(taskId);
								}
							}
						} else {
							let channelId = link.path.shift();

							// 5.2.1.4 + 5.2.1.5
							assignLinkToChannelOrPush(channelId, linkId);
						}

						// 5.2.1.6
						LINK_READY_SET.delete(linkId);
					}
				}
			});

			/* GATHER STATES RIGHT BEFORE THEY WILL BE PROCESSED */
			(function () {
				var procMap = new Map(),
					chanMap = new Map();

				PROC_ASSIGNED_TASK_MAP.forEach(function (v, k) {
					procMap.set(k, v);
				});

				CHAN_ASSIGNED_LINK_MAP.forEach(function (v, k) {
					chanMap.set(k, v);
				});

				STATES.push({
					row: T,
					processors: procMap,
					channels: chanMap
				});
			})();

			// 5.3
			PROCESSOR_QUEUE.forEach(function (processor, processorId) {
				// 5.3.1
				if (PROC_ASSIGNED_TASK_MAP.has(processorId)) {
					// 5.3.1.1
					PROC_COUNTERS_MAP[processorId]++;

					// 5.3.1.2
					if (isTaskFinishedOnProcessor(processorId)) {
						// 5.3.1.2.1
						let taskId = PROC_ASSIGNED_TASK_MAP.get(processorId);

						TASK_FINISHED_SET.add(taskId);

						// 5.3.1.2.2
						markAllLinksReady(taskId);

						// 5.3.1.2.3
						PROC_COUNTERS_MAP[processorId] = 0;

						// !!! additional step
						PROC_PASSIVE_COUNTERS_MAP[processorId] = 0;

						// 5.3.1.2.4
						PROC_ASSIGNED_TASK_MAP.delete(processorId);
					}
				} else {
					// !!! additional step
					PROC_PASSIVE_COUNTERS_MAP[processorId]++;
				}
			});

			// 5.4
			CHAN_QUEUE.forEach(function (chan, channelId) {
				// 5.4.1
				if (CHAN_ASSIGNED_LINK_MAP.has(channelId)) {
					// 5.4.1.1
					CHAN_COUNTERS_MAP[channelId]++;

					// 5.4.1.2
					if (isLinkFinishedOnChannel(channelId)) {
						let linkId = CHAN_ASSIGNED_LINK_MAP.get(channelId);

						let link = LINK_QUEUE[linkId];

						// 5.4.1.2.1
						if (!link.path.length) {
							// 5.4.1.2.1.1
							LINK_FINISHED_SET.add(linkId);

							// 5.4.1.2.1.2
							if (hasTaskAllData(link.target)) {
								TASK_READY_SET.add(link.target);
							}
						} else {
							let nextChannelId = link.path.shift();
							// 5.4.1.2.2
							//assignLinkToChannelOrPush(nextChannelId, linkId);
							CHAN_ASSIGNED_LINK_TEMP_MAP.set(nextChannelId, linkId);
						}

						// 5.4.1.2.3
						// !! NOOP

						// !!! additional step
						CHAN_ASSIGNED_LINK_MAP.delete(channelId);

						// 5.4.1.2.4
						assignLinkToChannelFromQueue(channelId);
					}
				}
			});

			// !!! additional step
			CHAN_ASSIGNED_LINK_TEMP_MAP.forEach(function (linkId, channelId) {
				assignLinkToChannelOrPush(channelId, linkId);
			});

			// !!! additional step
			PROC_ASSIGNED_TASK_TEMP_MAP.clear();

			// !!! additional step
			CHAN_ASSIGNED_LINK_TEMP_MAP.clear();

			// !!! additional step
			CHAN_QUEUE.forEach(function (chan, channelId) {
				assignLinkToChannelFromQueue(channelId);
			});

			// 5.5
			T++;

			if (T > 150) {
				break;
			}
		}


		var unique = [],
			doubles = [];

		CHAN_QUEUE.forEach(function (channel, channelId) {
			var inverseChannelId = findInverseChannelByChannelId(channelId);

			if (unique.indexOf(channelId) === -1 &&
				unique.indexOf(inverseChannelId) === -1) {
				unique.push(channelId);
				doubles.push({ direct: channelId, inverse: inverseChannelId });
			}
		});

		return {
			duplex: DUPLEX_ALLOWED,
			chan_physical_links: CHAN_PHYSICAL_LINKS,

			invarianting: INVARIANTING_ARRAY,
			states: STATES,

			processorsHeader: _.chain(PROCESSOR_QUEUE.slice(0)).sortBy('number').value(),
			channelsHeader: _.chain(doubles)
				.map(function (double) {
					return {
						direct: CHAN_QUEUE[double.direct],
						inverse: CHAN_QUEUE[double.inverse]
					};
				})
				.value(),

			processors: PROCESSOR_QUEUE,
			channels: CHAN_QUEUE,
			links: LINK_QUEUE,
			tasks: TASK_QUEUE,
			matrix: JSON.stringify(SYSTEM_MATRIX, null, '\t')
		};
	};
});