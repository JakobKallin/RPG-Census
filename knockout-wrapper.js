window.addEventListener('load', function() {
	//convertDocument();
	if ( typeof viewModel !== 'undefined' ) {
		wrap(viewModel);
		ko.applyBindings(viewModel);
	}
});

function convertDocument() {
	var elements = document.getElementsByTagName('*');
	for ( var i = 0; i < elements.length; ++i ) {
		convertElement(elements[i]);
	}
}

function convertElement(element) {
	var expressions = [];
	for ( var htmlProperty in element.dataset ) {
		var property = htmlProperty.charAt(4).toLowerCase() + htmlProperty.substring(5);
		var value = element.dataset[htmlProperty];
		expressions.push(property + ': ' + value);
		delete element.dataset[htmlProperty];
	}
	
	if ( expressions.length > 0 ) {
		element.dataset.bind = expressions.join(', ');
	}
}

function wrap(object) {
	for ( var property in object ) {
		if ( typeof object.__lookupGetter__(property) === 'undefined' ) {
			wrapProperty(object, property);
		} else {
			wrapGetter(object, property);
		}
	}
}

/*
Save the original property and replace it with a getter.
When the getter is first accessed, put the old property back and then let Knockout get to work.
*/
function wrapProperty(object, property) {
	if ( object[property] instanceof Array ) {
		wrapArray(object, property);
	} else {
		wrapNonArray(object, property);
	}
}

function wrapArray(object, property) {
	var array = object[property];
	var observable = ko.observableArray(array);
	var wrapper = Object.create(array);
	object[property] = wrapper;
	
	// We do this to set up a dependency. How can it be done in a nicer way?
	wrapper.__defineGetter__('length', function() {
		return observable().length;
	});
	
	// These methods mutate the array and so need to trigger notifications.
	['pop', 'push', 'reverse', 'shift', 'splice', 'sort', 'unshift'].forEach(function(methodName) {
		var originalMethod = array[methodName];
		wrapper[methodName] = function() {
			observable.valueWillMutate();
			var result = originalMethod.apply(array, arguments);
			observable.valueHasMutated();
			
			return result;
		};
	});
}

function wrapArrayIndex(index, wrapper, observable) {
	if ( typeof wrapper.__lookupGetter__(index) === 'undefined' ) {
		wrapper.__defineGetter__(index, function() {
			return observable()[index];
		});
	}
}

function wrapNonArray(object, property) {
	var originalValue = object[property];
	object.__defineGetter__(property, function() {
		delete object[property];
		object[property] = originalValue;
		activateProperty(object, property);
		return object[property];
	});
}

function activateProperty(object, property) {
	var observable = ko.observable(object[property]);
	object.__defineGetter__(property, function() {
		return observable();
	});
	object.__defineSetter__(property, function(value) {
		observable(value);
	});
}

function wrapGetter(object, property) {
	var originalGetter = object.__lookupGetter__(property);
	object.__defineGetter__(property, function() {
		delete object[property];
		object.__defineGetter__(property, originalGetter);
		activateGetter(object, property);
		return object[property];
	});
}

function activateGetter(object, property) {
	var getter = object.__lookupGetter__(property);
	var computed = ko.computed(getter, object);
	object.__defineGetter__(property, function() {
		return computed();
	});
}