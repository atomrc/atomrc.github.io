---
title: "Inspiring from React's useEffect to design effective APIs: the cleanup function pattern"
tags: [javascript, reactive programming, rxjs, react, useEffect]
excerpt: "Let's inspire from React's useEffect pattern to design easy-to-use and encapsulated effectful APIs"
lang: en
date: 2022-12-24
updated: 2022-12-27
---

React's `useEffect` forces you to implement a quite powerful pattern: the **cleanup function pattern** (or teardown function pattern).

Let's see how we could leverage this pattern to provide **perfect encapsulation** and make **deceptive calls impossible**.

## The cleanup function pattern

The idea is quite simple: A function that triggers a long-lived side effect returns another function to teardown this effect.

The pattern goes as follows:

```js
function effect() {
  // trigger some long lived effect (listening to a websocket, registering DOM event listeners...)
  return function cleanupEffect() {
    // cleanup the long lived effect
  };
}
```

React developers will immediately recognize the [`useEffect`](https://reactjs.org/docs/hooks-effect.html#example-using-hooks-1) pattern.

```js
useEffect(() => {
  // trigger some long lived effect
  return () => {
    // cleanup
  };
});
```

This pattern is not so fancy nor new! It has been around in Reactive Programming libraries for a little while. RxJS' [`subscribe` method](https://rxjs.dev/guide/subscription) follows this pattern, for example.  
The main difference between React and RxJS (or others), is that **RxJS implements the cleanup function pattern** while **React requires you to implement the pattern**.

## Benefits of the cleanup function pattern

There are two main takeaways to this pattern:

- it brings **perfect encapsulation**;
- it makes **deceptive calls impossible**.

Let's take a very common API that could benefit from the cleanup function pattern: the famous `(add|remove)EventListener` DOM API.

A traditional usage of this API would look something like this:

```js
const sendPayload = () => {
  /*...*/
};
const button = document.getElementById("the-button");

button.addEventListener("click", sendPayload);
// ... later on
button.removeEventListener("click", sendPayload);
```

How about we try to implement our own `addListener` function that implements the cleanup function pattern?

```js
function addListener(element, event, callback) {
  element.addEventListener(event, callback);
  return () => {
    element.removeEventListener(event, callback);
  };
}
```

### Perfect encapsulation

One of the problems of the `button.addEventListener` is that you **need to keep track** of the DOM element (`button`), the event name (`click`) and the callback (`sendPayload`) in order to be able to remove this listener.  
Lose one of those ingredients, and your `click` listener is here to stay!

Thanks to our custom `addListener` function that we implemented earlier, a **single reference** is needed in order to remove the listener:

```js
const sendPayload = () => {
  /*...*/
};
const button = document.getElementById("the-button");

const removeListener = addListener(button, "click", sendPayload);
//    ^ removeListener is the only reference we need to keep
removeListener();
```

Now, the references to the button, the event name and the callback are **encapsulated in the cleanup function**. The only thing we need to keep track of is the `removeListener` function.

So we could even inline everything

```js
const removeListener = addListener(
  document.getElementById("the-button"),
  "click",
  () => {}
);
```

> ⚠️ _I **would not** suggest inlining code like the previous code sample. This example is there just to highlight that it is possible._

### Preventing deceptive calls

Let's consider the following samples:

```js
const sendPayload = () => {};

button.removeEventListener("click", sendPayload);
// ❌ Useless call, the listener has not been added yet (temporal coupling)

button.addEventListener("click", sendPayload);

button.removeEventListener("click", () => sendPayload());
// ❌ The listener is not removed because the reference to the function has changed

button.removeEventListener("auxclick", sendPayload);
// ❌ this is useless since we never added a `auxclick` listener
```

Some of those calls are not only useless, they are deceptive. You could _feel like you have removed the listener_, but in fact it's still there and active.

Those calls are made impossible with the cleanup function pattern!

If you do not have the reference to the `cleanupFunction` that you first created by triggering the effect, there is nothing you can do!  
We are preventing what is called a [temporal coupling](https://betterprogramming.pub/temporal-coupling-in-code-e74899f7a48f).

## A concrete example: Listening to a WebSocket

Let's implement a naive module that subscribes to WebSocket events and forwards them to the consumer:

```js
let ws;

export function listen(onEvent) {
  ws = new WebSocket("wss://example.com");
  ws.onmessage = onEvent;
}

export function close() {
  if (ws) {
    ws.close();
    ws = undefined;
  }
}
```

A few things to note:

- the `close` function can be called even if the connection is not active;
- the module needs to be stateful and keep track of `ws`;
- we need to perform some checks before we can safely close (`if (ws)`);
- if we call `listen` multiple times there will be instances that cannot be killed anymore, the reference to `ws` is lost forever.

Now, with our newly discovered pattern

```js
export function listen(onEvent) {
  const ws = new WebSocket("wss://example.com");
  ws.onmessage = onEvent;

  return () => {
    ws.close();
  };
}
```

With the added benefit that the code is now more concise, everything is isolated, this module doesn't need to keep a local state, and you just cannot `close` until you have actually opened the connection.

## Conclusion

Next time you are dealing with a long-lived effect, try to play with the idea of returning the function that will kill the effect, and see how it works for you.

I lately implemented it for [Wire's webapp connection to the WebSocket](https://github.com/wireapp/wire-web-packages/blob/eebabf50943170b87f1c8aa6d8cbf4527e9a9238/packages/core/src/Account.ts#L677-L681), and I am totally sold 🚀
