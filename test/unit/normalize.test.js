const { expect } = require("chai");
const normalize = require("../../lib/normalize");


describe("normalize", () => {

    it("should normalize 1:1 relationship (no foreign-pk)", () => {
        const result = normalize({
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
        });
    });

    it("should normalize 1:1 relationship using foreign-pk", () => {
        const result = normalize({
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
        }, {
            type: "1:1",
            model: "/model",
            alias: "/child",
            reference: "/sizes",
            referenceId: "id",
            pivot: "/model_sizes",
            move: true
        });

        expect(result).to.deep.eq({
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
                a: "large",
                b: "small",
                c: "small"
            },
            sizes: {
                large: {
                    id: "large"
                },
                small: {
                    id: "small"
                }
            }
        });
    });

    it("should normalize 1:n relationship", () => {
        const result = normalize({
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
        });
    });


    it("should normalize 1:n relationship using foreign-pk", () => {
        const result = normalize({
            model: {
                a: {
                    id: "a",
                    children: {
                        large: {
                            id: "A"
                        },
                        small: {
                            id: "B"
                        }
                    }
                },
                b: {
                    id: "b",
                    children: {
                        small: {
                            id: "B"
                        }
                    }
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
                    id: "a"
                },
                b: {
                    id: "b"
                }
            },
            model_sizes: {
                a: ["A", "B"],
                b: ["B"]
            },
            sizes: {
                A: {
                    id: "A"
                },
                B: {
                    id: "B"
                }
            }
        });
    });
});
