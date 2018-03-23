const pointer = require("gson-pointer");
const query = require("gson-query");
const copy = require("./copy");


/**
 * builds a 1:1 relationship of json-models
 *
 * e.g.
 * {
 *  type: "1:1",
 *  model: <model>,
 *  alias: "service",
 *  reference: <reference>,
 *  pivot: <pivot>
 * }
 *
 * transforms
*  {
*      <model>: { a: {}, b: {} },
*      <pivot>: { a: "serviceA", b: "serviceB" },
*      <reference>: {
*          "serviceA": { id: "A" },
*          "serviceB": { id: "B" }
*      }
*  }
 * to
 *  <model>: {
 *      a: {
 *          service: { id: "A" }
 *      },
 *      b: {
 *          service: { id: "B" }
 *      },
 *  }
 *
 * option: <referenceId>
 * > If a `referenceId` is set, e.g. referenceId: "id", the pk from the pivot will be added to the property
 *  {
 *      <model>: {
 *          a: {
 *              service: { id: "serviceA" }
 *          },
    *       b: {
 *              service: { id: "serviceB" }
 *          }
 *      }
 *  }
 *
 * @param  {Object}  data                   - input data. will be copied
 * @param  {String}  options.model          - json-pointer to tupels
 * @param  {String}  options.reference      - json-pointer to related tupels
 * @param  {String}  options.pivot          - json-pointer to pivot table
 * @param  {String}  options.alias          - json-pointer within model tupel to related tupel
 * @param  {String}  [options.referenceId]  - A uniquie property on related tupel. see explanation above.
 * @param  {Boolean} [options.move]         - Remove associated relationship from model. defaults to true.
 * @return {Object} transformed input data
 */
function joinOneToOne(data, { model, reference, pivot, alias, referenceId = false, move = true }) {
    const referenceModel = pointer.get(data, reference, []);

    query.run(data, pointer.join(pivot, "*"), (childId, parentId) => {
        if (referenceModel[childId] == null) {
            console.log(`Error: Missing id ${childId} on reference-model ${reference}`);
            return;
        }

        const target = pointer.join(model, parentId, alias);
        pointer.set(data, target, referenceModel[childId]);

        if (referenceId) {
            pointer.set(referenceModel[childId], referenceId, childId);
        }
    });

    if (move === true) {
        pointer.delete(data, pivot);
        pointer.delete(data, reference);
    }

    return data;
}


/**
 * builds a 1:n relationship of json-models
 *
 * e.g.
 * {
 *  type: "1:n",
 *  model: <model>,
 *  alias: "services",
 *  reference: <reference>,
 *  pivot: <pivot>
 * }
 *
 * transforms
*  {
*      <model>: { a: {}, b: {} },
*      <reference>: {
*          "serviceA": { id: "A" },
*          "serviceB": { id: "B" }
*      },
*      <pivot>: { a: ["serviceA", "serviceB"], b: ["serviceB"] }
*  }
 * to
 *  <model>: {
 *      a: {
 *          services: {
 *              serviceA: { id: "A" },
 *              serviceB: { id: "B" }
 *          }
 *      },
 *      a: {
 *          services: {
 *              serviceB: { id: "B" }
 *          }
 *      },
 *  }
 *
 * option: <referenceId>
 * > If a `referenceId` is set, e.g. referenceId: "id", the given property-name will be used as id instead
 *  {
 *      <model>: {
 *          a: {
 *              services: {
 *                  A: { id: "A" },
    *               B: { id: "B" }
 *              }
 *          },
    *       a: {
 *              services: {
 *                  A: { id: "B" }
 *              }
 *          },
 *      }
 *  }
 *
 * @param  {Object}  data                   - input data. will be copied
 * @param  {String}  options.model          - json-pointer to tupels
 * @param  {String}  options.reference      - json-pointer to related tupels
 * @param  {String}  options.pivot          - json-pointer to pivot table
 * @param  {String}  options.alias          - json-pointer within model tupel to related tupel
 * @param  {String}  [options.referenceId]  - A uniquie property on related tupel. see explanation above.
 * @param  {Boolean} [options.move]         - Remove associated relationship from model. defaults to true.
 * @return {Object} transformed input data
 */
function joinOneToMany(data, { model, pivot, alias, reference, referenceId = false, move = true }) {
    const referenceModel = pointer.get(data, reference, {});

    // move references to model-tupels
    query.run(data, pointer.join(pivot, "*"), (children, parentId) => {
        children.forEach((childId) => {
            if (referenceModel[childId] == null) {
                console.log(`Error: Missing id ${childId} on reference-model ${reference}`);
                return;
            }

            let target = pointer.join(model, parentId, alias, childId);
            if (referenceId) {
                const id = pointer.get(referenceModel[childId], referenceId, childId);
                target = pointer.join(model, parentId, alias, id);
            }

            pointer.set(data, target, referenceModel[childId]);
        });
    });

    if (move === true) {
        // delete pivot and references
        pointer.delete(data, reference);
        pointer.delete(data, pivot);
    }

    return data;
}


function join(data, rel) {
    data = copy(data);

    if (rel.type === "1:1") {
        return joinOneToOne(data, rel);
    }

    if (rel.type === "1:n") {
        return joinOneToMany(data, rel);
    }

    throw new Error(`Unknown relationship 'type' ${rel.type} in ${JSON.stringify(rel)}`);
}


module.exports = join;
