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

const normalized = normalize(data, {
    type: "1:n",
    model: "server",
    alias: "services",
    pivot: "server_services",
    reference: "services"
});
const inverted = invertPivot(normalized, "server_services");
const services = join(inverted, {
    type: "1:n",
    model: "services",
    alias: "server",
    pivot: "server_services",
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

