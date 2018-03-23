const { expect } = require("chai");
const invertPivot = require("../../lib/invertPivot");


describe("invertPivot", () => {

    it("should invert object-array", () => {
        const result = invertPivot({
            server_services: {
                serverA: ["serviceA", "serviceB"],
                serverB: ["serviceB"]
            }
        }, "server_services");

        expect(result).to.deep.equal({
            server_services: {
                serviceA: ["serverA"],
                serviceB: ["serverA", "serverB"]
            }
        });
    });

    it("should invert object-keys", () => {
        const result = invertPivot({
            server_services: {
                serverA: "serviceA",
                serverB: "serviceB"
            }
        }, "server_services");

        expect(result).to.deep.equal({
            server_services: {
                serviceA: "serverA",
                serviceB: "serverB"
            }
        });
    });

    it("should rename pivot table if specified", () => {
        const result = invertPivot({
            server_services: {
                serverA: "serviceA",
                serverB: "serviceB"
            }
        }, "server_services", "services_server");

        expect(result).to.deep.equal({
            services_server: {
                serviceA: "serverA",
                serviceB: "serverB"
            }
        });
    });

    it("should invert object-keys to a 1:n map ", () => {
        const result = invertPivot({
            server_services: {
                serverA: "serviceA",
                serverB: "serviceA"
            }
        }, "server_services");

        expect(result).to.deep.equal({
            server_services: {
                serviceA: ["serverA", "serverB"]
            }
        });
    });
});
