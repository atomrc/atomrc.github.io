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

In the first exemple I showed you, you didn't need anything else than the function's signature to tell the function always returns the same value. Well, because we are talking about JavaScript and that you have no way to ensure that functions are pure, you also need to read the body of the function to have the guarantee that it is actually pure. But that's all, you don't need to read anything else to know what the function does.

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
