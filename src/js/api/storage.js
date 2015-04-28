define([], function () {

	return {
		types: ['task', 'system'],

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
			var data = {};

			this.types.forEach(function (type) {
				data[type] = this.load(type);
			}, this);

			return data;
		},

		saveAll: function (data) {
			this.types.forEach(function (type) {
				this.save(data[type], type);
			}, this);
		}
	};
});