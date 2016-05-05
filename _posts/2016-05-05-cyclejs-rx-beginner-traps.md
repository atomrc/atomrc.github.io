---
layout: post
title: "Cycle.js, RxJS and cold observables"
categories: [Cycle.js, RxJS]
description: "Lesson learned the hard way: never dive into Cycle.js (+RxJS) without understanding cold/hot observables"
---

Recently, I think have had one of the worst debugging session of my developer's life. I was playing around with [Cycle.js](http://cycle.js.org/Cycle.js) having a lot of fun with the new toy I was given but, suddently, everything stopped to work.

Diving into Cycle.js without any knowledge of Observable and [**RxJS**](https://github.com/Reactive-Extensions/RxJS) is really tough (don't do it) but I was at a point where I feel I could do anything with Cycle.js. So as I was confidently coding my application but, at some point, it seemed my children components stopped sending outputs to their parents. I spent the next weekend trying to understand where the problem was, but wasn't able to reduce the problem to its simpliest form.

The main reason for this aweful moment was: I did not (nor took the time to) understand fully the different kind of observables there is and in particular how **cold observables** work.

NB: As I am writting this article, Cycle.js is being rewritted to work with any stream library (see [Cycle.js Diversity](https://github.com/cyclejs/core/issues/196)) and a stream library designed for Cycle.js is currently being built: [xstream](http://staltz.com/why-we-built-xstream.html). As xtream will be hot-observable-only, this article won't be relevant any more :)

## TLDR

Before diving in Cycle.js be sure you understand what observable are and, in particular, what is the difference between hot and cold observable (I suggest you read this great [introduction to observable](http://reactivex.io/rxjs/manual/overview.html#subject)) 

**The** source of my bug was that I had not in mind that a cold observable would play the whole observable chain as many times as there are subscribers to this observable chain.

## Symptoms of a bug

The situation was the following:

A component that is created depending on a, let say, a `user$` stream, that would output the corresponding `DOM` and `logoutAction$` stream :

```javascript
function UserContainer({DOM, user$}) {
    const logAction$ = DOM
        .select(".log")
        .events("click")
        .map(() => "log");

    /*
     * This would print a input each time the button is clicked
     * assuming we have a log function
     */
    logAction$.subscribe(log("UserContainer"));


    return {
        //what should be printed depending on the user
        DOM: user$.map((user) => div([
            span(".user-name", user.name),
            button(".log", "Log")
        ])),

        /*
         * the log action fired when the user clicks on the 
         * log button
         */
        logAction$: logAction$
    };
}

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
    userContainerLogAction$.subscribe(log("main function"));

    return {
        DOM: userContainerDOM$
    };
}
```

If you want to play with it, here is a [jsbin I created to reproduce the bug](https://jsbin.com/ropaqa/edit?js,console,output)

To summary the symptoms I had:

- I had no trouble receiving `click` events if I subscribe from inside the child component namely `UserContainer`;
- for some reason I could receive any `click` events from the function where I build the `UserContainer` component.

## Explanation

After a weekend of debugging I could finally figure out the reason for this strange behavior: **the way cold observable work**. In fact, with a cold observable the whole observable sequence is replayed for each and every subscriber of that observable. Here is an exemple :

````javascript
const values$ = Observable
    .just("test")
    .map(() =>
        /* just for the exemple.
         * avoid doing non deterministic
         * calls in your app's code
         */
        Math.floor(Math.random() * 10)
    );

value$.subscribe((value) => console.log("first sub: " + value));
value$.subscribe((value) => console.log("second sub: " + value));

/* output
 * Here I am
 * first sub: 7
 * Here I am
 * second sub: 5
 */
```

As you can the, the log `Here I am` is printed twice and the first subscriber doesn't get the same value as the second subscriber (resp `7` and `5`).

I my case I have that piece of code that is building the `UserContainer` component : 

```javascript
const userContainer$ = user$
    .map(user =>
        isolate(UserContainer)({DOM, user$: Observable.just(user)})
    )
```

And two streams that originate from the `userContainer$` stream :

````javascript
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
\*\*this last statement is only true because the UserContainer is `isolate`d

## The ridiculously simple solution

Well the solution to that issue could be more simple: transforming TODO

## Conclusion

Cycle.js beginners need to overcome a pretty huge obstacle before embracing the power of Cycle.js: RxJS. Don't get me wrong, RxJS is a great library it's just not really suited for the idea behind Cycle.js. The main problem reside in the fact that RxJS observables are, by default, **cold observables**. 


link to include
[introduction to reactive programming](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)
