Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
};

angular
.module('Census', [])
.filter('capitalize', function() {
	return function(string) {
		return string.charAt(0).toUpperCase() + string.substring(1);
	}
})
.directive('drop', function() {
	return {
		restrict: 'A',
		link: function(scope, $element, attrs) {
			var element = $element[0];
			
			element.addEventListener('dragover', function(event) {
				event.preventDefault();
				event.dataTransfer.dropEffect = 'copy';
			});
			
			element.addEventListener('drop', function(event) {
				event.preventDefault();
				Array.prototype.forEach.call(event.dataTransfer.files, function(file) {
					var callback = scope.$eval(attrs.drop);
					callback(file);
				});
			});
		}
	};
})
.controller('Controller', function($scope, $timeout) {
	$scope.maxNameCount = 20;
	$scope.selected = {
		database: null
	};
	$scope.databases = [];
	$scope.names = [];
	$scope.buttonText = 'Loading Names…';
	$scope.namesLoaded = false;
	
	$scope.generateName = function(database, pattern) {
		var name = database.randomName(pattern);
		$scope.names.unshift(name);
	};
	
	$scope.themes = [
		{ title: 'Generic', url: 'themes/generic/generic.css', rel: 'stylesheet' },
		{ title: 'Sci-Fi', url: 'themes/sci-fi/sci-fi.css', rel: 'alternate stylesheet' },
		{ title: 'Cthulhu', url: 'themes/cthulhu/cthulhu.css', rel: 'alternate stylesheet' }
	];
	
	var selectedTheme;
	Object.defineProperty($scope, 'selectedTheme', {
		get: function() {
			return selectedTheme;
		},
		set: function(theme) {
			var links = document.head.querySelectorAll('link[title][rel~="stylesheet"]');
			Array.prototype.forEach.call(links, function(link) {
				// We set disabled first for a reason: Apparently a stylesheet is not applied immediately (at least in Chrome) unless it's disabled first.
				link.disabled = true;
				if ( link.title === theme.title ) {
					link.disabled = false;
				}
			});
			selectedTheme = theme;
		}
	});
	
	window.addEventListener('load', function() {
		$scope.$apply(function() {
			$scope.selectedTheme = $scope.themes[0];
		});
	});
	
	$scope.addFile = function(file) {
		if ( file.name.match(/\.css$/i) ) {
			$scope.$apply(function() {
				var url = URL.createObjectURL(file);
				$scope.addStyle(file.name, url);
			});
		} else {
			var reader = new FileReader();
			reader.onload = function() {
				$scope.$apply(function() {
					var config =
						file.name.match(/\.ya?ml$/i)
						? jsyaml.load(reader.result.replace(/\t/g, '    '))
						: JSON.parse(reader.result);
					var database = NameDatabase.fromConfig(config);
					$scope.addDatabase(database);
				});
			};
			reader.readAsText(file);
		}
	};
	
	$scope.addStyle = function(filename, url) {
		var theme = {
			// Strip extension from filename.
			title: filename.replace(/\.[^.]*$/, ''),
			url: url,
			rel: 'alternate stylesheet'
		};
		$scope.themes.push(theme);
		// Timeout below because setting "selectedTheme" triggers DOM manipulation, and the <link> node is not in the DOM yet.
		$timeout(function() {
			$scope.selectedTheme = theme;
		});
	};

	$scope.addDatabase = function(database) {
		$scope.addDatabaseSilently(database);
		$scope.selected.database = database;
	};

	$scope.addDatabaseSilently = function(database) {
		$scope.databases.push(database);
		if ( !$scope.namesLoaded ) {
			$scope.namesLoaded = true;
			$scope.buttonText = 'Generate Name';
		}
	};
	
	window.addEventListener('load', function() {
		loadDatabases();
		
		function loadDatabases() {
			var filenames = ['american.json', 'american-top-200.json'];
			filenames.forEach(function(filename) {
				var request = new XMLHttpRequest();
				request.open('GET', filename);
				request.send();
				request.addEventListener('load', function() {
					$scope.$apply(function() {
						var config = JSON.parse(request.responseText);
						var database = NameDatabase.fromConfig(config);
						$scope.addDatabaseSilently(database);
						
						// "American" should be first, followed by "American (Top 200)"
						$scope.databases.sort(function(a, b) {
							return a.title.localeCompare(b.title);
						});
						// Make sure the first one is selected.
						if ( !$scope.selected.database && filename === filenames[0] ) {
							$scope.selected.database = $scope.databases[0];
						}
					});
				});
			});
		}
	});
	
	var NameDatabase = function(title, patterns, lists) {
		this.title = title;

		this.patternNames = [];
		for ( var name in patterns ) {
			this.patternNames.push(name);
		}

		this.selected = {
			pattern: this.patternNames[0]
		};

		this.randomName = function(patternName) {
			if ( !(patternName in patterns) ) {
				throw new Error('The name list "' + title + '" has no pattern named "' + patternName + '"');
			}
			
			if ( patterns[patternName].every(isArray) ) {
				// Multiple variations.
				var variations = patterns[patternName];
			}
			else {
				// Single variation.
				var variations = [patterns[patternName]];
			}
			
			var pattern = variations.random();
			var nameTokens = pattern.map(function(patternToken) {
				if ( patternToken in lists ) {
					return lists[patternToken].random();
				} else {
					return patternToken;
				}
			});
			var name = nameTokens.join('');
			
			return name;
		};
		
		function isArray(value) {
			return value instanceof Array;
		}
	};
	
	NameDatabase.fromConfig = function(config) {
		var title = config.title ? String(config.title) : 'Untitled';
		
		if ( config.pattern && config.patterns ) {
			throw new Error('A generator cannot have both a "pattern" property and a "patterns" property.');
		} else if ( config.pattern ) {
			config.patterns = {
				'Default': config.pattern
			};
		}

		var patterns = {};
		for ( var patternName in config.patterns ) {
			patterns[patternName] = config.patterns[patternName];
		}
		
		var lists = {};
		for ( var listName in config.lists ) {
			lists[listName] = config.lists[listName].map(String);
		}
		
		return new NameDatabase(title, patterns, lists)
	};
});