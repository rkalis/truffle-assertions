const AssertionError = require('assertion-error');

/* Creates a new assertion message, containing the passedAssertionMessage and
 * the defaultAssertion message when passedAssertionMessage exists, otherwise
 * just the default.
 */
createAssertionMessage = (passedMessage, defaultMessage) => {
  let assertionMessage = defaultMessage;
  if (passedMessage) {
    assertionMessage = `${passedMessage} : ${defaultMessage}`;
  }
  return assertionMessage;
}

assertEventListNotEmpty = (list, passedMessage, defaultMessage) => {
  const assertionMessage = createAssertionMessage(passedMessage, defaultMessage);
  if (!Array.isArray(list) || list.length === 0) {
    throw new AssertionError(assertionMessage);
  }
}

assertEventListEmpty = (list, passedMessage, defaultMessage) => {
  const assertionMessage = createAssertionMessage(passedMessage, defaultMessage);
  if (Array.isArray(list) && list.length !== 0) {
    throw new AssertionError(assertionMessage);
  }
}

/* Returns event string in the form of EventType(arg1, arg2, ...) */
getPrettyEventString = (eventType, args) => {
  let argString = '';
  Object.entries(args).forEach(([key, value]) => {
    argString += `, ${key}: ${value}`;
  });
  argString = argString.replace(', ', '');
  return `${eventType}(${argString})`;
}

/* Returns a list of all emitted events in a transaction,
 * using the format of getPrettyEventString
 */
getPrettyEmittedEventsString = (result) => {
  if (result.logs.length === 0) {
    return `    No events emitted in tx ${result.tx}\n`;
  }
  let string = `    Events emitted in tx ${result.tx}:\n`;
  string += `    ----------------------------------------------------------------------------------------\n`;
  for (const emittedEvent of result.logs) {
    string += `    ${getPrettyEventString(emittedEvent.event, emittedEvent.args)}\n`;
  }
  string += `    ----------------------------------------------------------------------------------------\n`;
  return string;
}

assertEventEmittedFromTxResult = (result, eventType, filter, message) => {
  /* Filter correct event types */
  const events = result.logs.filter((entry) => {
    return entry.event === eventType;
  });
  //TODO: Move the getPrettyEmittedEventsString to the assertion functions
  assertEventListNotEmpty(events, message, `Event of type ${eventType} was not emitted\n${getPrettyEmittedEventsString(result)}`);

  /* Return if no filter function was provided */
  if (filter === undefined || filter === null) {
    return;
  }

  /* Filter correct arguments */
  let eventArgs = events.map((entry) => {
    return entry.args;
  });
  eventArgs = eventArgs.filter(filter);
  assertEventListNotEmpty(eventArgs, message, `Event filter for ${eventType} returned no results\n${getPrettyEmittedEventsString(result)}`);
}

assertEventNotEmittedFromTxResult = (result, eventType, filter, message) => {
  /* Filter correct event types */
  const events = result.logs.filter((entry) => {
    return entry.event === eventType;
  });

  /* Only check filtered events if there is no provided filter function */
  if (filter == undefined || filter === null) {
    assertEventListEmpty(events, message, `Event of type ${eventType} was emitted\n${getPrettyEmittedEventsString(result)}`);
    return;
  }

  /* Filter correct arguments */
  let eventArgs = events.map((entry) => {
    return entry.args;
  });
  eventArgs = eventArgs.filter(filter);
  assertEventListEmpty(eventArgs, message, `Event filter for ${eventType} returned results\n${getPrettyEmittedEventsString(result)}`);
}

createTransactionResult = async (contract, transactionHash) => {
  /* Web3 1.x uses contract.getPastEvents, Web3 0.x uses contract.allEvents() */
  /* TODO: truffle-assertions 1.0 will only support Web3 1.x / Truffle v5 */
  if (contract.getPastEvents) {
    const transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
    const { blockNumber } = transactionReceipt;
    const eventList = await contract.getPastEvents("allEvents", {fromBlock: blockNumber, toBlock: blockNumber});
    return {
      tx: transactionHash,
      receipt: transactionReceipt,
      logs: eventList.filter(ev => ev.transactionHash === transactionHash)
    };
  } else {
    return new Promise((resolve, reject) => {
      const transactionReceipt = web3.eth.getTransactionReceipt(transactionHash);
      const { blockNumber } = transactionReceipt;
      contract.allEvents({fromBlock: blockNumber, toBlock: blockNumber}).get((error, events) => {
        if (error) reject(error);
        resolve({
          tx: transactionHash,
          receipt: transactionReceipt,
          logs: events.filter(ev => ev.transactionHash === transactionHash)
        });
      });
    });
  }
}

passes = async (asyncFn, message) => {
  try {
    await asyncFn;
  } catch (error) {
    const assertionMessage = createAssertionMessage(message, `Failed with ${error}`);
    throw new AssertionError(assertionMessage);
  }
}

fails = async (asyncFn, errorType, reason, message) => {
  try {
    await asyncFn;
  } catch (error) {
    if (errorType && !error.message.includes(errorType) ||
        reason && !error.message.includes(reason)) {
      const assertionMessage = createAssertionMessage(message, `Expected to fail with ${[errorType, reason].join(' ').trim()}, but failed with: ${error}`);
      throw new AssertionError(assertionMessage);
    }
    // Error was handled by errorType or reason
    return;
  }
  const assertionMessage = createAssertionMessage(message, 'Did not fail');
  throw new AssertionError(assertionMessage);
}

ErrorType = {
  REVERT: "revert",
  INVALID_OPCODE: "invalid opcode",
  OUT_OF_GAS: "out of gas",
  INVALID_JUMP: "invalid JUMP"
}

module.exports = {
  eventEmitted: (result, eventType, filter, message) => {
    assertEventEmittedFromTxResult(result, eventType, filter, message);
  },
  eventNotEmitted: (result, eventType, filter, message) => {
    assertEventNotEmittedFromTxResult(result, eventType, filter, message);
  },
  prettyPrintEmittedEvents: (result) => {
    console.log(getPrettyEmittedEventsString(result));
  },
  createTransactionResult: (contract, transactionHash) => {
    return createTransactionResult(contract, transactionHash);
  },
  passes: async (asyncFn, message) => {
    return passes(asyncFn, message);
  },
  fails: async (asyncFn, errorType, reason, message) => {
    return fails(asyncFn, errorType, reason, message);
  },
  reverts: async (asyncFn, reason, message) => {
    return fails(asyncFn, ErrorType.REVERT, reason, message);
  },
  ErrorType: ErrorType
}
