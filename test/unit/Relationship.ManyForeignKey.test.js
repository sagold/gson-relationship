var expect = require("chai").expect,
    sinon = require("sinon");

var copy = require("../../lib/copy");
var o = require("@sagold/json-conform");
var Relation = require("../../lib/Relationship");


describe("has_many:foreign_key", () => {

    var data,
        relation;

    beforeEach(() => {
        data = {
            person: {
                alfred: {
                    id: "alfred",
                    ears: ["large", "big"]
                }
            },
            ears: {
                big: {
                    id: "big"
                },
                large: {
                    id: "large"
                },
                broad: {
                    id: "broad"
                }
            }
        };
        // create relationship
        relation = new Relation(data, "person has_many:ears on:ears");
    });

    it("should return type has_many:foreign_key", () => {
        expect(relation.id).to.eq("has_many:foreign_key");
    });

    // load

    it("should replace all keys at foreign_key by related tupels", () => {
        relation.load("alfred");

        expect(data.person.alfred.ears.length).to.eq(2);
        expect(data.person.alfred.ears[1].id).to.eq("big");
    });

    it("should keep linked tupels intact", () => {
        relation.load("alfred");
        relation.load("alfred");

        expect(data.person.alfred.ears.length).to.eq(2);
        expect(data.person.alfred.ears[1].id).to.eq("big");
    });

    it("should update linked tupels", () => {
        relation.load("alfred");
        data.person.alfred.ears[0] = "broad";
        relation.load("alfred");

        expect(data.person.alfred.ears.length).to.eq(2);
        expect(data.person.alfred.ears[0].id).to.eq("broad");
    });

    // update

    it("should add new tupel to related model", () => {
        var id,
            tupel = { id: "square" };
        data.person.alfred.ears[0] = tupel;
        relation.update("alfred");
        id = o.keyOf(data.ears, tupel);

        expect(id).to.not.be.null;
        expect(data.ears[id].id).to.eq("square");
    });

    it("should not modify foreign keys", () => {
        var id,
            tupel = { id: "square" };
        data.person.alfred.ears[0] = tupel;
        relation.update("alfred");

        expect(data.person.alfred.ears[0]).to.eq(tupel);
        expect(data.person.alfred.ears[1]).to.eq("big");
    });

    // unload

    it("should reverse load", () => {
        var orig = copy(data);
        relation.load("alfred");
        relation.unload("alfred");

        expect(orig).to.deep.eq(data);
    });

    it("should update foreign keys on unload", () => {
        data.person.alfred.ears[0] = data.ears.broad;
        relation.unload("alfred");

        expect(data.person.alfred.ears.length).to.eq(2);
        expect(data.person.alfred.ears[0]).to.eq("broad");
        expect(data.person.alfred.ears[1]).to.eq("big");
    });

    // link

    it("should add tupel to relations", () => {
        var tupel = { id: "new tupel" };
        relation.link("alfred", tupel);

        expect(data.person.alfred.ears.pop()).to.eq(tupel);
    });

    it("should create missing parent tupel", () => {
        var tupel = { id: "new tupel" };
        relation.link("alfons", tupel);

        expect(data.person.alfons.ears[0]).to.eq(tupel);
    });

    it("should call update on link", () => {
        var update = sinon.spy(relation, "update");
        relation.link("alfons", true);

        expect(update.called).to.true;
    });

    // unlink

    it("should remove related tupel", () => {
        relation.unlink("alfred", "large");

        expect(data.person.alfred.ears).to.not.contain("large");
    });

    it("should call update after removing tupel", () => {
        var update = sinon.spy(relation, "update");
        relation.unlink("alfred", "large");

        expect(update.called).to.be.true;
    });
});
