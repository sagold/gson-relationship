var expect = require("chai").expect;
var path = require("path");
var fs = require("fs");
var Relationship = require("../../lib").Relationship;


describe("relation", () => {

    var modifiedData,
        originalData;

    beforeEach(() => {
        modifiedData = fs.readFileSync(path.join(__dirname, "../support/simple.json"));
        originalData = JSON.parse(modifiedData);
        modifiedData = JSON.parse(modifiedData);
    });

    it("should unload has_one:foreign_key to original object", () => {
        var relation = new Relationship(modifiedData, "shirt has_one:size on:related_size");
        relation.loadAll();
        // log
        fs.writeFileSync(path.join(__dirname, "../log/simple.has_one.loaded.json"), JSON.stringify(modifiedData, null, 4));
        // relationship should have been loaded
        expect(modifiedData.shirt.hotpink.related_size.name).to.eq("small");

        relation.unloadAll();
        // log
        fs.writeFileSync(path.join(__dirname, "../log/simple.has_one.unloaded.json"), JSON.stringify(modifiedData, null, 4));

        expect(modifiedData.shirt.hotpink.related_size).to.eq("small");
        expect(originalData).to.deep.eql(modifiedData);
    });

    it("should unload has_many:through:alias to original object", () => {
        var relation = new Relationship(modifiedData, "shirt has_many:size as:sizes through:shirt_sizes");
        relation.loadAll();
        // log
        fs.writeFileSync(path.join(__dirname, "../log/simple.has_many.loaded.json"), JSON.stringify(modifiedData, null, 4));
        // relationship should have been loaded
        expect(modifiedData.shirt.white.sizes.length).to.eq(2);
        expect(modifiedData.shirt.white.sizes[1].name).to.eq("small");

        relation.unloadAll();
        // log
        fs.writeFileSync(path.join(__dirname, "../log/simple.has_many.unloaded.json"), JSON.stringify(modifiedData, null, 4));

        expect(modifiedData.shirt.white.sizes).to.be.undefined;
        expect(originalData).to.deep.eql(modifiedData);
    });
});
