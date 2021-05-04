---
title: "Fractal feature design"
categories: [frontend, architecture]
description: TODO
lang: en
---

Lately at Deezer I have been working on a feature that allows two devices to talk to one another.
Once connected they can exchange messages in a peer-to-peer style. Messages are actually commands that one device can ask to other to perform.

To go from a PoC (_proof-of-concept_), proving that the feature can be implemented, to a PoF (_proof-of-value_), proving that the feature has a market value, we needed to implement some monitoring mechanisms.

I wanted the monitoring to have the smallest possible impact on the already written code.
My constraints were the following:

- not a single mention of the tracking mechanism should appear in the business code;
- the tracking module should be easy to extend;
- it should be easy to activate/deactivate all tracking at once without beaking the feature.

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

Before overengineer anything, we always need to start with the naive implementation. It is definitly not a bad thing to do, it usually helps clearing things up and having something that works before we can start cleaning it and optimizing it.

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
+           trackMetrics('message_failed', err);
+         } else {
+           trackMetrics('message_success');
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
We have lost something along the way

# Events to the rescue

What if, instead of actually tracking, our `sendMethod` new responsability is to warn potential listeners that something happened?

Let's use `Events` to help us with this task:

```diff
class Connection {
  // ...
  sendCommand(message) {
    return new Promise((resolve, reject) => {
      const messageId = uuid(); // We generate an id for that message
+     this.dispatchEvent('messagesend', {messageId});
      this.peerConnection.send(message);
      const handleAck = ({ type, ackId, err }) => {
        if (type === "ack" && ackId === messageId) {
+         this.dispatchEvent('messageack', {messageId, err});
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

From the business logic point of view, we are far better. The `sendCommand` method doesn't have any idea there is some tracking mechanism sitting somewhere. It doesn't care about it.

We can now implement our tracking logic completely separated from the message sending logic:

```js
addTracking(connection) {
  let timer;
  connection
}
```
