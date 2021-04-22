---
title: "Fractal application design"
categories: [frontend, architecture]
description: TODO
lang: en
---

If you know me a little, you probably know that I am a big fan of [Cycle.js](https://cycle.js.org/).  
There are quite a few aspects of Cycle.js that I love! The fact that 100% of your application code is pure is definitly one of them!  
But one that has particularly influenced the way I design frontend web applications is the fractal nature of the Cycle architecture.

# Cycle.js and fractality

This is the signature of your typical Cycle.js application:

```ts
type App = (sources: Sources) => Sinks;
```

Where `Sources` are all the streams that the application will read from (`DOM` events, `HTTP` responses...) and `Sinks` are all the side effects that your application will do.

And here is what the signature of a component looks like:

```ts
type Component = (sources: Sources) => Sinks;
```

Notice anything?  
Right, it's exactly the same signature

You could agrue that `React` is fractal as well since the main `App` and any `Component` will share the same signature `(props) => React.ReactNode`.  
The difference lies in the fact that `React` only makes rendering fracal while Cycle.js levrages fracality for all the side effects of your application.

Let's see what that means exactly

# Rendering fractality vs. Full fractality

As an example, let's take a simple component that displays user info

```tsx
const ReactUser = ({ user }) => {
  return <div>{user.name}</div>;
};
```

And here is how it would look like with a Cycle.js component:

```ts
const CycleUser = ({ user }) => {
  return {
    DOM: xs.of(div(user.name)),
  };
};
```

Both signatures are quite similar at this point:

```ts
type ReactUser = ({ user }: { user: User }) => React.ReactNode;

// vs.

type CycleUser = ({ user }: { user: User }) => { DOM: Stream<VNode> };
```

Let's now make this component responsible for fetching the user given its `id`

```tsx
const ReactUser = ({ id }) => {
  const [user, setUser] = useState(null);

  useEffect(async () => {
    const response = await fetch(`/users/${id}`);
    const user = await response.json();
    setUser(user);
  });

  return <div>{user.name}</div>;
};
```

```ts
const CycleUser = ({ HTTP, props }) => {
  const user$ = HTTP.select("user")
    .flatten()
    .map((response) => response.json())
    .startWith(null);

  return {
    DOM: user$.map((user) => div(user.name)),
    HTTP: xs.of({ url: `/user/${props.id}`, category: "user" }),
  };
};
```

Now the React component's signature has almost not moved at all (except for the properties not being the same).  
The Cycle component on the other hand has changed quite a bit

```ts
type ReactUser = ({ id }: { id: string }) => React.ReactNode;

// vs.

type CycleUser = ({
  HTTP,
  props,
}: {
  HTTP: Stream<HTTPResponses>;
  props: { id: string };
}) => { DOM: Stream<VNode>; HTTP: Stream<HTTPRequest> };
```

The beauty of this is that the side effects are explicitely shown by the signature of the component.  
No need to read the code, you already know it's going to perform a HTTP request without even looking at the implementation.

In this example, `React` stays fractal but keep in mind that it is fractal **because it doesn't deal with side effects other than rendering side effects**.
While Cycle.js stays fractal while handeling all possible side effects.

The comparison here is not entirely fair. We are comparing a library on one hand and a framework on the other hand.

You can thing of it this way: **You could totally use React inside of a Cycle.js app**.  
That is, actually, what [Andre Staltz](https://twitter.com/andrestaltz), the creator of Cycle.js, is doing with [manyverse](https://gitlab.com/staltz/manyverse#manyverse) (he uses React Native inside a Cycle.js app)

React does not decide for you how you should handle your side effects. And this is usually where fractality get lost.

# Redux: the fractality killer

As your React app grows, you will need to ask yourself how you will handle your state and your side effects.  
Redux is a quite popular choice.

Although Redux has a rather strong promise (namely: _have your application being a function of your state_), it comes at the fractality price.

We can easily highligth this by implementing a simple feature with both Redux and Cycle.js.

Let's add a feature that displays the user's blog posts.

## The blog posts feature (Redux)

We will have to create at least 2 entities in order to add our blog post feature in our app:

- a reducer
- a view
- an action creator (optional)

With our freshly backed feature, your app structure looks something like this:

```diff
└── src
    ├── index.js
    ├── actions
+   │   ├── blogPosts.js
    │   └── user.js
    ├── components
+   │   ├── BlogPosts.jsx
    │   └── User.jsx
    └── reducers
+       ├── blogPosts.js
        └── user.js
```

Plus we have to modify the `index.jsx` file a bit to combine the reducers and the view together

```diff
+import BlogPost from 'components/BlogPost';
+import blogPostReducer from 'reducers/blogPost';
import User from 'components/User';
import userReducer from 'reducers/user';

// ...

const store = createStore(combineReducers({
  user: userReducer,
+ posts: blogPostReducer
}))

// ...

return (<>
  <User />
  <OtherComponent />
+ <BlogPosts />
</>)
```

## The blog post feature (Cycle.js)

With Cycle.js we could implement this in a single file and have very limited impact on the main `index.js` file.

```diff
└── src
    ├── index.js
    ├── components
+   │   ├── user.js
    │   └── blogPosts.js
```

The changes to `index.js` will look something like this:

```diff
+import BlogPosts from 'components/blogPosts';
import User from 'components/User';

// ...

function App(sources) {
+ const blogPosts = BlogPosts(sources);
  const otherComponent = BlogPosts(sources);
  const user = User(sources);
  return {
-   DOM: xs.combine(user.DOM, otherComponent.DOM).map(([user, other]) => div([user, other])),
+   DOM: xs.combine(user.DOM, otherComponent.DOM, blogPost.DOM).map(([user, other, posts]) => div([user, other, posts])),
-   HTTP: xs.merge(user.DOM, otherComponent.DOM),
+   HTTP: xs.merge(user.DOM, otherComponent.DOM, blogPost.DOM),
  }
}
```

Everything is **self-contained** in the `user.js` file (which of course you could split into multiple files if it grows big). 

## A case study: deactivating the blog post feature

Let's see the benefit of fractal design in action with a case study. 
Let's say we want to conditionnaly disable the feature for a bunch of users. 

With Redux 
