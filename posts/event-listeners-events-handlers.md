---
title: "EventListeners, EventHandlers the DOM and general API design"
tags: []
excerpt: TODO
lang: en
date: 2021-06-10
---

As web frontend developers, the `DOM` is **the** API we constantly interact with. In particular `events` are our primary, if not only, way to know that something happened on the UI level.

We are very used to consuming events via callbacks in JavaScript but, interestingly enough, there are two different way of registering an event handler on the `DOM` API:

- via an event handler property (`element.onevent = handler`);
- via an EventListener (`element.addEventListener('event', listener)`).

## Two ways of doing the same thing?

addEventListener is only here since the [DOM Level 2 Events Specification](https://www.w3.org/TR/DOM-Level-2-Events/)... back in 2000. Before this, there was a single way to attach callbacks to an event: `element.onevent = handler`.

There is a major drawback with this method: You can only attach a **single handler** to a particular event on an element. Any subsequent call to `element.onevent = handler` will simply overwrite the previous handler.

```js
element.onclick = () => console.log("first");
// [...]
element.onclick = () => console.log("second");

element.click(); // will log `second` and never `first`
```

The DOM 2 specification then adds the `addEventListener` method that allows adding multiple listeners and controlling the event flow (`capture` and `bubbling`)

```js
element.addEventListener('click', () => console.log("first"));
// [...]
element.addEventListener('click', () => console.log("second"));

element.click(); // will log `second` and `first`
```

Since it's in the core values of the web APIs to be retro-compatible, as of today, it is still possible to register event handlers the old way (and it will most likely be possible forever !).