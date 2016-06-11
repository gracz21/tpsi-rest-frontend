"use strict";

var backendAddress = "http://localhost:8000/";

var collection = function(url, idAttr) {
	var self = ko.observableArray();

	self.url = url;
	self.postUrl = self.url;

	self.get = function(query) {
		var url = self.url;

		if(query) {
			url = url + query;
		}
		$.ajax({
			url: url,
			dataType: "json",
			success: function(data) {
				if(self.sub) {
					self.sub.dispose();
				}
				self.removeAll();
				data.forEach(function(element, index, array) {
					var object = ko.mapping.fromJS(element, { ignore: ["link"] });
					object.links = [];

					if($.isArray(element.link)) {
						element.link.forEach(function(link) {
							object.links[link.params.rel] = link.href;
						});
					} else {
						object.links[element.link.params.rel] = element.link.href;
					}

					self.push(object);

					ko.computed(function() {
						return ko.toJSON(object);
					}).subscribe(function() {
						self.updateRequest(object);
					});
				});

				self.sub = self.subscribe(function(changes) {
					changes.forEach(function(change) {
						if(change.status === 'added') {
							self.saveRequest(change.value);
						}
						if(change.status === 'deleted') {
							self.deleteRequest(change.value);
						}
					});
				}, null, "arrayChange");
			}
		});
	}

	self.saveRequest = function(object) {
		$.ajax({
			url: self.postUrl,
			dataType: "json",
			contentType: "application/json",
			data: ko.mapping.toJSON(object),
			method: "POST",
			success: function(data) {
				var response = ko.mapping.fromJS(data);
				object[idAttr](response[idAttr]());

				object.links = [];

				if($.isArray(data.link)) {
					data.link.forEach(function(link) {
						object.links[link.params.rel] = link.href;
					});
				} else {
					object.links[data.link.params.rel] = data.link.href;
				}

				ko.computed(function() {
					return ko.toJSON(object);
				}).subscribe(function() {
					self.updateRequest(object);
				});
			}
		});
	}

	self.updateRequest = function(object) {
		$.ajax({
			url: object.links['self'],
			dataType: "json",
			contentType: "application/json",
			data: ko.mapping.toJSON(object, { ignore: ["links"] }),
			method: "PUT"
		});
	}

	self.deleteRequest = function(object) {
		$.ajax({
			url: object.links['self'],
			method: "DELETE"
		});
	}

	self.add = function(form) {
		var data = {};
		$(form).serializeArray().map(function(x) {
			data[x.name] = x.value;
		});
		data[idAttr] = null;
		self.push(ko.mapping.fromJS(data));
		$(form).each(function() {
			this.reset();
		});
	}

	self.delete = function() {
		self.remove(this);
	}

	self.parseQuery = function() {
		self.get('?' + $.param(ko.mapping.toJS(self.queryParams)));
	}

	return self;
}

function viewModel() {
	var self = this;

	self.students = new collection(backendAddress + "students", "index");
	self.students.getGrades = function() {
		window.location = "#grades";
		self.grades.selectedStudent(this.index());
		self.grades.selectedCourse(null);
		self.grades.isCourseEnable(true);
		self.grades.isStudentEnable(false);
		self.grades.url = backendAddress + "students/" + this.index() + "/grades";
		self.grades.get();
	}
	self.students.queryParams = {
		firstNameQuery: ko.observable(),
		lastNameQuery: ko.observable(),
		dateOfBirthQuery: ko.observable()
	}
	Object.keys(self.students.queryParams).forEach(function(key) {
		self.students.queryParams[key].subscribe(function() {
			self.students.parseQuery();
		});
	});
	self.students.get();

	self.courses = new collection(backendAddress + "courses", "courseId");
	self.courses.getGrades = function() {
		window.location = "#grades";
		self.grades.selectedStudent(null);
		self.grades.selectedCourse(this.courseId());
		self.grades.isCourseEnable(false);
		self.grades.isStudentEnable(true);
		self.grades.url = backendAddress + "courses/" + this.courseId() + "/grades";
		self.grades.get();
	}
	self.courses.queryParams = {
		nameQuery: ko.observable(),
		leaderQuery: ko.observable()
	}
	Object.keys(self.courses.queryParams).forEach(function(key) {
		self.courses.queryParams[key].subscribe(function() {
			self.courses.parseQuery();
		});
	});
	self.courses.get();

	self.grades = new collection(backendAddress + "grades", "id");
	self.grades.selectedCourse = ko.observable();
	self.grades.selectedStudent = ko.observable();
	self.grades.isCourseEnable = ko.observable(true);
	self.grades.isStudentEnable = ko.observable(true);

	self.grades.add = function(form) {
		self.grades.postUrl = backendAddress + 'students/' + self.grades.selectedStudent() + '/courses/' + self.grades.selectedCourse() + '/grades';
		var data = {};
		$(form).serializeArray().map(function(x) {
			data[x.name] = x.value;
		});
		data.courseId = self.grades.selectedCourse();
		data.student = ko.utils.arrayFirst(self.students(), function(student) {
			if(student.index() === self.grades.selectedStudent()) {
				return ko.mapping.toJS(student);
			}
		});
		data.id = null;
		self.grades.push(ko.mapping.fromJS(data));
		$(form).each(function() {
			this.reset();
		});
	}
  self.grades.queryParams = {
    noteQuery: ko.observable(),
    dateQuery: ko.observable()
  }
  Object.keys(self.grades.queryParams).forEach(function(key) {
		self.grades.queryParams[key].subscribe(function() {
			self.grades.parseQuery();
		});
	});
}

var model = new viewModel();

$(document).ready(function() {
	ko.applyBindings(model);
});
