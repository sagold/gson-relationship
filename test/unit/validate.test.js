var expect = require("chai").expect;
var relation = require("../../lib");


describe("validate", () => {

    it("should return false if definition is empty", () => {

        expect(relation.validate()).to.be.false;
    });

    it("should return false for invalid relationship", () => {
        var defRelation = {
            model: "#/model",
            references: "#/relatedModel"
        };

        expect(relation.validate(defRelation)).to.be.false;
    });

    it("should return true for valid relationship", () => {
        var defRelation = {
            model: "#/model",
            references: "#/relatedModel",
            foreign_key: "related_pk"
        };

        expect(relation.validate(defRelation)).to.be.true;
    });

    it("should return true for valid through relationship", () => {
        var defRelation = {
            model: "#/model",
            references: "#/relatedModel",
            through: "model_relatedModel",
            alias: "related"
        };

        expect(relation.validate(defRelation)).to.be.true;
    });
});


describe("validate with model", () => {

    it("should return false model is not found", () => {
        var defRelation = {
                model: "#/model",
                references: "#/relatedModel",
                foreign_key: "related_pk"
            },
            data = {
                model: {}
            };

        var result = relation.validate(defRelation, data);

        expect(result).to.be.false;
    });

    it("should return true models are valid", () => {
        var defRelation = {
                model: "#/model",
                references: "#/relatedModel",
                foreign_key: "related_pk"
            },
            data = {
                model: {},
                relatedModel: {}
            };

        var result = relation.validate(defRelation, data);

        expect(result).to.be.true;
    });
});
