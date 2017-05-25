---
title: "You don't need this"
categories: [javascript, this]
description: "`this`, the least understood keyword of the JavaScript language. What if I told you that you don't need it?"
lang: en
---

Let's consider the following beauty:

```javascript
function fct() {
  // code
}
```

This is the simplest form of function you can write.

Now, if I tell you that this function **is pure** and does not read the `arguments` object then you can deduce an interesting fact about this function: it's basically **a constant**.

So little code can tell you that this function will **always return the same value**.

If you think about this, there is no other way to implement this function but to return a constant value (again under the assumption that the function is pure and not using the `arguments` object)

```javascript
function fct() {
  // code that generates `something`
  return something
}
```

`something` is either a `string`, an `object`, an `array` or whatever you like but I can tell you that it's always going to be the same thing.

In fact, in Haskell (a pure functional programming language) a constant (read a value) is simply a function that takes no arguments. Just like our `fct` function.

## What does this has to do with `this`?

In JavaScript, mainly because of the dynamic nature of the language and because it was not designed as a purely functional programming language, there are many ways for a **function with no arguments to return something different** at each call.

Hidden parameters:

```javascript
function fct() {
  return arguments[0] * 2
}

fct(1) // 2
fct(2) // 4
```

Parent scope's variable or function:

```javascript
var parentVar = 1

function fct() {
  return parentVar
}

fct() // 1
parentVar = 2
fct() // 2
```

And, of course, `this`:

```javascript
function fct() {
  return this
}

fct.bind(2)() // 2
fct.bind(3)() // 3
```

