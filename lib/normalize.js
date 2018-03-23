const pointer = require("gson-pointer");
const query = require("gson-query");
const copy = require("./copy");


/**
 * transforms (normalizes) a json model having a 1:1 relationship on a common property
 *
 * e.g.
 * {
 *  type: "1:1",
 *  model: <model>,
 *  alias: "child",
 *  reference: <reference>,
 *  pivot: <pivot>
 * }
 * transforms
 *  <model>: {
 *      a: { child: { pk: "a child" } },
 *      b: { child: { pk: "b child" } }
 *  }
 * to
 *  {
 *      <model>: { a: {}, b: {} },
 *      <reference>: [ { pk: "a child" }, { pk: "b child" } ],
 *      <pivot>: { a: 0, b: 1 }
 *  }
 *
 * option: <referenceId>
 * > If a `referenceId` is set, e.g. referenceId: "pk", the data structure changes to the following maps
 *  {
 *      <model>: { a: {}, b: {} },
 *      <reference>: {
 *          "a child": { pk: "a child" },
 *          "b child": { pk: "b child" }
 *      },
 *      <pivot>: { a: "a child", b: "b child" }
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
function normalizeOneToOne(data, { model, reference, pivot, alias, referenceId = false, move = true }) {
    let referenceModel = pointer.get(data, reference, referenceId ? {} : []);
    const pivotModel = pointer.get(data, pivot, {});
    const referencePointers = query.get(data, pointer.join(model, "*", alias), query.get.POINTER);
    const matchParentPK = new RegExp(pointer.join(model, "([^/]*)", alias));

    // build 1:1 pivot table
    referencePointers.forEach((ptr) => {
        let index;
        const [, parentId] = ptr.match(matchParentPK);

        if (referenceId) {
            const referenceValue = pointer.get(data, ptr);
            index = pointer.get(referenceValue, referenceId);
            referenceModel[index] = referenceValue;
        } else {
            const referenceValue = JSON.stringify(pointer.get(data, ptr));
            index = referenceModel.indexOf(referenceValue);
            if (index === -1) {
                referenceModel.push(referenceValue);
                index = referenceModel.indexOf(referenceValue);
            }
        }

        pivotModel[parentId] = index;
    });
    // convert values back to data
    if (!referenceId) {
        referenceModel = referenceModel.map(JSON.parse);
    }

    pointer.set(data, pivot, pivotModel);
    pointer.set(data, reference, referenceModel);

    if (move === true) {
        referencePointers.forEach((ptr) => query.delete(data, ptr));
    }

    return data;
}


/**
 * transforms (normalizes) a json model having a 1:n relationship on a common object
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
 * to
 *  {
 *      <model>: { a: {}, b: {} },
 *      <reference>: {
 *          "serviceA": { id: "A" },
 *          "serviceB": { id: "B" }
 *      },
 *      <pivot>: { a: ["serviceA", "serviceB"], b: ["serviceB"] }
 *  }
 *
 * option: <referenceId>
 * > If a `referenceId` is set, e.g. referenceId: "id", the given property-name will be used as id instead
 *  {
 *      <model>: { a: {}, b: {} },
 *      <reference>: {
 *          "A": { id: "A" },
 *          "B": { id: "B" }
 *      },
 *      <pivot>: { a: ["A", "B"], b: ["B"] }
 *  }
 *
 * @param  {Object}  data                   - input data. will be copied
 * @param  {String}  options.model          - json-pointer to tupels
 * @param  {String}  options.reference      - json-pointer to related tupels
 * @param  {String}  options.pivot          - json-pointer to pivot table
 * @param  {String}  options.alias          - json-pointer within model tupel to related tupels
 * @param  {Boolean} [options.move]         - Remove associated relationship from model. defaults to true.
 * @return {Object} transformed input data
 */
function normalizeOneToMany(data, { model, reference, pivot, alias, referenceId = false, move = true }) {
    const referenceModel = pointer.get(data, reference, {});
    const pivotModel = pointer.get(data, pivot, {});
    const referencePointers = query.get(data, pointer.join(model, "*", alias, "*"), query.get.POINTER);
    const matchPKs = new RegExp(pointer.join(model, "([^/]*)", alias, "([^/]*)"));

    // build 1:n pivot table
    referencePointers.forEach((ptr) => {
        let [, parentId, childId] = ptr.match(matchPKs); // eslint-disable-line prefer-const

        if (referenceId) {
            childId = pointer.get(data, pointer.join(ptr, referenceId), childId);
        }

        pivotModel[parentId] = pivotModel[parentId] || {};
        pivotModel[parentId][childId] = true;
    });
    // convert child map to list
    Object.keys(pivotModel).forEach((parentId) => (pivotModel[parentId] = Object.keys(pivotModel[parentId])));

    // move references to related model
    referencePointers.forEach((ptr) => {
        const value = pointer.get(data, ptr);
        let childId = pointer.split(ptr).pop();

        if (referenceId) {
            childId = pointer.get(data, pointer.join(ptr, referenceId), childId);
        }

        referenceModel[childId] = value;
    });

    // remove alias references on each tupel
    if (move === true) {
        query.delete(data, pointer.join(model, "*", alias));
    }

    // update model
    pointer.set(data, pivot, pivotModel);
    pointer.set(data, reference, referenceModel);

    return data;
}


function normalize(data, rel) {
    data = copy(data);

    if (rel.type === "1:1") {
        return normalizeOneToOne(data, rel);
    }

    if (rel.type === "1:n") {
        return normalizeOneToMany(data, rel);
    }

    throw new Error(`Unknown relationship 'type' ${rel.type} in ${JSON.stringify(rel)}`);
}


module.exports = normalize;
