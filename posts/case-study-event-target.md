---
title: "Monitoring: A case study for EventTarget"
tags: [eventtarget, monitoring, architecture]
excerpt: Lately, at Deezer, I have been implementing monitoring for a feature I was working on. I took this opportunity to document how I designed the monitoring mechanism to be as non-intrusive as possible
lang: en
date: 2021-05-05
---

If you work for a data-driven company chances are you had to implement a tracker at some point.  
I often see this step being rushed and written straight into the business code.   
A lot of attention is given to having a clean implementation of the feature but little thoughts are given to how the tracking impacts the implementation.

Lately, at Deezer, I have been working on a feature that allows two devices to send messages to each other.  
I thought this would be a nice opportunity to document my usual approach to monitoring 🧑‍💻

For this, I set the following contraints:

- not a single mention of the tracking mechanism should appear in the business code;
- deactivating the tracking feature should be a single-line change.

## The business logic

We are going to focus on the method that sends a message to the remote peer.
The method sends a message on the connection and waits for the peer to reply with an `ack` message before resolving the returned `Promise`.  
(_The details of how the `ack` is matched is hidden in the `addAckListener` method for the sake of simplicity._)

```js
class Connection {
  // ...
  sendMessage(message) {
    const messageId = uuid();
    this.peerConnection.send({ id: uuid(), message });

    return new Promise((resolve, reject) => {
      this.addAckListener(messageId, (error?: number) => {
        return error ? reject(error) : resolve();
      });
    });
  }
}
```

The metrics we want to monitor are the following:

- the number of successful messages;
- the number of failed messages;
- the time a message needs to do the round trip (between the message being sent and the `ack` being received).

## A naive implementation

Before over-engineering anything I find it useful to start-off with a naive implementation.  
It usually helps me clearing up the contraints before extracting them somewhere else.

The first thing that comes to mind is to add the tracking bits directly into the code that actually sends the message... Let's go for it 🤓

```diff
class Connection {
  // ...
  sendMessage(message) {
    const messageId = uuid();
    this.peerConnection.send({ id: uuid(), message });
+   const timer = Date.now(); // Keep track of the time the message was sent at

    return new Promise((resolve, reject) => {
      this.addAckListener(messageId, (error?: number) => {
+       const elapsed = Date.now() - timer;
+       trackMetrics('latency', elapsed);
+       if (err) {
+         trackMetrics('message_error', err);
+       } else {
+         trackMetrics('message_success');
+       }
        return error ? reject(error) : resolve();
      });
    });
  }
```

That is quite a bit of code that pollutes the actual business logic. The responsibility of the `sendMessage` has been altered. It cannot be described without an "and" in the sentence: It sends messages **and** tracks metrics.

**Pros**:

- 👌 easy to implement (almost a no-brainer)
- 👌 factorised (monitoring is implemented once and work for every message sent)

**Cons**:

- 👎 strong impact on the business logic
- 👎 not trivial to deactivate (need to comment or condition many lines with the risk of disabling lines of actual business logic)

## Moving the tracking logic to the parent

The `sendMessage` method returns a `Promise`. This is definitely something we can use!

Along with the value it holds, a `Promise` also carries around:

- the success state of the operation;
- the time the operation took to complete (or to fail).

This is exactly the pieces of information we need for our tracker 👌

Let's say the consumer does something like this:

```js
connection
  .sendMessage({ type: "play" /*...*/ })
  .then(() => {
    showSuccess();
  })
  .catch((err) => {
    showError(err);
  });
```

We could easily plug our tracking mechanism right here:

```diff
+const timer = Date.now();
connection
  .sendMessage({ type: "play" /*...*/ })
  .then(() => {
+   trackMetrics('message_success');
    showSuccess();
  })
  .catch((err) => {
+   trackMetrics('message_error', err);
    showError(err);
  })
  .then(() => {
+   const elapsed = Date.now() - timer;
+   trackMetrics('latency', elapsed);
  });
```

**Pros**:

- 👌 easy to implement
- 👌 non intrusive (the business logic is left untouched)

**Cons**:

- 👎 unfactorised (every call to `sendMessage` need to be modified)
- 👎 even harder to disable (need to disable **all** the placed where `sendMessage` is called)

## Extracting the monitoring logic to a separate unit

Our previous version allowed for the pure business logic to be left untouched. This is good. But now it is our view layer that is orchestrating the monitoring.

Maybe we could try to extract this logic somewhere else.

Another property of `Promise` is that it can be **forked**.

It is well known that `Promise` can be chained:

```js
promise.then(doStuff).then(doOtherStuff);
```

But we often forget that it can also be forked:

```js
promise.then(doStuff);
promise.then(doOtherStuff);
```

