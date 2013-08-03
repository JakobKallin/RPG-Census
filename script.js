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
					var config = JSON.parse(reader.result);
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
		if ( !$scope.selected.database ) {
			$scope.selected.database = database;
		}
	};
	
	window.addEventListener('load', function() {
		var button = document.querySelector('button');
		
		loadDatabases();
		
		function loadDatabases() {
			var filename = 'stats/american.json';
			var request = new XMLHttpRequest();
			request.open('GET', filename);
			request.send();
			request.addEventListener('load', function() {
				$scope.$apply(function() {
					var config = JSON.parse(request.responseText);
					var database = NameDatabase.fromConfig(config);
					$scope.addDatabaseSilently(database);
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
			var pattern = patterns[patternName];
			if ( !(patternName in patterns) ) {
				throw new Error('The name list "' + title + '" has no pattern named "' + patternName + '"');
			}
			
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
	};
	
	NameDatabase.fromConfig = function(config) {
		var title = String(config.title);
		
		var patterns = {};
		for ( var patternName in config.patterns ) {
			patterns[patternName] = config.patterns[patternName].map(String);
		}
		
		var lists = {};
		for ( var listName in config.lists ) {
			lists[listName] = config.lists[listName].map(String);
		}
		
		return new NameDatabase(title, patterns, lists)
	};
});