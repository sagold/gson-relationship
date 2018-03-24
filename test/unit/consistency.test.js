/* eslint object-property-newline: 0 */
const { expect } = require("chai");
const { join, normalize } = require("../../lib");


describe("consistency", () => {

    it("should return input data for 1:1 join -> normalize", () => {
        const relationship = {
            type: "1:1",
            model: "feet",
            reference: "socks",
            pivot: "feet_sock",
            alias: "sock",
            referenceId: "name" // requires a reference-id or the pivot would be reverted as an array (no known id)
        };
        const input = {
            feet: {
                large: { id: "large" },
                medium: { id: "medium" }
            },
            socks: {
                red: { name: "red" },
                green: { name: "green" }
            },
            feet_sock: {
                large: "red",
                medium: "green"
            }
        };

        const joined = join(input, relationship);
        expect(joined.feet.large.sock.name).to.eq("red");
        expect(joined.feet.medium.sock.name).to.eq("green");

        const reverted = normalize(joined, relationship);
        expect(reverted).to.deep.eq(input);
    });

    it("should return input data for 1:1 normalize -> join", () => {
        const relationship = {
            type: "1:1",
            model: "feet",
            reference: "socks",
            pivot: "feet_sock",
            alias: "sock",
            referenceId: "name" // requires a reference-id or the pivot would be reverted as an array (no known id)
        };
        const input = {
            feet: {
                large: {
                    id: "large",
                    sock: { name: "green" }
                },
                medium: {
                    id: "medium",
                    sock: { name: "red" }
                }
            }
        };

        const normalized = normalize(input, relationship);
        expect(normalized.socks.green.name).to.eq("green");
        expect(normalized.socks.red.name).to.eq("red");

        const reverted = join(normalized, relationship);
        expect(reverted).to.deep.eq(input);
    });

    it("should return input data for 1:n join -> normalize", () => {
        const relationship = {
            type: "1:n",
            model: "feet",
            reference: "socks",
            pivot: "feet_sock",
            alias: "socks",
            referenceId: "name" // requires a reference-id or the pivot would be reverted as an array (no known id)
        };
        const input = {
            feet: {
                large: { id: "large" },
                medium: { id: "medium" }
            },
            socks: {
                red: { name: "red" },
                green: { name: "green" },
                yellow: { name: "yellow" }
            },
            feet_sock: {
                large: ["red", "yellow"],
                medium: ["green"]
            }
        };

        const joined = join(input, relationship);
        expect(joined.feet.large.socks).to.deep.eq({
            red: { name: "red" },
            yellow: { name: "yellow" }
        });

        const reverted = normalize(joined, relationship);
        expect(reverted).to.deep.eq(input);
    });

    it("should return input data for 1:n normalize -> join", () => {
        const relationship = {
            type: "1:n",
            model: "feet",
            reference: "socks",
            pivot: "feet_sock",
            alias: "sock",
            referenceId: "name" // requires a reference-id or the pivot would be reverted as an array (no known id)
        };
        const input = {
            feet: {
                large: {
                    id: "large",
                    socks: {
                        red: { name: "red" },
                        yellow: { name: "yellow" }
                    }
                },
                medium: {
                    id: "medium",
                    socks: {
                        yellow: { name: "yellow" }
                    }
                }
            }
        };

        const normalized = normalize(input, relationship);
        expect(normalized.feet_sock).to.deep.eq({
            large: ["red", "yellow"],
            medium: ["yellow"]
        });

        const reverted = join(normalized, relationship);
        expect(reverted).to.deep.eq(input);
    });
});
