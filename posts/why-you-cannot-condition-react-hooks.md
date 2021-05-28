---
title: "Why React Hooks cannot be conditioned"
tags: [react, react-hooks, api-design]
excerpt: Did you know that you cannot condition React Hooks? Here is the reason why
lang: en
date: 2021-05-30
---

If you've used [React hooks](https://reactjs.org/docs/hooks-intro.html) along with the [`eslint-plugin-react-hooks`](https://github.com/facebook/react/tree/master/packages/eslint-plugin-react-hooks), you might have encountered the unexpected warning `React Hook "useState" is called conditionally.`.  
One can be quite surprised by this warning. At least I was.

Back then I had already seen a similar pattern with [`knockoutjs`](https://knockoutjs.com/) and I though it was a pretty bad design flaw. I was puzzled a modern tool, like React, would allow for such a weakness.

So I decided to investigate and deep dive into how React Hooks work and why they cannot be conditioned.

## TLDR

- the hook system is a quite big stateful machine that records every call to any hook (`useEffect`, `useState` ...);
- at component's mount time **all** React hooks must be called so that they are registered against the hook system;
- the order at which React hooks are called in a component must be stable through time and renders.

## Disclaimer

I ran my investigations against React `v17`. Other versions might work differently (I am pretty sure it does not).

Also bear in mind that the code you are going to see in the article is not actual code from the React codebase. It's my own interpretation of what I read in there. The names of variables and functions have been changed for the sake of simplicity.

## What happens when a hook function is called

Hook functions (`useState`, `useEffect`, ...) are rather interesting functions in that they are stateful at two levels:

- They mutate values in a global state;
- Depending when, in the component's lifecyle, they are called (`mount`, `update`, ...) they do not run the same code.

### At mount time

Let's take a very simple component as a working example:

```js
function Component() {
  const [first, setFirst] = useState("first");
  const [second, setSecond] = useState("second");
  return /*...*/;
}
```

When `React` mounts this component, it will create a state that is associated with the instance of the component. In this state it will store, among other things, a linked list of all the hooks that have been called during the mounting of the component.

So when `React` executes `Component()` any call to a `use*` function will create an entry in the linked list and we will end up with a state that looks like this:

```js
{
  value: "first",
  next: {
    value: "second",
    next: null, // End of the linked list
  },
};
```

Around a component initialisation, in React, we have code that looks like this:

```js
function render(Component) {
  // global variable that will be mutated by each and every use* call
  global.currentComponentHooks = null;
  // keeps track of the last hook that was mounted
  global.lastMountedHook = null;

  const children = Component();
  // [...]
}
```

If we try to guess the body of the `useState` (`useEffect` would be, somewhat, similar) it should look something like:

```js
function useState(value) {
  // Creates the new entry
  const hook = {
    value: value,
    next: null,
  };
  if (global.currentComponentHooks === null) {
    // If it is the first entry, stores it in the global object
    global.currentComponentHooks = hook;
  } else {
    // Add the current hook to the `next` property
    global.lastMountedHook.next = hook;
  }
  // Keep track that this hook is the last one we mounted
  global.lastMountedHook = hook;
  // [...]
  return [value, updateState]; // finally returns the initial value plus an update function
}
```

With the component we had earlier this is what the `global.currentComponentHooks` will look like as lines are executed:

```js
function Component() {
  // null
  const [first, setFirst] = useState("first");
  // {value 'first', next: null}
  const [second, setSecond] = useState("second");
  // {value 'first', next: {value: 'second', next: null}}
  return /*...*/;
}
```

### At update time

Let's imagine something happened on the UI level and `setFirst('updated')` was called.

_I am not going to describe how the `setFirst` function behaves. Just bear in mind that it is bound to the relevant entry in the linked list and simply mutates the `value` property. It then triggers a re-rendering on React's side._

At mount time we have stacked our different hooks in a linked list. At update time we are going to traverse our linked list and read each stored value.

On React's side we need to create a pointer that will point to the root of our linked list before we re-render our component.

```js
function update(Component) {
  global.currentHook = global.currentComponentHooks; // {value 'first', next: {value: 'second', next: null}}
  const children = Component();
  // global.currentHook === null
}
```

It means that the body of the `useState` function must have changed.

```js
/* note that we do not need the initial value anymore */
function useState(/*value*/) {
  const hook = global.currentHook;
  global.currentHook = hook.next; // we move the pointer to the next hook
  // [...]
  return [hook.value, updateState];
}
```

And from our component's context this is how the `currentHook` pointer evolves.

```js
function Component() {
  // {value 'updated', next: {value: 'second', next: null}}
  const [first, setFirst] = useState("first"); // first === 'updated' our mutated state
  // {value 'second', next: null}
  const [second, setSecond] = useState("second"); // second === 'second' the unchanged initial state
  return /*...*/;
}
```

## So... Why can't we condition a hook?

Now that we have seen the internals of how hooks work, let's see what would happen if we conditioned one of them.
A (arguably!) valid scenario for conditioning a hook would probably be triggering an `effect` depending on some props. (Note that, just like `useState`, `useEffect` are also added the the linked list of all the hooks of a component)

```js
const Component({doEffect}) {
  const [first, setFirst] = useState(0);
  if (doEffect) {
    useEffect(/*...*/)
  }
  const [second, setSecond] = useState(0);
}
```

Now let's say that the component will mount with `{doEffect: false}`.
We will end up with that linked list:

`{value: 0, next: {value: 0, next: null}}`

We only have two elements and the `useEffect` does not exist in our list.

If ever `doEffect` switches to `true` we will now try to access a hook that was not registered

```js
function Component({ doEffect }) {
  // {value: 0, next: {value: 0, next: null}}
  const [first, setFirst] = useState(0);
  if (doEffect) {
    // {value: 0, next: null}
    useEffect(/*...*/); // ⚠️ Wrong hook here
  }
  // null
  const [second, setSecond] = useState(0); // ⚠️ No hook left!!
}
```

In order to fix this, we just need to move our condition inside the body of the `useEffect` hook (and not forget to add it in the dependency of the `useEffect`)

```js
useEffect(() => {
  if (doEffect) {
    // Do your magic
  }
}, [doEffect]);
```

## Conclusion

React Hooks have quite changed how we write React apps. As a React user, I find being able to write only functional components (as opposed to class components) to be very pleasant!

But this comfort comes at a price:

- hooks feel like black magic and make the lifecycle of the component hard to grasp (and actually you should probably [not think in lifecycles](https://kentcdodds.com/blog/react-hooks-pitfalls#pitfall-3-thinking-in-lifecycles));
- we need stricts rules regarding how hooks are called.

I would also add that all those states inside the React codebase make the flow pretty hard to follow and understand. I can not thank enough my debugger for the step-by-step execution. Without it, this article would probably not exist 😅!!

Although the `eslint-plugin-react-hooks` is almost always included in any React codebase, needing a special `eslint` rule feels like a somewhat serious design flaw. That being said, and in my humble opinion, this is an acceptable tradeoff though :)
