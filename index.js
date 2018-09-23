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

createTransactionResult = (contract, transactionHash) => {
  return new Promise((resolve, reject) => {
    const transactionReceipt = web3.eth.getTransactionReceipt(transactionHash);
    const blockNumber = transactionReceipt.blockNumber;
    const allEvents = contract.allEvents({fromBlock: blockNumber, toBlock: blockNumber});
    allEvents.get((error, logs) => {
      if (error !== null)
        reject(error);
      resolve({
        tx: transactionHash,
        receipt: transactionReceipt,
        logs: logs.filter(log => log.transactionHash === transactionHash)
      });
    });
  });
}

reverts = async (promise, message) => {
  return promise.then(() => {
    const assertionMessage = createAssertionMessage(message, 'Did not revert');
    throw new AssertionError(assertionMessage);
  }).catch(error => {
    if (!error.message.includes("revert")) {
      const assertionMessage = createAssertionMessage(message, `Did not revert, but was rejected with: ${error}`);
      throw new AssertionError(assertionMessage);
    }
  });
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
  reverts: async (promise, message) => {
    return reverts(promise, message);
  }
}
