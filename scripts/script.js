Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
};

var Controller = function($scope) {
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
		{ title: 'Generic', path: 'themes/generic/generic.css' },
		{ title: 'Sci-Fi', path: 'themes/sci-fi/sci-fi.css' },
		{ title: 'Cthulhu', path: 'themes/cthulhu/cthulhu.css' }
	];
	
	$scope.selectTheme = function(data, event) {
		var path = event.target.value;
		this.activateStylesheet(path);
	};
	
	$scope.activateStylesheet = function(path) {
		var links = document.head.querySelectorAll('link[title][rel~="stylesheet"]');
		for ( var i = 0; i < links.length; i++ ) {
			links[i].disabled = true;
		}
		var activeLink = document.head.querySelector('link[href="' + path + '"]');
		activeLink.disabled = false;
	};
	
	window.addEventListener('load', function() {
		var listNames = ['male', 'female', 'last'];
		var button = document.querySelector('button');
		
		loadLists();
		activateHotkeys();
		
		function loadLists() {
			var fileName = 'stats/american.json';
			var request = new XMLHttpRequest();
			request.open('GET', fileName);
			request.send();
			request.addEventListener('load', function() {
				$scope.$apply(function() {
					var list = JSON.parse(request.responseText);
					$scope.lists.push(list);
					$scope.selectedList = list;
					$scope.namesLoaded = true;
					$scope.buttonText = 'Generate Name';
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
};