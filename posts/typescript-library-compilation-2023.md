---
title: "Compiling your TypeScript library (2023 edition)"
tags: ["typescript", "library", "compiler"]
excerpt: "A quick comparison of the tools available for building TypeScript libraries in 2023: tsup, swc, esbuild and tsc"
lang: en
date: 2023-01-21
---

<style>
    .winner {color: green;}
    .loser {color: red;}
</style>

When we talk about compling TypeScript projects there are usually two different contexts that are often mixed together: compiling a library vs compiling an application.

Those two contexts have slightly different constraints and need to be considered separately.

Today I'm going to focus on **compiling a TypeScript library into a JavaScript package** :)

## The wishlist

In order to build a nice library that is suited for most projects, we want our package to be:

- type-checked when consumed in a TypeScript project;
- consumable in both `commonjs` and `esmodule` projects.

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
swc -C module.type=es6 src/*.ts -d ./lib/esm &
swc -C module.type=commonjs src/*.ts -d ./lib/cjs &
tsc --emitDeclarationOnly --outDir ./lib/types
```

**tsc**

```sh
tsc --module esnext --outDir ./lib/esm &
tsc --module commonjs --outDir ./lib/cjs
```

## Benchmark

This benchmark will be all but scientific!  
I just tested compiling a library that has a single TypeScript file on Github CI. Every compiler is run 30 times, which mean we have very little samples.  
This is just to give us a rough idea of how they could perform.  
Please take this benchmark with a grain of salt!

(Here are the [benchmark sources](https://github.com/atomrc/ts-lib-benchmark) and the [results on Github Actions](https://github.com/atomrc/ts-lib-benchmark/actions))

| compiler | min                                | mean                               | max                                |
| -------- | ---------------------------------- | ---------------------------------- | ---------------------------------- |
| esbuild  | <span class="winner">1704ms</span> | <span class="winner">1812ms</span> | 2365ms                             |
| swc      | 1794ms                             | 1855ms                             | <span class="winner">1908ms</span> |
| tsup     | 2001ms                             | 2034ms                             | 2085ms                             |
| tsc      | <span class="loser">2160ms</span>  | <span class="loser">2215ms</span>  | <span class="loser">2420ms</span>  |

Just to highlight how generating `d.ts` with `tsc` is costly, here is the same benchmark in which we skip generating declaration files:

| compiler (no `d.ts`) | min                               | mean                              | max                               |
| -------------------- | --------------------------------- | --------------------------------- | --------------------------------- |
| esbuild              | <span class="winner">414ms</span> | <span class="winner">427ms <span> | <span class="winner">500ms</span> |
| swc                  | 537ms                             | 550ms                             | 570ms                             |
| tsup                 | 559ms                             | 570ms                             | 587ms                             |
| tsc                  | <span class="loser">2119ms</span> | <span class="loser">2196ms</span> | <span class="loser">2783ms</span> |

This is an order of magnitude different expect for `tsc` that seems to yield the same results whether it generates declaration files or not.

There is no obvious winner between `swc`, `esbuild` and `tsup`, but we can see that `tsc` is constantly outperformed.

## Conclusion

One sad realization that I had while putting up together this benchmark is that **no matter how fast the compiler is, it's always going to be at least as slow as `tsc --emitDeclarationOnly`**.

My personnal benchark isn't really significant when it comes to performances comparisons... But we can clearly identify that `tsc` is the looser!

Now, with its built-in support for declaration files generation and multiple targets in my opinion **`tsup` is the winner! It is tailored for building libraries!**  
Having only a single command to write to compile our libraries means it easier for maintenance and if, in the future, `tsup` figure out a way to generate `d.ts` files faster we will benefit from it by upgrading our local version.
