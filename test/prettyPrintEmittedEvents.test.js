const { assert } = require('chai');
const truffleAssert = require('..');

describe('prettyPrintEmittedEvents', () => {
  it('should initialise', () => {
    assert.isDefined(truffleAssert);
  });
});
