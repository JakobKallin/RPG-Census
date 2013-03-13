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
			
			element.addEventListener('drop', function(event) {
				event.preventDefault();
				Array.prototype.forEach.call(event.dataTransfer.files, function(file) {
					var reader = new FileReader();
					reader.readAsText(file);
					reader.onload = function() {
						var list = JSON.parse(reader.result);
						scope.$apply(function() {
							scope.addList(list);
						});
					};
				})
			})
			
			element.addEventListener('dragover', function(event) {
				event.preventDefault();
				event.dataTransfer.dropEffect = 'copy';
			});
		}
	};
})
.controller('Controller', function($scope) {
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
			var fileName = 'stats/american.json';
			var request = new XMLHttpRequest();
			request.open('GET', fileName);
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