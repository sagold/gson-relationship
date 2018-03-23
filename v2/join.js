const pointer = require("gson-pointer");
const query = require("gson-query");
const copy = require("./copy");


function joinOneToOne(data, { model, reference, pivot, alias, move = true }) {
    const referenceModel = pointer.get(data, reference, []);

    query.run(data, pointer.join(pivot, "*"), (childId, parentId) => {
        if (referenceModel[childId] == null) {
            console.log(`Error: Missing id ${childId} on reference-model ${reference}`);
            return;
        }

        const target = pointer.join(model, parentId, alias, childId);
        pointer.set(data, target, referenceModel[childId]);
    });

    if (move === true) {
        pointer.delete(data, pivot);
        pointer.delete(data, reference);
    }

    return data;
}


function joinOneToMany(data, { model, pivot, alias, reference, move = true }) {
    const referenceModel = pointer.get(data, reference, {});

    // move references to model-tupels
    query.run(data, pointer.join(pivot, "*"), (children, parentId) => {
        children.forEach((childId) => {
            if (referenceModel[childId] == null) {
                console.log(`Error: Missing id ${childId} on reference-model ${reference}`);
                return;
            }

            const target = pointer.join(model, parentId, alias, childId);
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

    throw new Error(`Unknown relationship ${rel.type}: ${JSON.stringify(rel)}`);
}


module.exports = join;
