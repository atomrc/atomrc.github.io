---
title: "Compiling your TypeScript library (2023 edition)"
tags: ["typescript", "library", "compiler"]
excerpt: "A quick comparison of the tools available for building TypeScript libraries in 2023: tsup, swc, esbuild and tsc"
lang: en
date: 2023-01-21
---

When we talk about compling TypeScript projects there are usually two different contexts that are often mixed together: compiling a library vs compiling an application.

Those two contexts have slightly different constraints and need to be considered separately.

Today I'm going to focus on **compiling a TypeScript library into a JavaScript package** :)

## The wishlist

In order to build a nice library that is suited for most projects, we want our package to be:

- type-checked when consumed in a TypeScript project;
- consumable in both `commonjs` and `esmmodule` projects.

According to those wishes, we need to:

- generate and package the declaration files (`.d.ts`);
- be able to compile for different module targets.

## Considered solutions

Today, we are going to benchmark the following solutions:

- [tsc](https://www.typescriptlang.org/docs/handbook/compiler-options.html) - the native TypeScript compiler
- [esbuild](https://esbuild.github.io/) - a full-fledged bundler and superfast compiler written in `go`
- [swc](https://swc.rs/) - a full-fledged bundler and superfast compiler written in `rust`
- [tsup](tsup.egoist.dev/) - a TypeScript library builder based on `esbuild`

Side note: I have excluded tools that are only bundlers (`webpack`, `rollup`, ...) and `babel` which was superseded by `swc` and `esbuild`.

| compiler | `d.ts` generation | multiple module targets |
| -------- | ----------------- | ----------------------- |
| esbuild  | ❌                | ❌                      |
| swc      | ❌                | ❌                      |
| tsc      | ✅                | ❌                      |
| tsup     | ✅                | ✅                      |

By comparing features, there is already something that stands out: **only `tsup` can generate declarations files (`.d.ts`) and target multiple package type out of the box**.

This is not a showstopper, though!  
Nothing is preventing us from running the compilation twice for different module targets.  
And for the `d.ts` generation, we could rely on `tsc --emitDeclarationOnly` to generate them for us.
(Both are actually what `tsup` is doing under the hood).  
It's worth noting that those processes do not step on each other's toes, so we could run both compilation in parallel :)

Here would be the equivalent commands for all the tools we are going to evaluate:

**esbuild**

```sh
esbuild src/*.ts --format=esm --outdir=./lib/esm &
esbuild src/*.ts --format=cjs --outdir=./lib/cjs &
tsc --emitDeclarationOnly --outDir ./lib/types
```

**tsup**

```sh
tsup src/*.ts --format esm,cjs --dts -d=./lib
```

**swc**

```sh
swc -d ./lib/esm -C module.type=es6 src/*.ts &
swc -d ./lib/cjs -C module.type=commonjs src/*.ts &
tsc --emitDeclarationOnly --outDir ./lib/types
```

**tsc**

```sh
tsc --module esnext --outDir ./lib/esm &
tsc --module commonjs --outDir ./lib/cjs
```

## Benchmark

This benchmark will be all but scientific. I just tested compiling a library that has a single TypeScript file on the shittiest computer I have at home (a MacBook Air from 2013 with 4GB of RAM and a 1,3 GHz Dual-Core Intel Core i5). Every compiler is run 10 times (so very little samples).
This is just to give us a rough idea of how they could perform.  
Please take this benchmark with a grain of salt!

| compiler | min    | mean   | max    |
| -------- | ------ | ------ | ------ |
| esbuild  | 3585ms | 4083ms | 6273ms |
| swc      | 3784ms | 4080ms | 4876ms |
| tsup     | 3727ms | 4254ms | 6506ms |
| tsc      | 4590ms | 5655ms | 9331ms |

Just to highlight how generating `d.ts` with `tsc` is costy, here is the same benchmark in which we skip generating declaration files:

| compiler (no `d.ts`) | min    | mean   | max    |
| -------------------- | ------ | ------ | ------ |
| esbuild              | 1262ms | 1648ms | 2324ms |
| swc                  | 1736ms | 2547ms | 3537ms |
| tsup                 | 1102ms | 1371ms | 2003ms |
| tsc                  | 4611ms | 5276ms | 6288ms |

This is an order of magnitude different, but we can note that `tsc` is performing pretty much the same when not asked to generate types.

## Conclusion

One sad realization that I had while putting up together this benchmark is that **no matter how fast the compiler is, it's always going to be at least as slow as `tsc --emitDeclarationOnly`)**.

My personnal benchark isn't really significant when it comes to performances comparisons... But we can clearly identify that `tsc` is the looser!

Now, with its built-in support for declaration files generation and multiple targets in my opinion **`tsup` is the winner! It is tailored for building libraries!**   
Having only a single command to write to compile our libraries means it easier for maintenance and if, in the future, `tsup` figure out a way to generate `d.ts` files faster we will benefit from it by upgrading our local version.
