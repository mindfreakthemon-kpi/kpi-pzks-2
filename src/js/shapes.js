define(['joint'], function (joint) {

	joint.shapes.ns = {};

	joint.shapes.ns.Entity = joint.dia.Element.extend({
		markup: '<g class="rotatable"><g class="scalable"><circle class="outer"/><circle class="inner"/></g><text class="title" /><text class="descr" /></g>',
		interactive: false,

		setTitle: function (text) {
			this.attr('text.title/text', text);
		},

		getTitle: function () {
			return this.attr('text.title/text');
		},

		setDescr: function (text) {
			this.attr('text.descr/text', text);
		},

		getDescr: function () {
			return this.attr('text.descr/text');
		},


		defaults: joint.util.deepSupplement({
			type: 'ns.Entity',
			size: {
				width: 100,
				height: 100
			},
			attrs: {
				'.outer': {
					fill: '#2ECC71',
					//stroke: '#27AE60',
					//'stroke-width': 5,
					r: 50
				},
				'.inner': {
					fill: '#2ECC71',
					//stroke: '#27AE60',
					//'stroke-width': 2,
					r: 50
				},
				'text.title': {
					text: '???',
					'font-family': 'Arial',
					'font-size': 16,
					ref: '.outer',
					'ref-x': .5,
					'ref-y': .3,
					'x-alignment': 'middle',
					'y-alignment': 'middle'
				},
				'text.descr': {
					text: '1',
					'font-family': 'Arial',
					'font-size': 9,
					ref: '.outer',
					'ref-x': .5,
					'ref-y': .7,
					'x-alignment': 'middle',
					'y-alignment': 'middle'
				}
			}

		}, joint.dia.Element.prototype.defaults)
	});

	joint.shapes.ns.Link = joint.dia.Link.extend({
		setLabel: function (text) {
			this.label(0, {
				attrs: {
					text: {
						text: text
					}
				}
			});
		},

		getLabel: function () {
			return this.label(0).attrs.text.text;
		},

		defaults: joint.util.deepSupplement({
			type: 'ns.Link'
		})
	});
});