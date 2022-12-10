---
title: "Coupling and cohesion"
tags: [javascript, architecture]
excerpt: Clean Code
lang: en
date: 2022-08-28
---

This summer, I finally took the time to read _clean code_ by _Robert C. Martin_.
It's a good read and was a good way, for me, to put proper names on concepts I discovered throuhout my programmer's experience.

One of the most notable concept I discovered are the coupling and cohesion metrics.
I was very aware of the coupling notion and knew that we should always aim for the looseliest coupling between our module but reading about it gave me more insight on how to recognize tightly coupled modules, how to fix them and how to measure coupling.

This article is a way for me to put in my own words what I have read this summer.

## Coupling can be measured

I often find discussion about clean code to be very subjective. Someone will find this piece of code "clean" others will think the other way around and we end up in discussions that are only about our personnal preferences rather than formal metrics.

Programming is never going to be an exact sience and there will always be personal preferences in the equation. It's written and read by humans, so it has to be human.

When it comes to personal preferences, I find debates to be quite sterile and do not bring anything to the table. Either you have a measurable formal argument against a particular piece of code, then it can be discussed if not the debate will most likely end up in frustration.

Realizing that coupling can be actually measured and reduced to a number give a whole new set of formal arguments to argue whether a piece of code is clean or not.

formulae:

- data params
- control params (used in a if)
- data outputs
- control outputs

- global data used
- global control used

- modules consumed
- modules calling this module

M  di  (a  ci)  d o  (b  co)  g d  (c  gc)  w  r

## Example of tigth coupling and loose coupling

```js
function double(x) {
  return x * 2;
}
```

This module would have the lowest possible coupling index.
Here we have:

- 1 data input
- 1 data output
- 1 module consumed (itself)

So the formulae would go

1 - 1 / (1 + 0 + 1 + 0 + 0 + 0 + 1 + 0) = 0.67

This is the lowest possible value you could get for a module coupling.

Now, for the sake of exercice, let's try to maximize the coupling of a module

```js
import value from "./multiplyValue"; // One module consumed

function mutliply(x /*One data input*/, doCompute /* One control input */) {
  if (!doCompute) {
    return x;
  }
  if (window.useGlobalFactor) {
    /* One global variable used for control */ return (
      x * window.factor
    ); /* One global variable used */
  }
  return x * value;
}
```

1 - 1 / (1 + 2 + 1 + 0 + 1 + 2 + 1 + 0) = 0.875

Those examples are only here to hightlight how the coupling index evolves. The exact numbers are not really important, what is important is to understand what factors actually influence the result.

Understanding that consuming a global variable costs more than passing a parameter is what, I believe, is beneficial for a fellow developer.

## Putting the formula to good use

Althought I really like the idea of having a single metrics that can give me an impression of the health condition of my codebase, I don't find this particular formula to be very useful.

What I find really interesting with this formula is that it gives a sense of what can affect our codebase maintainability and readability.
To me, it's precious, because it gives weight to each architecture choice that we can make when creating a modules (does this module consumes a global variable => +2 points). But too me it's too generic to fit anything in particular.
There are also some concepts that I don't understand with it (like what is an output control parameter, I do not know).

```jsx
import loadTweets from "lib/twitter";

function Tweets() {
  const [tweets, setTweets] = useState();
  useEffect(() => {
    loadTweets().then((loadedTweets) => setTweets(loadedTweets));
  });

  return (
    <ul>
      {tweets.map((tweet) => (
        <li>tweets.text</li>
      ))}
    </ul>
  );
}
```

```jsx
function Tweets({ loadTweets }) {
  useEffect(() => {
    loadTweets().then((loadedTweets) => setTweets(loadedTweets));
  }, []);

  return (
    <ul>
      {tweets.map((tweet) => (
        <li>tweets.text</li>
      ))}
    </ul>
  );
}
```
