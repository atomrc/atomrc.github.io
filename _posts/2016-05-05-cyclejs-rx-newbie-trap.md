---
layout: post
title: "Cycle.js, RxJS and cold observables"
categories: [Cycle.js, RxJS]
description: "Lesson learned the hard way: never dive into Cycle.js (+RxJS) without understanding cold/hot observables"
---

Lately, I fell into a pretty tough [RxJS](https://github.com/Reactive-Extensions/RxJS) beginner trap while playing around with [Cycle.js](http://cycle.js.org/).

Here is the situation I was in:

- a parent component that creates a child component depending on a data stream;
- a child component that outputs an `action$` stream that is used in the parent component (depending on DOM events).

And the symptoms:

- the child component renders perfectly;
- I get the expected output if I subscribe to the `action$` stream **from inside the child component**;
- the `action$` stream does not output anything **from the parent component**.

The reason for that weird behavior: the way **cold observables** work (and, of course, the fact that I didn't took the time to read and understand the RxJS doc ... :( )

NB: As I am writing this article, Cycle.js is being generalized to work with any stream library (see [Cycle.js Diversity](https://github.com/cyclejs/core/issues/196)) and a stream library, specially designed for Cycle.js, is currently being built: [xstream](http://staltz.com/why-we-built-xstream.html). As xtream will be hot-observable-only, this article won't be relevant any more :)

## TLDR

Keep in mind that :

- cold observables replay the complete observable chain for each subscriber;
- before diving into Cycle.js be sure you know and understand all the different types of observables;
- just read this [introduction to observables](http://reactivex.io/rxjs/manual/overview.html#subject);
- also, have a look at this great [introduction to reactive programming](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)

## The situation

Ok let's go a little deeper into my newbie-trap.

Here is a simplified version of the situation I had.

The child component:

```javascript
function UserContainer({DOM, user$}) {
    const logAction$ = DOM
        .select(".log")
        .events("click")
        .map(() => "log");

    //this prints an output each time the button is clicked
    logAction$.subscribe(/*log*/);

    return {
        //the DOM output of the component
        DOM: user$.map((user) => div([
            span(".user-name", user.name),
            button(".log", "Log")
        ])),

        //the 'log' stream that is used in the parent
        logAction$: logAction$
    };
}
```

The `main` function that creates the child component:

```javascript
function main({DOM}) {
    const user$ = Observable.just({name: "felix"});

    //we map the user stream to an 'instance' of a UserContainer
    const userContainer$ = user$
      .map(user =>
          //from @cycle/isolate https://github.com/cyclejs/isolate
          isolate(UserContainer)({ DOM, user$: Observable.just(user) })
      )

    //keep a trace of the DOM evolution for the UserContainer component
    const userContainerDOM$ = userContainer$
      .map(container => container.DOM);

    //keep a link to the log action of the UserContainer
    const userContainerLogAction$ = userContainer$
      .flatMapLatest(container => container.logAction$);

    /*
     * /!\ here is the problem, this will never print anything
     * when the button is clicked !!
     */
    userContainerLogAction$.subscribe(/*log*/);

    return {
        DOM: userContainerDOM$
    };
}
```

If you want to play with it, here is a [jsbin I created to reproduce the bug](https://jsbin.com/ropaqa/edit?js,console,output)

To summary the symptoms I had:

- I had no trouble receiving `click` events if I subscribe from inside the child component namely `UserContainer`;
- for some reason I could receive any `click` events from the function where I build the `UserContainer` component.

## The ridiculously simple solution

So – without any more suspense – here is the ridiculously simple solution:

```diff
const userContainer$ = user$
  .map(user =>
      //from @cycle/isolate https://github.com/cyclejs/isolate
      isolate(UserContainer)({ DOM, user$: Observable.just(user) })
  )
+ .shareReplay(1)
```

## Explanation

Fixing a bug is a good thing, understanding it is a lot more valuable ;) So here is the explanation for that bug.

The main reason for that behavior is: the **way cold observable work** in RxJS. In fact a cold observable replays the whole observable sequence for each subscriber it has.

```javascript
const values$ = Observable
    .just("test") //this is a cold observable
    .do(() => console.log("here I am"))
    .map(() =>
        /* /!\ just for the exemple.
         * always avoid doing non deterministic
         * calls in your app's code
         */
        Math.floor(Math.random() * 10)
    );

value$.subscribe((value) => console.log("first sub: " + value));
value$.subscribe((value) => console.log("second sub: " + value));

/* output:
 * Here I am
 * first sub: 7
 * Here I am
 * second sub: 5
 */
```

As you can the, the log `Here I am` is printed twice and the first subscriber doesn't get the same value as the second subscriber (resp `7` and `5`).

I my case I have that piece of code that is building the `UserContainer` component:

```javascript
const userContainer$ = user$
    .map(user =>
        isolate(UserContainer)({DOM, user$: Observable.just(user)})
    )
```

And two streams that originate from the `userContainer$` stream:

```javascript
const userContainerDOM$ = userContainer$
    .map(container => container.DOM);

const userContainerLogAction$ = userContainer$
    .flatMapLatest(container => container.logAction$);
```

So that means:

- when `userContainerDOM$` is subscribed it creates a new `UserContainer` component (from the `userContainer$`);
- when `userContainerLogAction$` is subscribed it creates a new `UserContainer` component (from the `userContainer$`);

Which means that each stream has access to a different "instance" of `UserContainer` and that the log action we retrieve does not come from the same component as the DOM.  
In other words: we subscribe to events of a component that is not displayed on screen and, as such, does not receive any DOM event\*\*.  
\*\*this last statement is only true because the UserContainer is isolated (see [@cycle/isolate](https://github.com/cyclejs/isolate))

Now the `shareReplay(1)` solution does not transform the observable into a hot observable, it just tells the observable to keep the last produced element (that's what the `1` parameter is about) in memory to feed it to future subscribers. Which means that now, we are only creating a single `UserContainer` and that all the underlying subscribers will work on the same "instance".

## Conclusion

Cycle.js beginners need to overcome a pretty huge obstacle before embracing the power of Cycle.js: RxJS. Don't get me wrong, RxJS is a great library it's just not perfectly suited for the idea behind Cycle.js.

There is very little to learn about Cycle.js, it is more of an idea more than a complete library/framework. Once you get the idea behind Cycle.js (which is pretty easy) what you have to learn is **RxJS**. Be sure you know the different operators (at least those inside [rx.lite.js](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/libraries/lite/rx.lite.md)) and, most importantly, be sure that you **understand what are observables** by reading this [introduction to observables](http://reactivex.io/rxjs/manual/overview.html#subject).

One last thing, don't hesitate to ask questions on the [Cycle.js's gitter chan](https://gitter.im/cyclejs/core) ;)
