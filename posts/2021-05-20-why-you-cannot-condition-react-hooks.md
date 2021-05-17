---
title: "Monitoring: A case study for EventTarget"
categories: [eventtarget, monitoring, architecture]
description: Lately, at Deezer, I have been implementing monitoring for a feature I was working on. I took this opportunity to document how I designed the monitoring mechanism to be as non-intrusive as possible
lang: en
---

If you've used react hooks along with the `eslint-plugin-react-hooks`, you might have encountered the unexpected warning `React Hook "useState" is called conditionally.`.  
One can be quite surprised by this warning. At least I was.

Back then, I had already seen a similar pattern with `knockoutjs`: putting an observable inside a conditional when creating a `computedObservable` would completly break the dataflow and have unpredictable outcomes.

The reason for this in `knockoutjs` was that it was doing automatic subscription when the observable was first created. Knockout did some kind of dry run to identify which observables were needed for you `computedObservable` to work. So it was only subscribing to observables that have been called during the dry run and not those you are guarded by a condition. (note: this was back in 2019, maybe knockout has changed since, I do not know).

I though this was a pretty bad design flaw and was really suprised a modern tool, like React, would allow for such a weakness.  
Just like I did with Knockout, I decided to investigate and deep dive into how React Hooks work and why then could not properly work when put behind a condition.

## TLDR;

To summarize my discoveries:

- the hooks system is a quite big statefull machine that records every call to any hook (`useEffect`, `useState` ...);
- At component mount time, all react Hooks must be called that that they are registered against the hooks system;
- The order at which React Hooks are called must be stable through time and renders;

## Our working example

Through this article we are going to take a quite representative example composed of two components that call multiple hooks.

I am not going to use `JSX` in this article because it hides one function call that is important for what we want to illustrate in this article: `React.createElement`.
So we will directly use `createElement` from the `React` package.

```js
function Child() {
  const [state, setState] = useState(0);
  useEffect(() => console.log("I am child"));
  return createElement(
    "button",
    { onClick: () => setState(state + 1) },
    "+ child"
  );
}
```

```js
function Parent() {
  const [state, setState] = useState(0);
  useEffect(() => console.log("I am parent"));

  return createElement(
    Child,
    undefined,
    createElement("button", { onClick: () => setState(state + 1) }, "+ parent")
  );
}
```
