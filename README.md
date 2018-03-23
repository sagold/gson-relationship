# Json Relationship

> This is a basic *json relationship* implementation following the minimal [specification](./Specification.md).

install via `npm i json-relationship --save`

- [Tasks](#tasks)
- [Examples](#examples)
- [Usage Examples](#usage-examples)
- [API](#api)


## Tasks

- Quick transformation of nested json-data
- reusable json-objects within a json-document (dry)


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

> Transform the above example having a server-service relationship to service-server relationship

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

| method                                | description
| ------------------------------------- | -------------------------------------------------------------
| normalize(data, rel) -> object        | build a unlinked json-data model containing pivot-table and references
| join(data, rel) -> object             | build a linked json-data, resolving pivot and reference-model
| invertPivot(data, from, to) -> *data  | invert a pivot table (1:1, 1:n). May change relationtype from 1:1 to 1:n


### normalize

> normalize(data:object, rel:object) -> :object


### join

> join(data:object, rel:object) -> :object


### invertPivot

> invertPivot(data:object, from:string, to:string) -> :object

