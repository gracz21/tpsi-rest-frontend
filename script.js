"use strict";

var backendAddress = "http://localhost:8000/";

var collection = function(url, idAttr) {
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
		var _this = this;
		var delUrl = backendAddress + url + "/" + this[idAttr]();
		$.ajax({
			url: delUrl,
			method: "DELETE",
			success: function(data) {
				self.remove(_this);
			}
		});
	}

	return self;
}

function viewModel() {
	this.students = new collection("students", "index");
	this.students.get();
	this.courses = new collection("courses", "courseId");
	this.courses.get();
	this.grades = undefined;
}

$(document).ready(function() {
	var model = new viewModel();
	ko.applyBindings(model);
});
