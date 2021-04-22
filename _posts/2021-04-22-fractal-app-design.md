---
title: "Fractal application design"
categories: [frontend, architecture]
description: TODO
lang: en
---

If you know me a little, you probably know that I am a big fan of [Cycle.js](https://cycle.js.org/).  
There are quite a few aspects of Cycle.js that I love! The fact that 100% of the application code is pure is definitly one of them!  
But one that has particularly influenced the way I design frontend web applications is the fractal nature of the Cycle architecture.

Decomposing applications into separate fractal modules has quite a lot of benefits:

- **self-containement**: everything about a particular feature is co-located and has a single entry-point;
- **extractability**: extracting a feature to an external module is effortless;
- **nonintrusive**: adding a feature is just a matter of pluging in the main function at the right place of the app (corrolary: Removing/Disabling a feature is just as easy as adding it).

# Cycle.js and fractality

A typical Cycle.js application looks like this :

```ts
type Sources = {
  HTTP: HTTPSource;
  DOM: DOMSource;
  // ...
};

type Sinks = {
  HTTP: Stream<HTTPRequests>;
  DOM: Stream<VNodes>;
  // ...
};

type App = (sources: Sources) => Sinks;
```

Where `Sources` are all the streams that the application will read from (`DOM` events, `HTTP` responses...) and `Sinks` are all the side effects that the application will do.

And here is the signature of a component:

```ts
type Component = (sources: Sources) => Sinks;
```

Notice anything?  
Right, it's exactly the same signature

No matter how many sources the app reads from and how many sinks it produces the app will still be fractal.

# Fractal design
