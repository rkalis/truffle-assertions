const AssertionError = require('assertion-error');
const web3 = require('web3');

/* Creates a new assertion message, containing the passedAssertionMessage and
 * the defaultAssertion message when passedAssertionMessage exists, otherwise
 * just the default.
 */
const createAssertionMessage = (passedMessage, defaultMessage) => {
  let assertionMessage = defaultMessage;
  if (passedMessage) {
    assertionMessage = `${passedMessage} : ${defaultMessage}`;
  }
  return assertionMessage;
};

const assertEventListNotEmpty = (list, passedMessage, defaultMessage) => {
  const assertionMessage = createAssertionMessage(passedMessage, defaultMessage);
  if (!Array.isArray(list) || list.length === 0) {
    throw new AssertionError(assertionMessage);
  }
};

const assertEventListEmpty = (list, passedMessage, defaultMessage) => {
  const assertionMessage = createAssertionMessage(passedMessage, defaultMessage);
  if (Array.isArray(list) && list.length !== 0) {
    throw new AssertionError(assertionMessage);
  }
};

/* Returns event string in the form of EventType(arg1, arg2, ...) */
const getPrettyEventString = (eventType, args) => {
  let argString = '';
  Object.entries(args).forEach(([key, value]) => {
    argString += `, ${key}: ${value}`;
  });
  argString = argString.replace(', ', '');
  return `${eventType}(${argString})`;
};

/* Returns a list of all emitted events in a transaction,
 * using the format of getPrettyEventString
 */
const getPrettyEmittedEventsString = (result) => {
  if (result.logs.length === 0) {
    return `    No events emitted in tx ${result.tx}\n`;
  }
  let string = `    Events emitted in tx ${result.tx}:\n`;
  string += '    ----------------------------------------------------------------------------------------\n';
  result.logs.forEach((emittedEvent) => {
    string += `    ${getPrettyEventString(emittedEvent.event, emittedEvent.args)}\n`;
  });
  string += '    ----------------------------------------------------------------------------------------\n';
  return string;
};

const assertEventEmittedFromTxResult = (result, eventType, filter, message) => {
  /* Filter correct event types */
  const events = result.logs.filter(entry => entry.event === eventType);

  // TODO: Move the getPrettyEmittedEventsString to the assertion functions
  assertEventListNotEmpty(events, message, `Event of type ${eventType} was not emitted\n${getPrettyEmittedEventsString(result)}`);

  /* Return if no filter function was provided */
  if (filter === undefined || filter === null) {
    return;
  }

  /* Filter correct arguments */
  let eventArgs = events.map(entry => entry.args);

  eventArgs = eventArgs.filter(filter);
  assertEventListNotEmpty(eventArgs, message, `Event filter for ${eventType} returned no results\n${getPrettyEmittedEventsString(result)}`);
};

const assertEventNotEmittedFromTxResult = (result, eventType, filter, message) => {
  /* Filter correct event types */
  const events = result.logs.filter(entry => entry.event === eventType);

  /* Only check filtered events if there is no provided filter function */
  if (filter === undefined || filter === null) {
    assertEventListEmpty(events, message, `Event of type ${eventType} was emitted\n${getPrettyEmittedEventsString(result)}`);
    return;
  }

  /* Filter correct arguments */
  let eventArgs = events.map(entry => entry.args);
  eventArgs = eventArgs.filter(filter);
  assertEventListEmpty(eventArgs, message, `Event filter for ${eventType} returned results\n${getPrettyEmittedEventsString(result)}`);
};

const createTransactionResult = async (contract, transactionHash) => {
  const transactionReceipt = web3.eth.getTransactionReceipt(transactionHash);
  const { blockNumber } = transactionReceipt;

  /* Web3 1.x uses contract.getPastEvents, Web3 0.x uses contract.allEvents() */
  /* TODO: truffle-assertions 1.0 will only support Web3 1.x / Truffle v5 */
  if (contract.getPastEvents) {
    const eventList = await contract.getPastEvents('allEvents', { fromBlock: blockNumber, toBlock: blockNumber });
    return {
      tx: transactionHash,
      receipt: transactionReceipt,
      logs: eventList.filter(ev => ev.transactionHash === transactionHash),
    };
  }

  return new Promise((resolve, reject) => {
    contract.allEvents({ fromBlock: blockNumber, toBlock: blockNumber }).get((error, events) => {
      if (error) reject(error);
      resolve({
        tx: transactionHash,
        receipt: transactionReceipt,
        logs: events.filter(ev => ev.transactionHash === transactionHash),
      });
    });
  });
};

const fails = async (asyncFn, errorType, reason, message) => {
  try {
    await asyncFn;
  } catch (error) {
    if (errorType && !error.message.includes(errorType)) {
      const assertionMessage = createAssertionMessage(message, `Expected to fail with ${errorType}, but failed with: ${error}`);
      throw new AssertionError(assertionMessage);
    } else if (reason && !error.message.includes(reason)) {
      const assertionMessage = createAssertionMessage(message, `Expected to fail with ${reason}, but failed with: ${error}`);
      throw new AssertionError(assertionMessage);
    }
    // Error was handled by errorType or reason
    return;
  }
  const assertionMessage = createAssertionMessage(message, 'Did not fail');
  throw new AssertionError(assertionMessage);
};

const ErrorType = {
  REVERT: 'revert',
  INVALID_OPCODE: 'invalid opcode',
  OUT_OF_GAS: 'out of gas',
  INVALID_JUMP: 'invalid JUMP',
};

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
  createTransactionResult: (contract, transactionHash) => (
    createTransactionResult(contract, transactionHash)
  ),
  fails: async (asyncFn, errorType, reason, message) => (
    fails(asyncFn, errorType, reason, message)
  ),
  reverts: async (asyncFn, reason, message) => (
    fails(asyncFn, ErrorType.REVERT, reason, message)
  ),
  ErrorType,
};
