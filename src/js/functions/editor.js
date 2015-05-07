define(['jquery', 'canvasi', 'toggles/mode', 'templates'], function ($, canvasi, mode, templates) {
	var ns = joint.shapes.ns,
		$editor = $('#editor').html(templates.editor()),
		$editorForm = $('#editor-form'),
		$clear = $('#clear'),
		$title = $('#title'),
		$papers = $('#papers'),
		$label = $('#label'),
		$descr = $('#descr');

	var editableCellView = null;

	$editor.on('click', '.close, .remove', close);
	$editor.on('click', '.remove', remove);

	$editorForm.on('submit', function (e) {
		e.preventDefault();

		var model = editableCellView.model;

		if (model instanceof ns.Entity) {
			model.setTitle($title.val());
			model.setDescr($descr.val());
		} else {
			model.setLabel($label.val());
		}
	});

	$clear.on('click', function () {
		canvasi.taskGraph.clear();
		canvasi.systemGraph.clear();
	});

	$papers.on('click', '.clear', function () {
		var $el = $(this).closest('[data-name]');

		canvasi[$el.data('name') + 'Graph'].clear();
	});

	function close() {
		$editor.removeClass('shown');
	}

	function remove() {
		editableCellView.model.remove();
	}

	function edit(cellView) {
		var model = cellView.model;

		$editor
			.addClass('shown')
			.removeClass('edit-link edit-entity');

		editableCellView = cellView;

		if (editableCellView.model instanceof ns.Entity) {
			$editor.addClass('edit-entity');
			$title.val(model.getTitle() || '');
			$descr.val(model.getDescr() || '');
		} else {
			$editor.addClass('edit-link');
			$label.val(model.getLabel() || '');
		}
	}

	canvasi.taskPaper.on('blank:pointerclick', close);

	mode.change.add(function () {
		var editMode = mode.mode === 'edit';

		canvasi.taskPaper.off('cell:pointerclick', edit);
		canvasi.systemPaper.off('cell:pointerclick', edit);

		if (editMode) {
			canvasi.taskPaper.on('cell:pointerclick', edit);
			canvasi.systemPaper.on('cell:pointerclick', edit);
		}

		close();
	});
});