---
title: "Fractal feature design"
categories: [frontend, architecture]
description: TODO
lang: en
---


Lately at Deezer I have been working on a feature that allows two devices to talk to one another.
Once connected they can exchange messages in a peer-to-peer style. Messages are actually commands that one device can ask the other to perform.

To go from a PoC (_proof-of-concept_), proving that the feature can be implemented, to a PoV (_proof-of-value_), proving that the feature has a market value, we needed to implement some monitoring mechanisms.

I wanted the monitoring to have the smallest possible impact on the already written code.  
My constraints were the following:

- not a single mention of the tracking mechanism should appear in the business code;
- it should be easy to activate/deactivate all tracking at once without breaking the feature.

# The business logic

Let's start by showing a bit of the code we are going to monitor.

Let's focus on the `sendCommand`. The name should be pretty self-explanatory but there is one particular bit about this method: It returns a `Promise` that resolves only when the other side has sent a special `done` message. Acknowledging that the message was received.

The code looks something like this (assuming we have a `peerConnection` object that allows low level message passing):

```js
class Connection {
  // ...
  sendCommand(message) {
    return new Promise((resolve, reject) => {
      const messageId = uuid(); // We generate an id for that message
      this.peerConnection.send(message);
      const handleAck = ({ type, ackId, err }) => {
        if (type === "ack" && ackId === messageId) {
          // If the message is a 'ack' of the sent message, we do not need to listen to messages anymore
          this.peerConnection.removeMessageListener(handleAck);
          // We let the consumer know that the message was sent and received
          return !err ? resolve() : reject(err);
        }
      };
      this.peerConnection.addMessageListener(handleAck);
    });
  }
}
```

There are quite a few things that could be tracked here. The metrics we actually want are the following:

- the number of successful messages;
- the number of failed messages;
- the time a message needs to do the round trip (between the message being sent and the `ack` being received).

# A naive implementation

Before over-engineering anything, we always need to start with the naive implementation. It is definitely not a bad thing to do, it usually helps clearing things up and having something that works before we can start cleaning it and optimising it.

The first thing that comes to mind is to add this directly in the code that actually sends the message:

```diff
class Connection {
  //...
  function sendCommand{
    return new Promise((resolve, reject) => {
      const messageId = uuid(); // We generate an id for that message
+     const timer = Date.now(); // Keep track of the time the message was sent at
      peerConnection.send(msg);
      function handleAck({ type, ackId, err }) {
        if (type === "ack" && ackId === messageId) {
+         const elapsed = Date.now() - timer;
+         trackMetrics('latency', elapsed);
+         if (err) {
+           trackMetrics('command_error', err);
+         } else {
+           trackMetrics('command_success');
+         }
          // If the message is a 'ack' of the sent message, we do not need to listen to messages anymore
          peerConnection.removeMessageListener(handleAck);
          // We let the consumer know that the message was sent and received
          return !err ? resolve() : reject(err);
        }
      }
      peerConnection.addMessageListener(handleAck);
    });
  }
}
```

This is a good solution to test where our hooks should be. It is also a fast way to actually test our metrics in a running environment.

But now it's quite a bit of code that polutes the actual business logic. The responsibility of the `sendCommand` has been diluted and is not clear anymore: it's role is both sending messages **and** tracking activity.

**Pros**:

- easy to implement
- centralised (monitoring is implemented once and work for every message sent)

**Cons**:

- intrusive (the business logic knows about monitoring)
- hard to disable/remove (need to comment or condition many lines with the risk of disabling lines of actual business logic)

# Moving the tracking logic to the parent

The `sendCommand` method returns an `Promise`. This is definitely something we can use.
Along with the value it holds, a `Promise` also carries around:

- the success state of the operation;
- the time the operation took to complete (or to fail).

This is exactly the information we need for our tracker.

Let's say the consumer does something like this:

