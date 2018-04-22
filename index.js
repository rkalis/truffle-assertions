const _ = require('lodash');
const assert = require('chai').assert;

module.exports = {
  eventEmitted: (result, eventType, filter) => {
    const events = _.filter(result.logs, (entry) => {
      return entry.event === eventType;
    });
    assert.isNotEmpty(events, `Event of type ${eventType} was not emitted`);

    if (filter === null) {
        return;
    }

    let eventArgs = _.map(events, (entry) => {
        return entry.args;
    });
    eventArgs = _.filter(eventArgs, filter);
    assert.isNotEmpty(eventArgs, `Event filter for ${eventType} returned no results`);
  },
  eventNotEmitted: (result, eventType, filter) => {
    const events = _.filter(result.logs, (entry) => {
        return entry.event === eventType;
    });

    if (filter === null) {
        assert.isEmpty(events, `Event of type ${eventType} was emitted`);
        return;
    }

    let eventArgs = _.map(events, (entry) => {
        return entry.args;
    });
    eventArgs = _.filter(eventArgs, filter);
    assert.isEmpty(eventArgs, `Event filter for ${eventType} returned results`);
  }
}
