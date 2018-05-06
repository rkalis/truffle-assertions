const _ = require('lodash');
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
  return assertionMessage
}

assertEventListNotEmpty = (list, passedMessage, defaultMessage) => {
  const assertionMessage = createAssertionMessage(passedAssertionMessage, defaultMessage);
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

module.exports = {
  eventEmitted: (result, eventType, filter, message) => {
    /* Filter correct event types */
    const events = _.filter(result.logs, (entry) => {
      return entry.event === eventType;
    });
    assertEventListNotEmpty(events, message, `Event of type ${eventType} was not emitted`);

    /* Return if no filter function was provided */
    if (filter === undefined || filter === null) {
      return;
    }

    /* Filter correct arguments */
    let eventArgs = _.map(events, (entry) => {
      return entry.args;
    });
    eventArgs = _.filter(eventArgs, filter);
    assertEventListNotEmpty(eventArgs, message, `Event filter for ${eventType} returned no results`);
  },
  eventNotEmitted: (result, eventType, filter, message) => {
    /* Filter correct event types */
    const events = _.filter(result.logs, (entry) => {
      return entry.event === eventType;
    });

    /* Only check filtered events if there is no provided filter function */
    if (filter == undefined || filter === null) {
      assertEventListEmpty(events, message, `Event of type ${eventType} was emitted`);
      return;
    }

    /* Filter correct arguments */
    let eventArgs = _.map(events, (entry) => {
      return entry.args;
    });
    eventArgs = _.filter(eventArgs, filter);
    assertEventListEmpty(eventArgs, message, `Event filter for ${eventType} returned results`);
  }
}
