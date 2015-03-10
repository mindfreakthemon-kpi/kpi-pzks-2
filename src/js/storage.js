define([], function () {

	return {
		save: function saveStorage(json, type) {
			localStorage.setItem('graph.' + type, JSON.stringify(json));
		},

		load: function loadStorage(type) {
			var string = localStorage.getItem('graph.' + type);

			try {
				return JSON.parse(string);
			} catch (e) {
				return null;
			}
		},

		loadAll: function () {
			return {
				task: this.load('task'),
				system: this.load('system')
			};
		},

		saveAll: function (data) {
			this.save(data.task, 'task');
			this.save(data.system, 'system');
		}
	};
});