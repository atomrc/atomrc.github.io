---
title: "flatMap: an alternative to filter + map"
tags: [javascript, functional programming, array]
excerpt: Where I discuss the idea of replacing filter + map calls with a single flatMap call
lang: en
date: 2022-12-10
updated: 2022-12-14
---

Filtering out `falsy` values or making sure we are dealing with the correct type before mapping are very common scenarios in webapps.  
We often tend to use `filter(...).map(...)` to cover those use-cases.

But if we breakdown the type signature of a `filter + map` operation, we come to realize that there is an operator that is tailored for this: `flatMap`.

>_I'm going to use the notation `A[n]` to specify the signature of an array of size `n` of elements of type `A`_

## The `filter + map`'s signature

When analyzing the resulting type of a `filter + map` call, we find this:

- `filter`: `A[n] => A'[m]` (where `A'` is a subset of `A` and `m <= n`)
- `map`: `A'[m] => B[m]`

So chained together, a `filter + map` has this signature: `A[n] => B[m]`

...Which is exactly what the [`flatMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap) operator is about: changing an array in both **type and size**!

## Filter-mapping an array in a single operation

How about we try to avoid this intermediate step and go straight from `A[n]` to our desired `B[m]` array?

Consider the following example:

```js
const elements = [16, 20, null, 30, null];

const strings = elements //               (null|number)[5]
  .filter((item) => !!item) //            number[3]
  .map((item) => item.toString("16")); // string[3]
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

Lately, I got used to replacing all my `filter + map` with `flatMap`. My code tend to be a bit **more concise**, but the main takeaway is the **automatic type inference**.
There is a [minor performance boost with `flatMap`](https://www.measurethat.net/Benchmarks/Show/11827/0/flatmap-vs-filtermap), but not significant enough to make it a solid argument, in my opinion.

One could argue that `flatMap` is harder to understand. I believe that it's just a matter of getting used to it.

In the end, choosing `flatMap` over `filter + map` boils down to personal preferences (and agreement with your team). As long as you maintain consistent convention, it is all fine!

So give a try to `flatMap` and see for yourself how you feel about it 🙂
