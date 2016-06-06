"use strict";

var backendAddress = "http://localhost:8000/";

var collection = function(url) {
	var self = ko.observableArray();

	self.get = function() {
		self.removeAll();
		$.ajax({
			url: backendAddress + url,
			dataType: "json",
			success: function(data) {
				data.forEach(function (element, index, array) {
					self.push(ko.mapping.fromJS(element));
				});
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
			url: backendAddress + url + "/" + this.index(),
			method: "DELETE"
		});
		self.remove(this);
	}

	return self;
}

function viewModel() {
	var self = this;

	self.students = new collection("students");
	self.students.get();
	self.courses = new collection("courses");
	self.courses.get();
	self.grades = undefined;
}

$(document).ready(function() {
	var model = new viewModel();
	ko.applyBindings(model);
});