```js
connection
  .sendCommand({ type: "play" /*...*/ })
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
  .sendCommand({ type: "play" /*...*/ })
  .then(() => {
+   trackMetrics('command_success');
    showSuccess();
  })
  .catch((err) => {
+   trackMetrics('command_error', err);
    showError(err);
  })
  .then(() => {
+   const elapsed = Date.now() - timer;
+   trackMetrics('latency', elapsed);
  });
```

**Pros**:

- easy to implement
- non intrusive (the business logic is left untouched)

**Cons**:

- decentralized (every call to `sendCommand` need to be modified)
- even harder to disable (need to disable **all** the placed where `sendCommand` is called)

# Extracting the monitoring logic to a separate unit

Our previous version allowed for the pure business logic of sending messages to be left untouched. This is good. But now it is our view layer that is ochestrating the monitoring.
Let's see if we can extract this logic somewhere else.

Another property of `Promise` is that it can be forked.
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
function trackCommand(commandPromise) {
  const timer = Date.now();
  commandPromise
    .then(() => {
      trackMetrics("command_success");
    })
    .catch((err) => {
      trackMetrics("command_failed", err);
    })
    .then(() => {
      const elapsed = Date.now() - timer;
      trackMetrics("latency", elapsed);
    });

  return commandPromise;
}
```

Here we just plug-in some callback to execute after the promise `resolve`/`reject` and we return the initial, unmodified, promise.

The TypesScript signature is the following `trackCommand(commandPromise: Promise<Payload>): Promise<Payload>`.

Now the view layer code looks like this:

```diff
-connection.sendCommand({ type: "play" /*...*/ })
+trackCommand(connection.sendCommand({ type: "play" /*...*/ }))
  .then(showSuccess)
  .catch(showError);
```

**Pros**:

- rather easy to implement
- a unit with a well defined responsibility
- low impact on the view layer
- no impact on the business logic

**Cons**:

- decentralised (every call to `sendCommand` need to be wrapped)
- hard to disable (every call to `sendCommand` need to be disabled)

# Events to the rescue

What we actually want is something that is completely transversal to our application code.
What if we could leave the view layer intact and have very limited impact on the business logic?

Let's do an attempt based on events.

Events are nice for completely decoupling business and plug-in features (like our tracking).

Let's go back to our `Connection` class

```diff
-class Connection {
+class Connection extends EventTarget {
  //...
  function sendCommand{
    return new Promise((resolve, reject) => {
      const messageId = uuid(); // We generate an id for that message
+     this.dispatchEvent(new CustomEvent('sendcommand', {detail: {id: messageId})));
      peerConnection.send(msg);
      function handleAck({ type, ackId, err }) {
        if (type === "ack" && ackId === messageId) {
+         this.dispatchEvent(new CustomEvent('ackcommand', {detail: {id: messageId, err}}));
          peerConnection.removeMessageListener(handleAck);
          return !err ? resolve() : reject(err);
        }
      }
      peerConnection.addMessageListener(handleAck);
    });
  }
}
```

Not so bad in term of modifications to the `Connection` class. At least the class does not have any idea we are tracking anything and it leaves the door open for implementating any other transversal behavior.

Now we can implement our monitoring module based on the `EventTarget` contract we just defined (I believe TypeScript will help reading the following):

```ts
function monitorConnection(connection: Connection) {
  const timers = new Map<string, number>();

  connection.addEventListener(
    "sendcommand",
    ({ detail }: CustomEvent<{ id: string }>) => {
      timers.set(detail.id, Date.now());
      trackMetrics("latency", Date.now() - timer);
    }
  );

  connection.addEventListener(
    "ackcommand",
    ({ detail }: CustomEvent<{ id: string; err: number }>) => {
      const timer = timers.get(detail.id);
      if (detail.err) {
        trackMetrics("command_error", detail.err);
      } else {
        trackMetrics("command_success", detail.err);
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

- centralised (all the monitoring logic is in a single place)
- a unit with a well defined responsibility (easily testable)
- low impact on the business logic
- very low impact on the global codebase
- can be disabled by commenting/conditioning **a single** line of the code

**Cons**:

- slightly harder to implement (the matching of message ids need to be manually done)