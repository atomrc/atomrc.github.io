---
title: "Why you cannot condition React Hooks"
tags: [react, react-hooks, javascript]
excerpt: TODO
lang: en
date: 2021-05-20
---

If you've used react hooks along with the `eslint-plugin-react-hooks`, you might have encountered the unexpected warning `React Hook "useState" is called conditionally.`.  
One can be quite surprised by this warning. At least I was.

Back then, I had already seen a similar pattern with `knockoutjs`: putting an observable inside a conditional when creating a `computedObservable` would completly break the dataflow and have unpredictable outcomes.

I though this was a pretty bad design flaw in `knockoutjs` and was quite suprised a modern tool, like React, would allow for such a weakness.  
So I decided to investigate and deep dive into how React Hooks work and why then could not properly work when put behind a condition.

## TLDR;

To summarize my discoveries:

- the hooks system is a quite big stateful machine that records every call to any hook (`useEffect`, `useState` ...);
- At component mount time, all react Hooks must be called that that they are registered against the hooks system;
- The order at which React Hooks are called must be stable through time and renders;

## Our working example

Through this article we are going to take a quite representative example composed of two components that call multiple hooks.

```js
function Component() {
  const [state, setState] = useState(0);
  useEffect(() => console.log("update from Component"));
  return /*...*/;
}
```
