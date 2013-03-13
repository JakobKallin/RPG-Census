var viewModel = {
	maxNameCount: 20,
	gender: ko.observable('male'),
	lists: {},
	names: ko.observableArray(),
	buttonText: ko.observable('Loading Names…'),
	namesLoaded: ko.observable(false),
	generateName: function() {
		var first = this.lists['American'][this.gender()].random();
		var last = this.lists['American'].family.random();
		var full = first + ' ' + last;
		
		this.names.unshift(full);
	},
	themes: [
		{ title: 'Generic', path: 'themes/generic/generic.css' },
		{ title: 'Sci-Fi', path: 'themes/sci-fi/sci-fi.css' },
		{ title: 'Cthulhu', path: 'themes/cthulhu/cthulhu.css' }
	],
	selectTheme: function(data, event) {
		var path = event.target.value;
		this.activateStylesheet(path);
	},
	activateStylesheet: function(path) {
		var links = document.head.querySelectorAll('link[title][rel~="stylesheet"]');
		for ( var i = 0; i < links.length; i++ ) {
			links[i].disabled = true;
		}
		var activeLink = document.head.querySelector('link[href="' + path + '"]');
		activeLink.disabled = false;
	}
};

window.addEventListener('load', function() {
	ko.applyBindings(viewModel);
});

Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
};

window.addEventListener('load', function() {
	var listNames = ['male', 'female', 'last'];
	var button = document.getElementsByTagName('button')[0];
	
	loadLists();
	activateHotkeys();
	
	function loadLists() {
		var fileName = 'stats/american.json';
		var request = new XMLHttpRequest();
		request.open('GET', fileName);
		request.send();
		request.addEventListener('load', function() {
			var list = JSON.parse(request.responseText);
			viewModel.lists[list.group] = list;
			viewModel.namesLoaded(true);
			viewModel.buttonText('Generate Name');
		});
	}
	
	function activateHotkeys() {
		var hotkeys = {
			'M': 'male',
			'F': 'female'
		};
		
		document.addEventListener('keydown', function(event) {
			var key = String.fromCharCode(event.keyCode);
			if ( key in hotkeys ) {
				viewModel.gender(hotkeys[key]);
				button.click();
			}
		});
	}
});