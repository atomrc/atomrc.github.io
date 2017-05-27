---
title: "You might not need this"
categories: [javascript, this]
description: "`this`, the least understood keyword of the JavaScript language. What if I told you that you might not need it?"
lang: en
---

What can you deduce from this piece of code?

```javascript
function compute() {
  const a = 1
  return a + 1
}
```

It's pretty safe to say that it will always return the same value (`2` in our case). I can replace any occurences of `compute` in my program by `2` and everything will work as expected.

Now, what can you deduce from that piece?

```javascript
function compute() {
  return this.val + 1
}
```

We cannot deduce much, can we?  
Will it crash? Will it return a `Number`? Will it return a `String`? ... We don't know!

Those 3 lines of code are not enought to start deducing!  
We need to look elswhere to resolve this issue.

```javascript
const a = {
  val: 1,
  compute: function compute() {
    return this.val + 1
  }
}

a.compute() // -> 2
```

This scenario is easy to read and we didn't had to dig too much to know that the function call returns `2`. But consider this other scenario:

```javascript
const a = {
  val: 1,
  compute: function compute() {
    return this.val + 1
  }
}

const computeA = a.compute.bind(a) // bind the `this` of compute

// tons of lines of code that can mutate a.val

computeA() // -> ???
```

## It's all about explicitness

One can argue that the two functions do not do the same thing.  
That's right, they don't!  
The first returns always the same value while the other returns a value according to some external variable.

But, the thing is, the two functions have the same **signature** `function () {}`.  
That's exactly the problem: from the outside **you cannot tell that this function depends on an external value**!

If we wanted our functions to do the same thing, their signatures should be:

- `function (a) {}` for the version without external dependencies ;
- `function () {}` for the version with `this`.

You can also argue that the version with `this` is twisted and that we usually call methods with the bound object next to the call (like `a.compute()`). In that case it becomes obvious that the function is tied to an object and that the result depends on it (...maybe).

But that the thing with JavaScript: **it is dynamic**, you can change which object is bound to a function at run time.

## The beauty of functions

Functions are [first class citizen in JavaScript](http://ryanchristiani.com/functions-as-first-class-citizens-in-javascript/), which means you can treat them as any other object, you can pass them around to other functions or return them.

Due to the asynchronous nature of JavaScript, you actually pass functions around a lot.

```javascript
fetch("/resource")
  .then(callback) // <- callback is a function

setTimeout(callback, 200) // <- callback is a function
```

When functions passed around are actually methods (bound to a `this`), they loose the binding with the object they belong to. To keep that binding, you need to explicitly bind them to the object again.

```javascript
setTimeout(a.compute, 200) // will trigger an error because `this` is undefined

setTimeout(a.compute.bind(a), 200) // `this` is defined again
```

In my opinion, **functions should be building blocks that take some arguments and return a result depending on those arguments**, and only those arguments. This is what functional programming is about (see [Why Functional Programming Matters](https://www.cs.kent.ac.uk/people/staff/dat/miranda/whyfp90.pdf)), and this is where the front-end is heading ([Why Learn Functional Programming in JavaScript? (Composing Software)](https://medium.com/javascript-scene/why-learn-functional-programming-in-javascript-composing-software-ea13afc7a257), [Master the JavaScript Interview: What is Functional Programming?](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-functional-programming-7f218c68b3a0), [Ramda](http://ramdajs.com/), [lodash](https://lodash.com/), [Redux](https://github.com/reactjs/redux) ...)

## Moving the state away

So we can ask the question: What does `this` do for us?

Common response: it allows us to write logic close to our models. After all, this is what OOP is about.

The way I see it: it allows us to write **statefull functions**. Functions that can produce different results given the exact same parameters.

If `this` is about state, we should be able to move the state away and bring back our **stateless functions** on the table. Yes, it is pretty much a matter of moving the `this` as an argument of functions.

```javascript
function () {
  return this + 1
}

// becomes

function (a) {
  return a + 1
}
```

## Some benefits

 TypeScript's documentation has an [article dedicated to `this`](https://github.com/Microsoft/TypeScript/wiki/%27this%27-in-TypeScript).

method chainining ([].map().filter().reduce()) impossible without `this`

=================================================

Let's consider the following beauty:

```javascript
function fct() {
  // code
}
```

This is the simplest form of function you can write.

Now, if I tell you that this function **is pure** and does not read the `arguments` object then you can deduce an interesting fact about this function: it's basically **a constant**. I can replace every call to `fct` with the value it's returning, my program would still work!

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

## What does this have to do with `this`?

In JavaScript, mainly because of the dynamic nature of the language and because it was not designed as a purely functional programming language, there are few ways for a **function with no arguments to return something different** at each call.

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
var data = { val: 1 }

function fct() {
  return this.val
}
const boundFct = fct.bind(data);

boundFct() // 1
data.val = 2 // modify the bound variable
boundFct() // 2
```

*The case of the `arguments` object is a bit peculiar and doesn't break purity of functions at all. I put it here just to show you that you cannot trust JavaScript functions signature. This object actually has some pretty cool use cases and we won't talk about it in the rest of the post*

## Predictability is key

In the first example I showed you, you didn't need anything else than the function's signature to tell the function always returns the same value. Well, because we are talking about JavaScript and that you have no way to ensure that functions are pure, you also need to read the body of the function to have the guarantee that it is actually pure. But that's all, you don't need to read anything else to know what the function does.

In the other exemples, you need to know the execution context of the function to understand what it will return. Said otherwise: you need to track down every single mutation that is applied to the variable (either `this` or `parentVar`) to be able to predict what the function will return.  
Tracking down every mutation can be pretty hard depending on how many scopes the variable is accessible from.

Worst case:

```javascript
function main() {
  var a = { val: 1 } // somewhat global variable

  // ⚠ tons of lines of code that can mutate a

  var boundFct = function () {
    return this.val
  }.bind(a)

  // ⚠ tons of lines of code that can mutate a

  boundFct() // ??
}
```

Slightly better case:

```javascript
function main() {
  // 👍 your a is safe here

  (function () { // < new scope
    var a = { val: 1 } // less global variable

    var boundFct = function () {
      return this.val
    }.bind(a)

    boundFct() // 1
  }())

  // 👍 your a is safe here
}
```

And the next step is, naturally:

```javascript
function main() {
  // 👍 your a is safe here

  function fct() {
    var a = { val: 1 } // local variable
    return a.val
  }

  fct() // 1

  // 👍 your a is safe here
}
```

**The less code you have to read to understand a function, the more pretictable it is!**
