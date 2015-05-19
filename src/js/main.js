require({
		baseUrl: 'js',
		paths: {
			jquery: '../lib/jquery/js/jquery.min',
			joint: '../lib/joint/js/joint.clean',
			lodash: '../lib/lodash/js/lodash.min',
			underscore: '../lib/lodash/js/lodash.min',
			jade: '../lib/jade/js/runtime',
			backbone: '../lib/backbone/js/backbone',
			geometry: '../lib-static/geometry.min',
			vectorizer: '../lib-static/vectorizer.min',
			markdown: '../lib-static/markdown',
			bootstrap: '../lib/bootstrap/js/bootstrap.min',
			cpath: '../lib-static/cpath',
			async: '../lib/async/js/async'
		},
		shim: {
			bootstrap: {
				deps: ['jquery']
			},
			backbone: {
				deps: ['underscore', 'jquery'],
				exports: 'Backbone'
			},
			joint: {
				deps: ['geometry', 'vectorizer', 'jquery', 'underscore', 'backbone'],
				exports: 'joint',
				init: function(geometry, vectorizer) {
					this.g = geometry;
					this.V = vectorizer;
				}
			},
			underscore: {
				exports: '_'
			}
		},
		deps: [
			'bootstrap',
			'functions/editor',
			'functions/adder',
			'functions/linker',
			'functions/checker',
			'functions/fs',
			'functions/generate',
			'mpp',
			'stat'
		]
	});