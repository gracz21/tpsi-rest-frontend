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
					var object = ko.mapping.fromJS(element);
					self.push(object);
					ko.computed(function() {
    				return ko.toJSON(object);
					}).subscribe(function() {
						self.update(object);
					});
				});
			}
		});
	}

	self.save = function() {
		var _this = this;
		$.ajax({
			url: baseUrl,
			contentType: "application/json",
			data: ko.mapping.toJSON(_this),
			method: "POST"
		});
	}

	self.update = function(object) {
		var updateUrl = baseUrl + "/" + object[idAttr]();
		$.ajax({
			url: updateUrl,
			dataType: "json",
			contentType: "application/json",
			data: ko.mapping.toJSON(object, { ignore: ["link"] }),
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

	self.subscribe(function(newValue) {
		alert("NEW");
	});

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
