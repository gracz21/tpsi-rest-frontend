"use strict";

var backendAddress = "http://localhost:8000/";

var collection = function(url, idAttr) {
	var self = ko.observableArray();
	var baseUrl = backendAddress + url;

	self.get = function() {
		self.removeAll();
		$.ajax({
			url: baseUrl,
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
			url: baseUrl,
			contentType: "json",
			method: "POST"
		});
	}

	self.update = function() {
		var _this = this;
		var updateUrl = baseUrl + "/" + this[idAttr]();
		$.ajax({
			url: updateUrl,
			dataType: "json",
			contentType: "application/json",
			data: ko.mapping.toJSON(_this, { ignore: ["link"] }),
			method: "PUT"
		});
	}

	self.delete = function() {
		var _this = this;
		var delUrl = baseUrl + "/" + this[idAttr]();
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
