"use strict";

var backendAddress = "http://localhost:8000/";

var collection = function(url) {
	var self = ko.observableArray();

	self.get = function() {
		$.ajax({
			url: backendAddress + url,
			dataType: "json",
			success: function(data) {
				self = ko.mapping.fromJS(data);
			}
		});
	}

	self.save = function() {
		$.ajax({
			url: backendAddress + url,
			contentType: "json",
			method: "POST"
		});
	}

	self.update = function() {
		$.ajax({
			url: backendAddress + url,
			contentType: "json",
			method: "PUT"
		});
	}

	self.delete = function() {
		$.ajax({
			url: backendAddress + url,
			method: "DELETE"
		});
	}

	return self;
}

var viewModel = {
	students: collection("students"),
	courses: collection("courses"),
	grades: undefined
}

viewModel.students.get();
viewModel.courses.get();

$(document).ready(function() {
});
