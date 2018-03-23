const { expect } = require("chai");
const normalize = require("../../v2/normalize");


describe("normalize", () => {

    it("should return an object", () => {
        const result = normalize();

        expect(result).to.deep.eq({});
    });
});
