const { expect } = require("chai");
const { join, normalize, invertPivot } = require("../../lib");

describe("readme", () => {

    const data = {
        server: {
            serverA: {
                id: "serverA",
                services: {
                    serviceA: {
                        name: "A"
                    },
                    serviceB: {
                        name: "B"
                    }
                }
            },
            serverB: {
                id: "serverB",
                services: {
                    serviceB: {
                        name: "B"
                    }
                }
            }
        }
    };

    it("should revert relationship from server-service to service-server", () => {
        const normalized = normalize(data, {
            type: "1:n",
            model: "server",
            alias: "services",
            pivot: "server_services",
            reference: "services"
        });

        expect(normalized).to.deep.equal({
            server: {
                serverA: { id: "serverA" },
                serverB: { id: "serverB" }
            },
            server_services: {
                serverA: ["serviceA", "serviceB"],
                serverB: ["serviceB"]
            },
            services: {
                serviceA: { name: "A" },
                serviceB: { name: "B" }
            }
        });

        const inverted = invertPivot(normalized, "/server_services");

        const services = join(inverted, {
            type: "1:n",
            model: "services",
            alias: "server",
            pivot: "server_services",
            reference: "server"
        });

        expect(services).to.deep.equal({
            services: {
                serviceA: {
                    name: "A",
                    server: {
                        serverA: { id: "serverA" }
                    }
                },
                serviceB: {
                    name: "B",
                    server: {
                        serverA: { id: "serverA" },
                        serverB: { id: "serverB" }
                    }
                }
            }
        });
    });

});
