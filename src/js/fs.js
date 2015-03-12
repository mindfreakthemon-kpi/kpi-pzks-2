define(['jquery', 'canvasi', 'toggles/type', 'storage'], function ($, canvasi, type, storage) {
	var $save = $('#save'),
		$load = $('#load');

	$save.on('click', function () {
		var json = storage.loadAll(),
			string = JSON.stringify(json),
			a = document.createElement('a');

		a.download = 'file.json';
		a.href = 'data:text/json;base64,' + btoa(string);

		a.dispatchEvent(new MouseEvent('click'));
	});

	$load.on('change', function (e) {
		var file = e.target.files[0];

		if (!file) {
			return;
		}

		var reader = new FileReader();

		reader.onload = function () {
			try {
				var json = JSON.parse(reader.result);

				storage.saveAll(json);

				canvasi.graph.fromJSON(json[type.mode]);

			} catch (e) {
				alert('Could not load from file');
			}

			e.target.value = '';
		};

		reader.readAsText(file);
	});
});