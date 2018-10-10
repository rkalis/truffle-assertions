# truffle-assertions

[![Build Status](https://travis-ci.org/rkalis/truffle-assertions.svg?branch=v1.0)](https://travis-ci.org/rkalis/truffle-assertions)
[![Coverage Status](https://coveralls.io/repos/github/rkalis/truffle-assertions/badge.svg)](https://coveralls.io/github/rkalis/truffle-assertions)
[![NPM Version](https://img.shields.io/npm/v/truffle-assertions.svg)](https://www.npmjs.com/package/truffle-assertions)
[![NPM Monthly Downloads](https://img.shields.io/npm/dm/truffle-assertions.svg)](https://www.npmjs.com/package/truffle-assertions)
[![NPM License](https://img.shields.io/npm/l/truffle-assertions.svg)](https://www.npmjs.com/package/truffle-assertions)

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

## Exported functions

### truffleAssert.eventEmitted(result, eventType[, filter][, message])
The `eventEmitted` assertion checks that an event with type `eventType` has been emitted by the transaction with result `result`. A filter function can be passed along to further specify requirements for the event arguments:

```javascript
truffleAssert.eventEmitted(result, 'TestEvent', (ev) => {
    return ev.param1 === 10 && ev.param2 === ev.param3;
});
```

When the `filter` parameter is omitted or set to null, the assertion checks just for event type:

```javascript
truffleAssert.eventEmitted(result, 'TestEvent');
```

Optionally, a custom message can be passed to the assertion, which will be displayed alongside the default one:

```javascript
truffleAssert.eventEmitted(result, 'TestEvent', (ev) => {
    return ev.param1 === 10 && ev.param2 === ev.param3;
}, 'TestEvent should be emitted with correct parameters');
```

The default messages are
```javascript
`Event of type ${eventType} was not emitted`
`Event filter for ${eventType} returned no results`
```
Depending on the reason for the assertion failure. The default message also includes a list of events that were emitted in the passed transaction.

### truffleAssert.eventNotEmitted(result, eventType[, filter][, message])
The `eventNotEmitted` assertion checks that an event with type `eventType` has not been emitted by the transaction with result `result`. A filter function can be passed along to further specify requirements for the event arguments:

```javascript
truffleAssert.eventNotEmitted(result, 'TestEvent', (ev) => {
    return ev.param1 === 10 && ev.param2 === ev.param3;
});
```

When the `filter` parameter is omitted or set to null, the assertion checks just for event type:

```javascript
truffleAssert.eventNotEmitted(result, 'TestEvent');
```

Optionally, a custom message can be passed to the assertion, which will be displayed alongside the default one:

```javascript
truffleAssert.eventNotEmitted(result, 'TestEvent', null, 'TestEvent should not be emitted');
```

The default messages are
```javascript
`Event of type ${eventType} was emitted`
`Event filter for ${eventType} returned results`
```
Depending on the reason for the assertion failure. The default message also includes a list of events that were emitted in the passed transaction.

### truffleAssert.prettyPrintEmittedEvents(result)
Pretty prints the full list of events with their parameters, that were emitted in transaction with result `result`

```javascript
truffleAssert.prettyPrintEmittedEvents(result);
```
```
Events emitted in tx 0x7da28cf2bd52016ee91f10ec711edd8aa2716aac3ed453b0def0af59991d5120:
----------------------------------------------------------------------------------------
TestEvent(testAddress = 0xe04893f0a1bdb132d66b4e7279492fcfe602f0eb, testInt: 10)
----------------------------------------------------------------------------------------
```

### truffleAssert.createTransactionResult(contract, transactionHash)
There can be times where we only have access to a transaction hash, and not to a transaction result object, such as with the deployment of a new contract instance using `Contract.new();`. In these cases we still want to be able to assert that certain events are or aren't emitted.

`truffle-assertions` offers the possibility to create a transaction result object from a contract instance and a transaction hash, which can then be used in the other functions that the library offers.

```javascript
let contractInstance = await Contract.new();
let result = await truffleAssert.createTransactionResult(contractInstance, contractInstance.transactionHash);

truffleAssert.eventEmitted(result, 'TestEvent');
```

### truffleAssert.fails(asyncFn[, errorType][, reason][, message])
Asserts that the passed async contract function fails with a certain ErrorType and reason.

The different error types are defined as follows:
```
ErrorType = {
  REVERT: "revert",
  INVALID_OPCODE: "invalid opcode",
  OUT_OF_GAS: "out of gas",
  INVALID_JUMP: "invalid JUMP"
}
```

```javascript
await truffleAssert.fails(
    contractInstance.methodThatShouldFail(),
    truffleAssert.ErrorType.OUT_OF_GAS
);
```

A reason can be passed to the assertion, which functions as an extra filter on the revert reason (note that this is only relevant in the case of revert, not for the other ErrorTypes). This functionality requires at least Truffle v0.5.

```javascript
await truffleAssert.fails(
    contractInstance.methodThatShouldFail(),
    truffleAssert.ErrorType.REVERT,
    "only owner"
);
```

If the errorType parameter is omitted or set to null, the function just checks for failure, regardless of cause.

```javascript
await truffleAssert.fails(contractInstance.methodThatShouldFail());
```

Optionally, a custom message can be passed to the assertion, which will be displayed alongside the default one:

```javascript
await truffleAssert.fails(
    contractInstance.methodThatShouldFail(),
    truffleAssert.ErrorType.OUT_OF_GAS,
    null,
    'This method should run out of gas'
);
```

The default messages are
```javascript
'Did not fail'
`Expected to fail with ${errorType}, but failed with: ${error}`
```

### truffleAssert.reverts(asyncFn[, reason][, message])
This is an alias for `truffleAssert.fails(asyncFn, truffleAssert.ErrorType.REVERT[, reason][, message])`.

```javascript
await truffleAssert.reverts(
    contractInstance.methodThatShouldRevert(),
    "only owner"
);
```
