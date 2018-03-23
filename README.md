# Json Relationship

> This is a basic *json relationship* implementation following the minimal [specification](./Specification.md).

install via `npm i json-relationship --save`


## Tasks

- Quick transformation of nested json-data
- reusable json-objects within a json-document (dry)


## Examples

### `1:1` releationship

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


### `1:n` releationship

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
    serviceB: { name: "B" },
  }
}
```

and vice versa


## Usage

