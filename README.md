# JSON Relationship

**Transform json-data using relational concepts**

> This is a basic *json relationship* implementation following the minimal [specification](./Specification.md).
>
> - Quick transformation of nested json-data
> - reusable json-objects within a json-document (dry)

`npm i gson-relationship --save`


- [Examples](#examples)
- [Usage Examples](#usage-examples)
- [API](#api)


## Examples

### `1:1` relationship

Normalize nested json-objects, like

```js
{
  server: {
    serverA: {
      id: "serverA",
      service: { name: "A" }
    },
    serverB: {
      id: "serverB",
      services: { name: "B" }
    }
  }
}
```

to the following normalized representation

```js
{
  server: {
    serverA: { id: "serverA" },
    serverB: { id: "serverB" }
  },
  server_services: {
    serverA: "serviceA"
    serverB: "serviceB"
  },
  services: {
    serviceA: { name: "A" },
    serviceB: { name: "B" },
  }
}
```

and vice versa


### `1:n` relationship

Normalize nested json-objects, like

```js
{
  server: {
    serverA: {
      id: "serverA",
      services: {
        serviceA: { name: "A" },
        serviceB: { name: "B" }
      }
    },
    serverB: {
      id: "serverB",
      services: {
        serviceB: { name: "B" }
      }
    }
  }
}
```

to the following normalized representation

```js
{
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
}
```

and vice versa


## Usage example

> Transforms the above example having a server-service relationship to service-server relationship

```js
const { join, normalize, invertPivot } = require('json-relationship');

const data = {
  server: {
    serverA: {
      id: "serverA",
      services: {
        serviceA: { name: "A" },
        serviceB: { name: "B" }
      }
    },
    serverB: {
      id: "serverB",
      services: {
        serviceB: { name: "B" }
      }
    }
  }
}

// normalize the table as described in 'examples'
const normalized = normalize(data, {
  type: "1:n",
  model: "server",
  alias: "services",
  pivot: "server_services",
  reference: "services"
});

// we need to invert the mapping table for our purpose
const inverted = invertPivot(normalized, "server_services", "services_server");

// then rebuild the data with the inverted relationship
const services = join(inverted, {
  type: "1:n",
  model: "services",
  alias: "server",
  pivot: "services_server",
  reference: "server"
});
```

which results in `services` structured as

```js
{
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
}
```


## API

### relation description

| property                 | description
| ------------------------ | ----------------------------------------------------------------------------
| `model`:string           | json-pointer to parent tupels, e.g. `/data/server`
| `reference`:string       | json-pointer to related tupels e.g. `/data/services`
| `pivot`:string           | json-pointer to pivot table, mapping _model-reference_ e.g. `/data/pivot`
| `alias`:string           | json-pointer **within** model tupel to related tupel, e.g. `/services`
| `move`:boolean           | Removes associated relationships and pivots from model. defaults to `true`.
| `referenceId`:string     | **optional** change foreign key of a related tupel (property **within** tupel), e.g. `/id`

#### move-option

> Set this option to `true`, to keep the original data and additionally construct the target-models.

Per default `move = true`, which will remove

- all `pivot` and `reference` objects on a `join` operation
- the `alias` property and all its contained `references` on a `normalize` operation


### methods

| method                                | description
| ------------------------------------- | -------------------------------------------------------------
| `normalize`(data, rel):object           | build a unlinked json-data model containing pivot-table and references
| `join`(data, rel):object                | build a linked json-data, resolving pivot and reference-model
| `invertPivot`(data, from, to):object    | invert a pivot table (1:1, 1:n). May change relationtype from 1:1 to 1:n

#### normalize

> normalize(data:object, relationship:object) : object


#### join

> join(data:object, relationship:object) : object


#### invertPivot

> invertPivot(data:object, from:string, to:string = from) : object

A **1:1 pivot** is a simple map between a parent- and a target-property

```js
{
  pivot: {
    server: "serviceOfServer"
  }
}
```

`invertPivot(data, "/pivot")` will reverse the mapping, resulting in

```js
{
  pivot: {
    serviceOfServer: "server"
  }
}
```

`invertPivot(data, "/pivot", "/service_server")` will move the pivot location to the path specified in the `to`-argument

```js
{
  service_server: {
    serviceOfServer: "server"
  }
}
```

A **1:n pivot** is a map between a parent-property and multiple target-properties

```js
{
  pivot: {
    server: ["serviceA", "serviceB"]
  }
}
```

`invertPivot(data, "/pivot", "/service_servers")` will reverse the mapping, resulting in

```js
{
  service_servers: {
    serviceA: ["server"],
    serviceB: ["server"]
  }
}
```

A **1:1 pivot may be inverted to 1:n pivot**. If the original pivot maps multiple tupels to the same target, the
invertion a pivot results in a 1:n map, which may be recogniced by an array for each model key:

```js
{
  pivot: {
    serviceA: "server"
    serviceB: "server"
  }
}
```

`invertPivot(data, "/pivot")` will create the following `1:n` pivot

```js
{
  pivot: {
    server: ["serviceA", "serviceB"]
  }
}
```



