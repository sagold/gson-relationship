const { expect } = require("chai");
const join = require("../../lib/join");


describe("join", () => {

    it("should join 1:1 relationship (no foreign-pk)", () => {
        const result = join({
            model: {
                a: {
                    id: "a"
                },
                b: {
                    id: "b"
                },
                c: {
                    id: "c"
                }
            },
            model_sizes: {
                a: 0,
                b: 1,
                c: 1
            },
            sizes: [
                {
                    id: "large"
                },
                {
                    id: "small"
                }
            ]
        }, {
            type: "1:1",
            model: "/model",
            alias: "/child",
            reference: "/sizes",
            pivot: "/model_sizes",
            move: true
        });

        expect(result).to.deep.eq({
            model: {
                a: {
                    id: "a",
                    child: {
                        id: "large"
                    }
                },
                b: {
                    id: "b",
                    child: {
                        id: "small"
                    }
                },
                c: {
                    id: "c",
                    child: {
                        id: "small"
                    }
                }
            }
        });
    });


    it("should join 1:1 relationship adding foreign-pk", () => {
        const result = join({
            model: {
                a: {
                    id: "a"
                },
                b: {
                    id: "b"
                },
                c: {
                    id: "c"
                }
            },
            model_sizes: {
                a: "hui",
                b: "pfui",
                c: "pfui"
            },
            sizes: {
                hui: {
                    id: "large"
                },
                pfui: {
                    id: "small"
                }
            }
        }, {
            type: "1:1",
            model: "/model",
            alias: "/child",
            reference: "/sizes",
            referenceId: "pk",
            pivot: "/model_sizes",
            move: true
        });

        expect(result).to.deep.eq({
            model: {
                a: {
                    id: "a",
                    child: {
                        id: "large",
                        pk: "hui"
                    }
                },
                b: {
                    id: "b",
                    child: {
                        id: "small",
                        pk: "pfui"
                    }
                },
                c: {
                    id: "c",
                    child: {
                        id: "small",
                        pk: "pfui"
                    }
                }
            }
        });
    });


    it("should join 1:n relationship (no foreign-pk)", () => {
        const result = join({
            model: {
                a: {
                    id: "a"
                },
                b: {
                    id: "b"
                }
            },
            model_sizes: {
                a: ["large", "small"],
                b: ["small"]
            },
            sizes: {
                large: {
                    id: "large"
                },
                small: {
                    id: "small"
                }
            }
        }, {
            type: "1:n",
            model: "/model",
            alias: "/children",
            reference: "/sizes",
            pivot: "/model_sizes",
            move: true
        });

        expect(result).to.deep.eq({
            model: {
                a: {
                    id: "a",
                    children: {
                        large: {
                            id: "large"
                        },
                        small: {
                            id: "small"
                        }
                    }
                },
                b: {
                    id: "b",
                    children: {
                        small: {
                            id: "small"
                        }
                    }
                }
            }
        });
    });


    it("should join 1:n relationship using foreign-pk", () => {
        const result = join({
            model: {
                a: {
                    id: "a"
                },
                b: {
                    id: "b"
                }
            },
            model_sizes: {
                a: ["large", "small"],
                b: ["small"]
            },
            sizes: {
                large: {
                    id: "A"
                },
                small: {
                    id: "B"
                }
            }
        }, {
            type: "1:n",
            model: "/model",
            alias: "/children",
            reference: "/sizes",
            referenceId: "id",
            pivot: "/model_sizes",
            move: true
        });

        expect(result).to.deep.eq({
            model: {
                a: {
                    id: "a",
                    children: {
                        A: {
                            id: "A"
                        },
                        B: {
                            id: "B"
                        }
                    }
                },
                b: {
                    id: "b",
                    children: {
                        B: {
                            id: "B"
                        }
                    }
                }
            }
        });
    });

});
