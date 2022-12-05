---
title: "What is temporal coupling and why it hurts your API"
tags: [coupling, javascript]
excerpt: coupling is bad, we know it, but what exactly is temporal coupling
lang: en
date: 2022-08-27
---

We all have heard, at some point in our carreer, that coupling is bad and we should try to have things as loosely coupled as possible.

Then we realize, coupling is not bad per se, but needs to be used correctly. Some things need to be coupled and have to be tightly coupled and it's okay to do so.

But then, there are some things that are never to be coupled together, those two things are your API and time: Your API should never depend on time.

## What is temporal coupling

Coupling (at this point, I'll use "coupling" to refer to "tight coupling") is having a piece of your codebase highly depending on another piece.
Temporal coupling, on the other hand, is having a piece of your API that depends on time.
Time here is not exactly time we experience as human but rather time as in execution order. Time relative to the executing program.

```typescript
class User {
  public name?: string;
  constructor(private id) {}

  async init() {
    const user = await fetch(`/users/${this.id}`);
    this.name = user.name;
  }
}
```

Now the problem is the following

```typescript
const user = new User(1);
user.name; // undefined
```

The problem is particularly present in JavaScript where async constructors are not possible.

## Fixing Temporal Coupling

You need to do some async operation, ok that you cannot work around. What we can do though is give our user (here it's the API user, so another fellow developer) a nicer interface to that our consumer cannot access the `name` property at all if the `init` method was not called.

To do this we could use some other primitive that the language is offering us. Instead of classes, we could use lower level primitives like functions.

```typescript
async function createUser(id: string): User {
  const { name } = await fetch(`/users/${id}`);
  return new User(id, name);
}
```

## How to fix coupling

Coupling is generally fixed by using composition and higher order functions.

Let's take this component that is tightly coupled with this other component

```jsx
function Component() {
  return <OtherComponent />;
}
```

We could decouple them by injecting the `OtherComponent` as a `children` property

```jsx
function component({ children }) {
  return children;
}
```

Now component just acts as a wrapper and knows nothing of the component it renders as it's children. It's not tied to anything else in your codebase it's just a generic component that could be used in different places.
It's a nice way to extract functionnalities and make them accessible to other parts of your app.

##
