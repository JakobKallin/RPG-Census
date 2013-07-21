Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
};

angular
.module('Census', [])
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
	$scope.gender = 'male';
	$scope.selectedList = null;
	$scope.lists = [];
	$scope.names = [];
	$scope.buttonText = 'Loading Names…';
	$scope.namesLoaded = false;
	
	$scope.generateName = function() {
		var first = $scope.selectedList[$scope.gender].random();
		var last = $scope.selectedList.family.random();
		var full = first + ' ' + last;
		
		$scope.names.unshift(full);
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
					var list = JSON.parse(reader.result);
					$scope.addList(list);
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
	
	$scope.addList = function(list) {
		$scope.lists.push(list);
		$scope.selectedList = list;
		$scope.namesLoaded = true;
		$scope.buttonText = 'Generate Name';
	};
	
	window.addEventListener('load', function() {
		var listNames = ['male', 'female', 'last'];
		var button = document.querySelector('button');
		
		loadLists();
		activateHotkeys();
		
		function loadLists() {
			var filename = 'stats/american.json';
			var request = new XMLHttpRequest();
			request.open('GET', filename);
			request.send();
			request.addEventListener('load', function() {
				$scope.$apply(function() {
					var list = JSON.parse(request.responseText);
					$scope.addList(list);
				});
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
					$scope.gender = hotkeys[key];
					button.click();
				}
			});
		}
	});
});