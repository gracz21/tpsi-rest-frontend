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
				data.forEach(function(element, index, array) {
					var object = ko.mapping.fromJS(element);

					self.push(object);

					ko.computed(function() {
    				return ko.toJSON(object);
					}).subscribe(function() {
						self.updateRequest(object);
					});
				});

				self.subscribe(function(changes) {
					changes.forEach(function(change) {
						if(change.status == 'added') {
							self.saveRequest(change.value);
						}
						if(change.status == 'deleted') {
							self.deleteRequest(change.value);
						}
					});
				}, null, "arrayChange");
			}
		});
	}

	self.saveRequest = function(object) {
		$.ajax({
			url: baseUrl,
			dataType: "json",
			contentType: "application/json",
			data: ko.mapping.toJSON(object),
			method: "POST",
			success: function(data) {
				var response = ko.mapping.fromJS(data);
				object.index(response.index());
			}
		});
	}

	self.updateRequest = function(object) {
		var updateUrl = baseUrl + "/" + object[idAttr]();
		$.ajax({
			url: updateUrl,
			dataType: "json",
			contentType: "application/json",
			data: ko.mapping.toJSON(object, { ignore: ["link"] }),
			method: "PUT"
		});
	}

	self.deleteRequest = function(object) {
		var delUrl = baseUrl + "/" + object[idAttr]();
		$.ajax({
			url: delUrl,
			method: "DELETE"
		});
	}

	self.add = function(form) {
		var data = {};
		$(form).serializeArray().map(function(x) {
			data[x.name] = x.value;
		});
		self.push(ko.mapping.fromJS(data));
		$(form).each(function() {
			this.reset();
		});
	}

	self.delete = function() {
		self.remove(this);
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
