---
title: "Dealing with long-lived effects like React would"
tags: [javascript, reactive programming, rxjs, react, useEffect]
excerpt: "Let's inspire from React's useEffect pattern to build easy-to-use and encapsulated effectful APIs"
lang: en
date: 2022-12-23
---

React's `useEffect` forces you to implement a quite powerful pattern: the **cleanup function pattern** (or teardown function pattern).  
Let's see how we could leverage this pattern to provide **perfect isolation** and make **useless calls impossible**.

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

- it brings **perfect isolation**;
- it makes **useless calls impossible**.

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

### Perfect isolation

The main problem with the previous code sample is that you need to leak the DOM element (`button`), the event (`click`) and the callback (`sendPayload`) to the part of the code that will call the `removeEventListener`.  
Most of the time it's going to be the same module, so it's not such a big deal, but it would be better not to have to keep those three references around.

Thanks to the cleanup function, we only need to keep a **single reference** in order to remove the listener:

```js
const sendPayload = () => {
  /*...*/
};
const button = document.getElementById("the-button");

const removeListener = addEventListener(button, "click", sendPayload);
//    ^ removeListener is the only reference we need to keep
removeListener();
```

Now, we don't even need to keep references for the button, the action nor the callback. The only thing we need to keep track of is the `removeListener` function. All the rest (the button, the action and the callback) are **isolated in the cleanup closure**.

So we could even inline everything

```js
const removeListener = addEventListener(
  document.getElementById("the-button"),
  "click",
  () => {}
);
```

⚠️ _I **would not** suggest inlining code like the previous code sample. This example is there just to highlight that it is possible._

### Useless calls become impossible

Let's consider the following examples:

```js
const sendPayload = () => {};

button.removeEventListener("click", sendPayload);
// ❌ Useless call, the listener has not been added yet (temporal coupling)

button.addEventListener("click", sendPayload);

button.removeEventListener("click", () => sendPayload());
// ❌ The listener is not removed because the reference to the function has changed

button.removeEventListener("auxclick", sendPayload);
// ❌ this is a useless call since we never added a `auxclick` listener
```

Those calls are made impossible with the cleanup function pattern. If you do not have the reference to the `cleanupFunction` that you first created by triggering the effect, there is nothing you can do! We are preventing what is called a [temporal coupling](https://betterprogramming.pub/temporal-coupling-in-code-e74899f7a48f).

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
