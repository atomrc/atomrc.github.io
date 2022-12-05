---
title: "flatMap as an alternative to filter + map?"
tags: [JavaScript, functional programming, array]
excerpt: Where I discuss the idea of replacing filter + map calls to a single flatMap call
lang: en
date: 2022-12-10
---

Here is a quick recap of all the possible operations we usually do with arrays:

_(where `a{n}` specifies the signature of an array of size `n` of elements of type `a`)_

| operation       | method    | constraints                |
| --------------- | --------- | -------------------------- |
| `a{n} => b{n}`  | `map`     | ∅                          |
| `a{n} => a{m}`  | `filter`  | `m <= n`                   |
| `a{n} => a{m}`  | `flatMap` | ∅                          |
| `a{n} => a'{m}` | `filter`  | `m <= n && a' subset of a` |
| `a{n} => b{m}`  | `flatMap` | ∅                          |
| `a{n} => b`     | `reduce`  | ∅                          |

Today, I'd like to discuss the `a{n} => b{m}` operation.

## Filtering and transforming an array in a single operation

We usually tend to treat the `a{n} => b{m}` use case with a combination of `filter + map`.  
Which is equivalent to doing this chain of operations `a{n} => a'{m} => b{m}` (where `a'` is a subset of `a`, eg. `(User | undefined) => User`).

[`flatMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap) can help us to avoid this intermediate step and go straight from `a{n}` to our desired `b{m}` array.

Let's consider the following example:

```js
const elements = [16, 20, null, 30, null];

const strings = elements //               (null|number){5}
  .filter((item) => !!item) //            number{3}
  .map((item) => item.toString("16")); // string{3}
```

Ultimately, here, we want to transform an array of 5 `null|number` into an array of 3 `string`. We want to change both the number of items **and** the types of the items.

With `flatMap` we can achieve the same in a single run

```js
const strings = elements.flatMap((item) =>
  !!item ? [item.toString("16")] : []
);
```

## Better TypeScript inference

`filter` has a rather **poor TypeScript integration when it comes to changing types** (see this GitHub issue: [Type guards in Array.prototype.filter](https://github.com/microsoft/TypeScript/issues/7657)). Filtering an array that contains `A|B|...` to an array that only contains a subset of those types **does not benefit from any type inference**.

One very common occurrence of this is to filter out `falsy` values (`undefined`, `null` ...) from an array.

In this case, you need to write a [user-defined type guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards) in order to have TypeScript understanding the type of your resulting array.

```ts
const array = [1, 2, "three", "four"];
//    ^ (string|number)[]

const numbers = array.filter((item) => typeof item === "string");
//    ^ (string|number)[] ❌

const numbers = array.filter(
  (item): item is string => typeof item === "string"
);
//    ^ string[] ✅
```

User-defined type guards are pretty nice, but they have a **major flaw: they are user-defined**. Meaning, you can actually lie to TypeScript.
For example, this is valid TypeScript 🙃:

```ts
function isArray(arg: any): arg is string {
  return typeof arg === "number";
}
```

Now the same filtering with `flatMap`

```ts
const numbers = array.flatMap((item) =>
  typeof item === "string" ? [item] : []
);
//    ^ string[] ✅
```

Here the TypeScript inference system kicks in and automatically detects the type of your resulting array.

## Conclusion

Lately, I got used to replacing all my `filter + map` with `flatMap`. My code tend to be a bit **more concise**, but the main takeaway for me is the **automatic type inference**.
There is a [minor performance boost with `flatMap`](https://www.measurethat.net/Benchmarks/Show/11827/0/flatmap-vs-filtermap) but not significant enough to make it a solid argument, in my opinion.

One could argue that `flatMap` is harder to understand. I believe that it's just a matter of getting used to it.

In the end, choosing `flatMap` over `filter + map` boils down to personal preferences (and agreement with your team). As long as you maintain consistent convention, it is all fine!

So give a try to `flatMap` and see for yourself how you feel about it 🙂
