const pointer = require("gson-pointer");
const query = require("gson-query");
const copy = require("./copy");


function normalizeOneToOne(data, { model, reference, pivot, alias, move = true }) {
    let referenceModel = pointer.get(data, reference, []);
    const pivotModel = pointer.get(data, pivot, {});
    const referencePointers = query.get(data, pointer.join(model, "*", alias), query.get.POINTER);
    const matchParentPK = new RegExp(pointer.join(model, "([^/]*)", alias));

    // build 1:1 pivot table
    referencePointers.forEach((ptr) => {
        const [, parentId] = ptr.match(matchParentPK);
        const referenceValue = JSON.stringify(pointer.get(data, ptr));
        let index = referenceModel.indexOf(referenceValue);
        if (index === -1) {
            referenceModel.push(referenceValue);
            index = referenceModel.indexOf(referenceValue);
        }

        pivotModel[parentId] = index;
    });
    // convert values back to data
    referenceModel = referenceModel.map(JSON.parse);

    pointer.set(data, pivot, pivotModel);
    pointer.set(data, reference, referenceModel);

    if (move === true) {
        referencePointers.forEach((ptr) => query.delete(data, ptr));
    }

    return data;
}


function normalizeOneToMany(data, { model, reference, pivot, alias, move = true }) {
    const referenceModel = pointer.get(data, reference, {});
    const pivotModel = pointer.get(data, pivot, {});
    const referencePointers = query.get(data, pointer.join(model, "*", alias, "*"), query.get.POINTER);
    const matchPKs = new RegExp(pointer.join(model, "([^/]*)", alias, "([^/]*)"));

    // build 1:n pivot table
    referencePointers.forEach((ptr) => {
        const [, parentId, childId] = ptr.match(matchPKs);
        pivotModel[parentId] = pivotModel[parentId] || {};
        pivotModel[parentId][childId] = true;
    });
    // convert child map to list
    Object.keys(pivotModel).forEach((parentId) => (pivotModel[parentId] = Object.keys(pivotModel[parentId])));

    // move references to related model
    referencePointers.forEach((ptr) => {
        const value = pointer.get(data, ptr);
        referenceModel[pointer.split(ptr).pop()] = value;
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

    throw new Error(`Unknown relationship ${rel.type}: ${JSON.stringify(rel)}`);
}


module.exports = normalize;
