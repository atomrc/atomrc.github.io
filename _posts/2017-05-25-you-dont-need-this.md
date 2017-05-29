---
title: "You might not need this"
categories: [javascript, this]
description: "`this`, the least understood concept of the JavaScript language. What if I told you that you might not need it?"
lang: en
---

Consider the following beauty:

```javascript
function compute() {
  //
}
```

If I tell you that this function **is pure** (a **pure function**, is a function which return value will always be the same given the same arguments), then you can easily deduce an interesting thing from those 3 lines: the function `compute` will always return the same value.  
`compute` is, basically, **a constant**.

In JavaScript, it is very easy to break the purity of a function thus breaking the deduction we made earlier about `compute` being a constant.

One way to break purity, would be reading some external variable:

```javascript
function compute() {
  return ext.val; // ext is some object defined in a parent scope
}
```

... And that external variable could be `this`:

```javascript
function compute() {
  return this.val;
}
```

We now have a way to change the returned value of `compute` **from outside the function**.

```javascript
const a = {
  val: 1,
  compute: compute
}

a.compute() // 1
a.val = 2
a.compute() // 2
```

You might be thinking that, at least, with a method call the bound object is never too far from the call making it explicit that the returned value depends on that object!  
Most of the time, is it true, but it is easy to find a counter example:

```javascript
const ext = { val: 1 }
// create a function bound to `ext`
const compute = function () { return this.val }.bind(ext)

compute() // 1
ext.val = 2
compute() // 2
```

## The misunderstood `this`

`this` is probably the most misunderstood concept of the JavaScript language.  
People coming from classical Object Oriented Programming languages often mistaken `this` for an instance of the class the method is in.

A better definition of `this` in JavaScript would be:

> `this` represents the object which *owns* the method being called

And, due to the dynamic nature of JavaScript, function ownerships often change at runtime.

Functions are [first class citizen in JavaScript](http://ryanchristiani.com/functions-as-first-class-citizens-in-javascript/), which means you can treat them as any other object: passing them around to functions or returning them.

Due to the asynchronous nature of JavaScript, you actually pass functions around a lot.

```javascript
fetch("/resource")
  .then(callback) // <- callback is a function
```

When the functions passed around are actually methods, they lose the binding with their initial object:

```javascript
const a = {
  callback: function () {
    console.log(this);
  }
}

fetch("/resource")
  .then(a.callback) // <- `this` is undefined
```

To fix this, you need to manually bind the method to its owning object:

```javascript
fetch("/resource")
  .then(a.callback.bind(a)) // <- `this` is defined again
```

`this` is such a mess for newcomers that TypeScript's documentation has an [article dedicated to it](https://github.com/Microsoft/TypeScript/wiki/%27this%27-in-TypeScript).

## Functions are about logic, `this` is about state

So we can ask the question: What does `this` do for us?

Common response:

>`this` allows us to write logic close to our models. After all, this is what OOP is about.

The way I see it:

>`this` allows us to write **statefull functions**. It's a way to embed some state into a function

In my opinion, **functions should be building blocks that take some arguments and return a result depending on those arguments, and only those arguments**.  
This is what functional programming is about (see [Why Functional Programming Matters](https://www.cs.kent.ac.uk/people/staff/dat/miranda/whyfp90.pdf)), and this is where the front-end is heading ([Why Learn Functional Programming in JavaScript? (Composing Software)](https://medium.com/javascript-scene/why-learn-functional-programming-in-javascript-composing-software-ea13afc7a257), [Master the JavaScript Interview: What is Functional Programming?](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-functional-programming-7f218c68b3a0), [Ramda](http://ramdajs.com/), [lodash](https://lodash.com/), [Redux](https://github.com/reactjs/redux) ...)

## The separation of logic and state

Getting rid of `this` is as easy as replacing every occurrences of `this` by a new parameter.

```javascript
function compute() {
  return this.val + 1
}

// becomes

function compute(a) {
  return a.val + 1
}
```

The second version of `compute` has some nice benefits:

- it is **pure** (only depends on its inputs);
- the signature explicitly implies that it depends on some input `a`.

Well, to remove `this` from your functions you would also have to change every function calls. Not the funniest part, I agree.

Taking away `this` from your developer's life is a great opportunity for you to leverage the full power of functions and finally start diving into **functional programming**.

In the process, you will learn how to write very simple functions and compose them together to create fully functional user interfaces.

[Ramda](http://ramdajs.com/) (or [Lodash](https://lodash.com/)) will be powerful allies in this quest.

## Conclusion

I personally don't like `this` and try to avoid it as much as I can, but, don't get me wrong, `this` is not evil and most JavaScript developers will know how to deal with it.  
Sometime you don't really have the luxury of being able to choose to use it or not. If you use React, for example, the first **statefull** component you will write will have to use `this` (which make sense when you have in mind that `this` is about state).

That being said, removing `this` will allow you to:

- make your function signatures more explicit;
- isolate your state and model from your logic;
- avoid any unexpected behavior due to the misunderstanding of the `this` concept.

Also, it's seems like a perfect excuse to finally learn to love functions and to dive into functional programming. That should be an exciting perspective for some of you at least :)
