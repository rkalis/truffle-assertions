# truffle-assertions

This package adds additional assertions that can be used to test Ethereum smart contracts inside Truffle tests.

## Installation
truffle-assertions can be installed through npm:
```bash
npm install truffle-assertions
```

## Usage
To use this package, import it at the top of the Truffle test file:
```javascript
const truffleAssert = require('truffle-assertions');
```

## Assertions

### truffleAssert.eventEmitted(result, eventType, filter)
The `eventEmitted` assertion checks that an event with type eventType has been emitted by the transaction with result result. A filter function can be passed along to further specify requirements for the event arguments:

```javascript
truffleAssert.eventEmitted(result, 'TestEvent', (ev) => {
    return ev.param1 === 10 && ev.param2 === ev.param3;
});
```

When the filter parameter is set to null, the assertion checks just for event type:

```javascript
truffleAssertions.eventEmitted(result, 'TestEvent', null);
```

### truffleAssert.eventNotEmitted(result, eventType, filter)
The `eventNotEmitted` assertion checks that an event with type eventType has not been emitted by the transaction with result result. A filter function can be passed along to further specify requirements for the event arguments:

```javascript
truffleAssert.eventNotEmitted(result, 'TestEvent', (ev) => {
    return ev.param1 === 10 && ev.param2 === ev.param3;
});
```

When the filter parameter is set to null, the assertion checks just for event type:

```javascript
truffleAssertions.eventEmitted(result, 'TestEvent', null);
```
