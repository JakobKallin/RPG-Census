var viewModel = {
	maxNameCount: 20,
	gender: 'male',
	lists: {},
	names: [],
	generateName: function() {
		var first = this.lists[this.gender].random();
		var last = this.lists['last'].random();
		var full = first + ' ' + last;
		
		this.names.unshift(full);
	},
	themes: [
		{title: 'Generic', path: 'generic.css'},
		{title: 'Sci-Fi', path: 'sci-fi.css'},
		{title: 'Cthulhu', path: 'cthulhu.css'}
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

Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
};

window.addEventListener('load', function() {
	loadLists();
	activateHotkeys();
	
	function loadLists() {
		var listNames = ['male', 'female', 'last'];
		listNames.forEach(function(listName) {
			var fileName = listName + '.csv';
			jQuery.get(fileName, function(csv) { addList(listName, csv); }, 'text');
		});
	}
	
	function addList(name, csv) {
		var list = parseList(csv);
		viewModel.lists[name] = list;
	}
	
	function parseList(csv) {
		return (
			csv.split(/\r?\n/)
			.filter(function(line) { return line.length > 0; })
			.map(function(line) { return line.replace(/,.*$/, ''); })
		);
	}
	
	function activateHotkeys() {
		var hotkeys = {
			'M': 'male',
			'F': 'female'
		};
		
		document.addEventListener('keydown', function(event) {
			var key = String.fromCharCode(event.keyCode);
			if ( key in hotkeys ) {
				viewModel.gender = hotkeys[key];
				viewModel.generateName();
			}
		});
	}
});