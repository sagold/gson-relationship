var expect = require("chai").expect;
var sinon = require("sinon");
var o = require("@sagold/json-conform");
var copy = require("../../lib/copy");
var Relation = require("../../lib/Relationship");


describe("has_one:through:alias", () => {

    var data,
        relation;


    beforeEach(() => {
        // create new data object
        data = {
            person: {
                alfred: {
                    id: "alfred"
                }
            },
            nose: {
                big: {
                    id: "big"
                },
                large: {
                    id: "large"
                }
            },
            person_nose: {
                alfred: "large"
            }
        };
        // create relationship
        relation = new Relation(data, "person has_one:nose through:person_nose as:nose");
    });

    it("should return type has_one:through:alias", () => {
        expect(relation.id).to.eq("has_one:through:alias");
    });

    // load

    it("should add linked tupel in pivot to parent tupel", () => {
        relation.load("alfred");

        expect(data.person.alfred.nose.id).to.eq("large");
    });

    it("should keep linked tupel intact", () => {
        relation.load("alfred");
        relation.load("alfred");

        expect(data.person.alfred.nose.id).to.eq("large");
    });

    it("should replace loaded tupel", () => {
        relation.load("alfred");
        data.person_nose.alfred = "big";
        relation.load("alfred");

        expect(data.person.alfred.nose.id).to.eq("big");
    });

    // update

    it("should add new tupel to related model", () => {
        var id,
            tupel = { id: "broad" };
        data.person.alfred.nose = tupel;
        relation.update("alfred");
        id = o.keyOf(data.nose, tupel);

        expect(id).to.not.be.null;
        expect(data.nose[id].id).to.eq("broad");
    });

    it("should update pivot", () => {
        var id,
            tupel = { id: "broad" };
        data.person.alfred.nose = tupel;
        relation.update("alfred");
        id = o.keyOf(data.nose, tupel);

        expect(id).to.not.be.null;
        expect(data.person_nose.alfred).to.eq(id);
    });

    // unload

    it("should reverse load", () => {
        var orig = copy(data);
        var relation = new Relation(data, "person has_one:nose through:person_nose as:nose");
        relation.load("alfred");
        relation.unload("alfred");

        expect(orig).to.deep.eq(data);
    });

    it("should update pivot table on unload", () => {
        var relation = new Relation(data, "person has_one:nose through:person_nose as:nose");
        data.person.alfred.nose = data.nose.big;
        relation.unload("alfred");

        expect(data.person_nose.alfred).to.eq("big");
    });

    // link

    it("should add tupel on the given model", () => {
        var tupel = { id: "new tupel" };
        relation.link("alfred", tupel);

        expect(data.person.alfred.nose).to.eq(tupel);
    });

    it("should create model if it does not exist", () => {
        var tupel = { id: "new tupel" };
        relation.link("alfons", tupel);

        expect(data.person.alfons.nose).to.eq(tupel);
    });

    it("should call update on link", () => {
        var update = sinon.spy(relation, "update");
        relation.link("alfred", true);

        expect(update.called).to.be.true;
    });

    // unlink

    it("should remove related tupel", () => {
        relation.unlink("alfred");

        expect(data.person.alfred.nose).to.be.undefined;
    });

    it("should call update on remove", () => {
        var update = sinon.spy(relation, "update");
        relation.unlink("alfred");

        expect(update.called).to.be.true;
    });

    it("should unlink only given tupel if passed", () => {
        relation.loadAll();
        relation.unlink("alfred", data.nose.big);

        expect(data.person.alfred.nose).to.eq(data.nose.large);
    });
});
