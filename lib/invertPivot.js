const pointer = require("gson-pointer");
const query = require("gson-query");
const copy = require("./copy");


function invertPivot(data, from, to = from) {
    data = copy(data);

    const inverted = {};
    const relations = query.get(data, pointer.join(from, "*"), query.get.ALL);
    const isArray = Array.isArray(relations[0][0]);
    const isKey = typeof relations[0][0] === "string";
    let isOneToMany = false;

    if (isArray) {
        relations.forEach((args) => {
            const [value, parentId] = args;
            value.forEach((childId) => {
                inverted[childId] = inverted[childId] || [];
                inverted[childId].push(parentId);
            });
        });
    } else if (isKey) {
        relations.forEach((args) => {
            const [value, parentId] = args;
            if (inverted[value] == null) {
                inverted[value] = parentId;
                return;
            }
            isOneToMany = true;
            if (typeof inverted[value] === "string") {
                inverted[value] = [inverted[value]];
            }
            inverted[value].push(parentId);
        });

        if (isOneToMany) {
            Object.keys(inverted).forEach((id) => {
                if (Array.isArray(inverted[id]) === false) {
                    inverted[id] = [inverted[id]];
                }
            });
        }
    } else {
        throw new Error(`Unknown pivot format ${data}`);
    }

    from !== to && pointer.delete(data, from);
    pointer.set(data, to, inverted);
    return data;
}


module.exports = invertPivot;