We could use that property to clean our view layer code.

This would be our implementation of our monitoring tool:

```js
function trackMessage(messagePromise) {
  const timer = Date.now();
  messagePromise
    .then(() => {
      trackMetrics("message_success");
    })
    .catch((err) => {
      trackMetrics("message_failed", err);
    })
    .then(() => {
      const elapsed = Date.now() - timer;
      trackMetrics("latency", elapsed);
    });

  return messagePromise;
}
```

Here we just plug-in some callback to execute after the promise `resolve`/`reject` and we return the initial, unmodified, promise.

The TypesScript signature is the following `trackMessage(messagePromise: Promise<Payload>): Promise<Payload>`.

Now the view layer code looks like this:

```diff
-connection.sendMessage({ type: "play" /*...*/ })
+trackMessage(connection.sendMessage({ type: "play" /*...*/ }))
  .then(showSuccess)
  .catch(showError);
```

**Pros**:

- 👌 rather easy to implement
- 👌 a unit with a well defined responsibility (easy to test)
- 👌 low impact on the view layer
- 👌 no impact on the business logic

**Cons**:

- 👎 unfactorised (every call to `sendMessage` need to be wrapped)
- 👎 hard to disable (every call to `sendMessage` need to be disabled)

## Events to the rescue

What we actually want is something that is completely transversal to our application code.
What if we could leave the view layer intact and have very limited impact on the business logic?

Let's do an attempt based on events.

Events are nice for decoupling entirely business and plug-in features (like our tracking).

Let's go back to our `Connection` class

```diff
-class Connection {
+class Connection extends EventTarget {
  //...
  function sendMessage{
    return new Promise((resolve, reject) => {
      const messageId = uuid(); // We generate an id for that message
+     this.dispatchEvent(new CustomEvent('sendmessage', {detail: {id: messageId})));
      peerConnection.send(msg);
      function handleAck({ type, ackId, err }) {
        if (type === "ack" && ackId === messageId) {
+         this.dispatchEvent(new CustomEvent('ackmessage', {detail: {id: messageId, err}}));
          peerConnection.removeMessageListener(handleAck);
          return !err ? resolve() : reject(err);
        }
      }
      peerConnection.addMessageListener(handleAck);
    });
  }
}
```

Our business code needed a few modifications, that's true, but these are quite generic changes that are unrelated to tracking. You can think of it this way: if you extract this module to an external library, **it has no unexpected side effects**.

Now we can implement our monitoring module based on the `EventTarget` contract we just defined (I believe TypeScript will help reading the following):

```ts
function monitorConnection(connection: Connection) {
  const timers = new Map<string, number>();

  connection.addEventListener(
    "sendmessage",
    ({ detail }: CustomEvent<{ id: string }>) => {
      timers.set(detail.id, Date.now());
      trackMetrics("latency", Date.now() - timer);
    }
  );

  connection.addEventListener(
    "ackmessage",
    ({ detail }: CustomEvent<{ id: string; err: number }>) => {
      const timer = timers.get(detail.id);
      if (detail.err) {
        trackMetrics("message_error", detail.err);
      } else {
        trackMetrics("message_success", detail.err);
      }
      trackMetrics("latency", Date.now() - timer);
    }
  );
}
```

Finally we need to plug that code somewhere. This time it is going to be in the glue code that instantiate the `Connection`.

```diff
const connection = new Connection(/*...*/);

+monitorConnection(connection);

//...
connection.sendMessage(message);
```

**Pros**:

- 👌 factorised (all the monitoring logic is in a single place)
- 👌 a unit with a well defined responsibility (easily testable)
- 👌 low impact on the business logic
- 👌 very low impact on the global codebase
- 👌 trivial to deactivate (can be disabled by commenting/conditioning **a single** line of the code)

**Cons**:

- 👎 slightly harder to implement (the matching of message ids need to be manually done)

## Conclusion

Tracking is an excellent use case for `EventTarget`. It allows for the business code to be very generic and the tracking mechanism to be very distant from your application code.

In general `Events` are tailored for those kind of scenarios: Having something that work in parallel to something else.
The `DOM` API works this way!  
The `DOM` itself is made to display things but it allows us to hook into events that happen on the presentational layer. With a few `addEventListener` we can add very complex behaviours on top of the `DOM` but the `DOM` never knows about those.

This is the beauty of it, there is a generic contract (eg. 'I will send a `click` event whenever the user clicks somewhere' or 'I will send a `sendmessage` event every time a message is being sent') that allows us, web developer, to add behavior on top of it.

Word of caution, though, `Events` are great but should not be overused. Keep in mind that they can blur the readability of the codebase if used for core behaviours. In those cases coupling is the way to go 🙂
