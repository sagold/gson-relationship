var expect = require("chai").expect;
var copy = require("../../lib/copy");
var Relation = require("../../lib/Relationship");


describe("Relationship", () => {

    var data,
        relation;


    describe("", () => {

        beforeEach(() => {
            data = {
                person: {
                    hans: { fpk: "square" },
                    alfred: { fpk: "large" }
                },
                nose: {
                    square: { id: "square" },
                    large: { id: "large" }
                }
            };
            // create relationship
            relation = new Relation(data, "person has_one:nose as:nose on:fpk");
        });

        it("should load all tupels", () => {
            relation.loadAll();

            expect(data.person.hans.nose.id).to.eq("square");
            expect(data.person.alfred.nose.id).to.eq("large");
        });

        it("should unload all tupels", () => {
            var orig = copy(data);
            relation.loadAll();
            relation.unloadAll();

            expect(orig).to.deep.eq(data);
        });

        it("should update all tupels", () => {
            data.person.hans.nose = data.nose.large;
            data.person.alfred.nose = data.nose.square;
            relation.updateAll();

            expect(data.person.hans.fpk).to.eq("large");
            expect(data.person.alfred.fpk).to.eq("square");
        });

        it("should create missing models", () => {
            new Relation(data, "person has_many:noses as:fpk through:persons_noses", true);

            expect(data.noses).to.be.an.instanceOf(Object);
            expect(data.persons_noses).to.be.an.instanceOf(Object);
        });
    });


    // !has one
    describe("has_one", () => {

        beforeEach(() => {
            // create new data object
            data = {
                person: [
                    {
                        id: "alfred",
                        face: 0
                    }
                ],
                nose: [
                    { id: "large" },
                    { id: "big" }
                ]
            };
            // create relationship
            relation = new Relation(data, "person has_one:nose on:face as:nose");
        });

        it("should load array models", () => {
            relation.load(0);

            expect(data.person[0].nose.id).to.eq("large");
        });

        it("should unload array models", () => {
            relation.load(0);
            relation.unload(0);

            expect(data.person[0].face).to.eq(0);
        });

        it("should update array models", () => {
            data.person[0].nose = { id: "square" };
            relation.update(0);

            expect(data.nose[2].id).to.eq("square");
            expect(data.person[0].face).to.eq(2);
        });
    });


    // !has many
    describe("has_many", () => {

        beforeEach(() => {
            data = {
                person: [
                    { id: "alfred" }
                ],
                ears: [
                    { id: "big" },
                    { id: "large" },
                    { id: "square" }
                ],
                person_ears: {
                    "0": [1, 0]
                }
            };
            // create relationship
            relation = new Relation(data, "person has_many:ears as:ears through:person_ears");
        });

        it("should load array models", () => {
            relation.load(0);

            expect(data.person[0].ears.length).to.eq(2);
            expect(data.person[0].ears[1].id).to.eq("big");
        });

        it("should unload array models", () => {
            relation.load(0);
            relation.unload(0);

            expect(data.person[0].ears).to.undefined;
            expect(data.person_ears[0].length).to.eq(2);
        });

        it("should update array models", () => {
            data.person[0].ears = [{ id: "dumbo" }];
            relation.update(0);

            expect(data.ears[3].id).to.eq("dumbo");
            expect(data.person_ears[0][0]).to.eq(3);
            expect(data.person_ears[0].length).to.eq(1);
        });
    });
});
