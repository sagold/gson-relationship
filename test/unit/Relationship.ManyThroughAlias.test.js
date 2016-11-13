"use strict";

var expect = require("chai").expect,
	sinon = require("sinon");

var copy = require("../../lib/copy");
var o = require("@sagold/json-conform");
var Relation = require("../../lib/Relationship");


describe("has_many:foreign_key:alias", function () {

	var data, relation;


	beforeEach(function () {
		data = {
			"person": {
				"alfred": {
					"id": "alfred"
				}
			},
			"ears": {
				"big": {
					"id": "big"
				},
				"large": {
					"id": "large"
				},
				"square": {
					"id": "square"
				}
			},
			"person_ears": {
				"alfred": ["large", "big"]
			}
		};
		// create relationship
		relation = new Relation(data, "person has_many:ears as:ears through:person_ears");
	});

	it("should return type has_many:through:alias", function () {
		expect(relation.id).to.eq("has_many:through:alias");
	});

	// load

	it("should link all tupels speicified in pivot on alias", function () {
		relation.load("alfred");

		expect(data.person.alfred.ears.length).to.eq(2);
		expect(data.person.alfred.ears[1].id).to.eq("big");
	});

	it("should keep linked tupels intact", function () {
		relation.load("alfred");
		relation.load("alfred");

		expect(data.person.alfred.ears.length).to.eq(2);
		expect(data.person.alfred.ears[1].id).to.eq("big");
	});

	it("should replace new tupel", function () {
		relation.load("alfred");
		data.person_ears.alfred = ["square"];
		relation.load("alfred");

		expect(data.person.alfred.ears.length).to.eq(1);
		expect(data.person.alfred.ears[0].id).to.eq("square");
	});

	// update

	it("should add new tupel to related model", function () {
		var id, tupel = {"id": "round"};
		data.person.alfred.ears = [tupel];
		relation.update("alfred");
		id = o.keyOf(data.ears, tupel);

		expect(id).to.not.be.null;
		expect(data.ears[id].id).to.eq("round");
	});

	it("should update pivot", function () {
		var id, tupel = {"id": "round"};
		data.person.alfred.ears = [tupel];
		relation.update("alfred");
		id = o.keyOf(data.ears, tupel);

		expect(id).to.not.be.null;
		expect(data.person_ears.alfred.length).to.eq(1);
		expect(data.person_ears.alfred[0]).to.eq(id);
	});

	// unload

	it("should reverse load", function () {
		var orig = copy(data);
		relation.load("alfred");
		relation.unload("alfred");

		expect(orig).to.deep.eq(data);
	});

	it("should update pivot table on unload", function () {
		data.person.alfred.ears = [data.ears.big];
		relation.unload("alfred");

		expect(data.person_ears.alfred.length).to.eq(1);
		expect(data.person_ears.alfred[0]).to.eq("big");
	});

	// link

	it("should add tupel to relations", function () {
		var tupel = {id: "new tupel"};
		relation.link("alfred", tupel);

		expect(data.person.alfred.ears).to.contain(tupel);
	});

	it("should create missing parent tupel", function () {
		var tupel = {id: "new tupel"};
		relation.link("alfons", tupel);

		expect(data.person.alfons.ears[0]).to.eq(tupel);
	});

	it("should call update on link", function () {
		var update = sinon.spy(relation, "update");
		relation.link("alfred", true);

		expect(update.called).to.true;
	});

	// unlink

	it("should remove related tupel", function () {
		relation.loadAll();
		relation.unlink("alfred", data.ears.large);

		expect(data.person.alfred.ears).to.not.contain(data.ears.large);
	});

	it("should call update after removing tupel", function () {
		var update = sinon.spy(relation, "update");
		relation.loadAll();
		relation.unlink("alfred", data.ears.large);

		expect(update.called).to.be.true;
	});
});
