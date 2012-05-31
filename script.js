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