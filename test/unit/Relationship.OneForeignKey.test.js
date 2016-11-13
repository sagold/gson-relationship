"use strict";


var expect = require("chai").expect;
var sinon = require("sinon");
var o = require("@sagold/json-conform");
var copy = require("../../lib/copy");
var Relation = require("../../lib/Relationship");


// !"has_one:foreign_key"
describe("has_one:foreign_key", function () {

	var data, relation;


	beforeEach(function () {
		// create new data object
		data = {
			"person": {
				"alfred": {
					"id": "alfred",
					"face": "large"
				}
			},
			"nose": {
				"large": {"id": "large"},
				"big": {"id": "big"}
			}
		};
		// and setup relationship
		relation = new Relation(data, "person has_one:nose on:face");
	});

	it("should return type has_one:foreign_key", function () {
		expect(relation.id).to.eq("has_one:foreign_key");
	});

	// load

	it("should add linked tupel to parent tupel", function () {
		relation.load("alfred");

		expect(data.person.alfred.face.id).to.eq("large");
	});

	it("should replace loaded tupel", function () {
		relation.load("alfred");
		data.person.alfred.face = "big";
		relation.load("alfred");

		expect(data.person.alfred.face.id).to.eq("big");
	});

	// update

	it("should add new tupel to relatedModel", function () {
		var id;
		data.person.alfred.face = {"id": "broad"};
		relation.update("alfred");
		id = o.keyOf(data.nose, data.person.alfred.face);

		expect(id).to.not.be.null;
		expect(data.nose[id].id).to.eq("broad");
	});

	// unload

	it("should reverse load", function () {
		var orig = copy(data);
		relation.load("alfred");
		relation.unload("alfred");

		expect(orig.person.alfred).to.deep.eq(data.person.alfred);
	});

	// link

	it("should add tupel on the given model", function () {
		var tupel = {id: "new tupel"};
		relation.link("alfred", tupel);

		expect(data.person.alfred.face).to.eq(tupel);
	});

	it("should create model if it does not exist", function () {
		var tupel = {id: "new tupel"};
		relation.link("alfons", tupel);

		expect(data.person.alfons.face).to.eq(tupel);
	});

	it("should call update on link", function () {
		var update = sinon.spy(relation, "update");
		relation.link("alfred", true);

		expect(update.called).to.be.true;
	});

	// unlink

	it("should remove related tupel", function () {
		relation.unlink("alfred");

		expect(data.person.alfred.face).to.be.undefined;
	});

	it("should call update on unlink", function () {
		var update = sinon.spy(relation, "update");
		relation.unlink("alfred");

		expect(update.called).to.be.true;
	});

	it("should unlink only given tupel if passed", function () {
		relation.unlink("alfred", "small");

		expect(data.person.alfred.face).to.eq("large");
	});
});